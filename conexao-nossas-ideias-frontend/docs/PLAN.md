# Frontend implementation plan

Source of truth for the UI: Pencil file `../../sicredi_nossas_ideias.pen`. The tokens and the component → MUI mapping are in `CLAUDE.md`.
Functional source of truth: the challenge spec (`../conexao-nossas-ideias-backend/docs/Desafio_Tecnico_Assessor_Desenvolvimento_Sistemas-v2.pdf`). The deadline is **12/10/2026**.

Scope: 3 pages (**Signin**, **Dashboard**, **Solicitações**) and 3 modals (**Nova Solicitação**, **Alterar Status**, **Decisão Final**).

| Pencil frame | Route / component |
|---|---|
| Login — Entrar | `app/(auth)/signin/page.tsx` |
| Dashboard — Visão Geral | `app/(app)/dashboard/page.tsx` |
| Dashboard — Modal Nova Solicitação | `NewRequestDialog` (opened from Dashboard and Solicitações) |
| Solicitações — Consulta | `app/(app)/solicitacoes/page.tsx` |
| Solicitações — Modal Alterar Status | `ChangeStatusDialog` |
| Solicitações — Modal Decisão Final | `DecisionDialog` |

---

## 0. Design ↔ API gaps (decide before/while coding)

The design shows more than the backend currently supports. Each item below has a recommended resolution.

| # | Design element | Backend today | Recommendation |
|---|---|---|---|
| G1 | Browser calls 3000 → 3001 | No CORS | **Backend:** `app.enableCors({ origin: 'http://localhost:3000' })` in `main.ts`. |
| G2 | Table shows Departamento and Solicitante **names** | `GET /requests` returns raw `areaId` / `requester` UUIDs | **Backend:** `include: { user: { select: { name } }, area: { select: { name } } }` in `findAll`/`findOne`. |
| G3 | Pagination "Exibindo 1–10 de 248", page count | Returns a bare array, no total | **Backend:** return `{ data, meta: { total, page, limit, totalPages } }` (use `count` + `findMany` in a `$transaction`). |
| G4 | "Ordenar por data" (required by spec 4.2) | Fixed `createdAt desc` | **Backend:** add `order?: 'asc' \| 'desc'` to `FindRequestsDto`. |
| G5 | Dashboard metrics, priority chart, status donut, quick-status pill counts | No aggregate endpoint | **Backend:** `GET /requests/summary` → `{ total, byStatus: {PENDING, UNDER_REVIEW, APPROVED, REJECTED}, byPriority: {LOW, MEDIUM, HIGH} }` using `groupBy`. Optionally accept a `from` date for the period select. |
| G6 | "Tipo de registro: Solicitação / Ideia" toggle and codes `SOL-1042` / `IDE-0318` | No `type` field, ids are UUIDs | **Drop for MVP**: hide the toggle and show a short id (`#` + first 8 chars of the UUID). Note it in the README as a future evolution. |
| G7 | Requester field (locked, "Preenchido com seu usuário") | `CreateRequestDto.requester` is sent by the client | Frontend sends `requester = me.id` from `GET /users/me`. (Better: the backend reads `request.userId` from the JWT. Suggest it as a backend follow-up.) |
| G8 | Metric deltas ("+12% vs. mês anterior"), "Últimos 30 dias" select, bar chart **by month** | Not available | MVP: render the priority chart as a single grouped bar (totals by priority), hide deltas, and omit the period select or make it cosmetic. Monthly series only if G5 gains a `byMonth` field. |
| G9 | Sidebar "Usuários e acessos", "Configurações"; top-bar notifications/help; login "Lembrar de mim" / "Esqueci minha senha" | Not in scope | Render as **disabled** (tooltip "Em breve"). Top-bar search navigates to `/solicitacoes?search=…`. |
| G10 | Who can change status / decide? | `role` is `MANAGER \| ASSISTANT`, no authorization checks | MVP: everyone can do it. If time allows, hide the decision actions for `ASSISTANT` (frontend) and add a roles guard (backend). |

### Decisions (2026-10-07)

- **G1–G5:** implement in the backend (step 1).
- **G6, G8, G9:** cut for the MVP as recommended.
- **G7:** the backend takes the requester from the JWT (`request.userId`), and `requester` is removed from `CreateRequestDto`. The frontend only displays `me.name`.
- **G10:** enforced **in the frontend**. Only `MANAGER` sees and uses "Alterar status" and "Decisão final". Everything else, including deleting `PENDING` requests, stays available to both roles.
- **Status flow** (PENDING → UNDER_REVIEW → APPROVED/REJECTED) is enforced **in the frontend only**. The API stays permissive.
- **Git:** never commit on `main`. Backend work goes on a new branch from `backend`; frontend work goes on a new branch from `frontend`.

Enum ↔ label mapping (single source in `lib/requests/labels.ts`):
- Status: `PENDING` = **Aberta**, `UNDER_REVIEW` = **Em análise**, `APPROVED` = **Aprovada**, `REJECTED` = **Rejeitada**
- Priority: `LOW` = **Baixa**, `MEDIUM` = **Média**, `HIGH` = **Alta**
- Area ("Departamento" in the design): `GET /areas` → `{ id, name, type: AGENCY | HEADQUARTERS }`. Group the select options by `type` ("Agências" / "Sede").

---

## 1. Foundation

1. **Dependencies:** `@mui/material @mui/icons-material @mui/material-nextjs @emotion/react @emotion/styled @emotion/cache @mui/x-charts`. Before wiring the provider, read `node_modules/next/dist/docs/01-app/02-guides/css-in-js.md`.
2. **Theme** in `theme/theme.ts`, built from the Pencil tokens in CLAUDE.md:
   - Palette (primary/secondary/background/text/divider/error/warning), `shape.borderRadius: 8`.
   - Typography: Exo 2 for `h1–h6`, Roboto for the rest, loaded with `next/font/google` and passed in as CSS variables.
   - Component overrides: `MuiButton` (no uppercase, 15/500, padding 10×22, contained-secondary shadow), `MuiOutlinedInput` (56px, `outline` border), `MuiDialog` (600px, radius 8), `MuiTableHead` (`bg` background, 12px secondary text), `MuiCard` (outlined + light shadow), `MuiListItemButton` (selected state = `primary-tint`/`primary`).
3. **Root layout:** `AppRouterCacheProvider` + `ThemeProvider` + `CssBaseline` (client `Providers` component), `lang="pt-BR"`, and updated metadata ("Conexão Nossas Ideias"). Remove the scaffold content in `app/page.tsx` and redirect `/` to `/dashboard`.
4. **Env:** `NEXT_PUBLIC_API_URL` in `.env.local` (`http://localhost:3001`). Fix the Dockerfile (`EXPOSE 3000`, plus `ARG`/`ENV NEXT_PUBLIC_API_URL` before `npm run build`) and pass it as a build arg in compose.

## 2. API layer and auth

1. `lib/api/client.ts`: a `fetch` wrapper with base `${NEXT_PUBLIC_API_URL}/api/v1`. It adds `Authorization: Bearer`, parses JSON, and normalizes Nest errors (`{ statusCode, message: string | string[] }`) into an `ApiError`. On a 401 it clears the session and redirects to `/signin`.
2. `lib/api/types.ts`: `User`, `Area`, `Request`, `Paginated<T>`, `RequestsSummary`, and the enums (mirroring backend `request.entity.ts`).
3. `lib/api/{auth,users,areas,requests}.ts`: one function per endpoint.
4. **Session:** store `accessToken` in a cookie (so `proxy.ts` can read it) with `max-age` = 30 min, matching the JWT expiry. Add an `AuthProvider` context with `user` (from `/users/me`), `signin`, and `signout`.
5. **`proxy.ts`** (Next 16's name for middleware; see `docs/01-app/01-getting-started/16-proxy.md`): it redirects unauthenticated requests on `/dashboard` and `/solicitacoes` to `/signin`, and redirects `/signin` to `/dashboard` when a token exists. This is an optimistic check only; the API remains the authority.
6. **Data fetching:** client-side, with a small `useQuery`-style hook (or add TanStack Query if preferred). Keep URL search params as the state for the Solicitações filters.

## 3. Shared layout (`app/(app)/layout.tsx`)

- `AppSidebar` (MUI `Drawer variant="permanent"`, 256px): the brand mark (`EmojiObjectsRounded` in a 36px `primary` square, "sicredi" + "Central de Solicitações") and the nav groups **PRINCIPAL** (Dashboard, Solicitações with an open-count badge = PENDING + UNDER_REVIEW from the summary) and **ADMINISTRAÇÃO** (disabled). At the bottom, a user card (avatar initials, name, role) with a menu containing **Sair**.
- `AppTopBar` (64px white `AppBar`): a breadcrumb (`Início › <page>`), a search field (Enter → `/solicitacoes?search=`), and notification/help icon buttons.
- `PageHeader` (title h1 28 + subtitle 15 + an actions slot), shared by both pages.
- Content area: 32px padding on a `bg` background.

## 4. Shared components (`components/`)

| Component | Built from | Used in |
|---|---|---|
| `StatusChip` | `Chip` + dot. Variant map from the CLAUDE.md table | tables, dialogs |
| `PriorityLabel` | `*Rounded` icon + text (Alta/Média/Baixa) | tables, dialog summaries |
| `MetricCard` | `Card` + icon box + Exo 2 value + optional delta row | Dashboard |
| `RequestsTable` | `Table` with columns Solicitação (title + short id) · Departamento · Solicitante · Prioridade · Status · Criado em/Atualizado · optional row actions | Dashboard (compact, 5 rows, no actions) and Solicitações (full) |
| `RequestSummary` | Read-only box: id + "Somente leitura" tag, title, description, meta grid (Departamento, Solicitante, Prioridade, Criado em) | Alterar Status and Decisão Final dialogs |
| `DialogShell` | `Dialog` + header (title, subtitle, close) + content + footer (left note, actions on the right) | all 3 modals |
| `formatters.ts` | `Intl` pt-BR date (`07 out 2026`, `14:32`), relative time (`há 2 h`, `ontem`), percent (`52,8%`) | everywhere |

## 5. Pages

### 5.1 Signin (`/signin`)
- Two columns. Left: 950px `primary-dark` art panel with the brand, a geometric tile composition (a 6×4 grid of squares/quarter-circles in primary/accent/tints, done with CSS `Box` elements or an exported SVG from Pencil), and a manifesto ("NOSSAS IDEIAS" / "Toda grande mudança começa com uma boa ideia." / subtitle). Right: the form panel with a "Precisa de ajuda?" link at the top and the footer "© 2026 Sicredi · Política de privacidade" at the bottom.
- Form: E-mail (`MailRounded` adornment) and Senha (visibility toggle). "Lembrar de mim" and "Esqueci minha senha" are disabled (G9). Full-width contained **Entrar** button with `LoginRounded`.
- Validation mirrors `SigninDto`: valid email and password ≥ 8 characters. Show a loading state on the button. A 401 shows an `Alert` ("E-mail ou senha inválidos").
- On success: save the token, fetch `/users/me`, and go to `/dashboard`.
- Responsive: hide the art panel below `md`.

### 5.2 Dashboard (`/dashboard`)
- Page header "Painel de Solicitações" + subtitle. Actions: (period select, see G8) + **Nova solicitação** (`AddRounded`), which opens `NewRequestDialog`.
- **Metrics row** (4 × `MetricCard`): Total (`InboxRounded`), Em aberto = PENDING + UNDER_REVIEW (`PendingActionsRounded`), Aprovadas + approval-rate note (`TaskAltRounded`), Rejeitadas (`BlockRounded`). Data comes from `GET /requests/summary` (G5).
- **Charts row:**
  - "Distribuição por prioridade" (`@mui/x-charts` `BarChart`, colors Baixa `#B5D67F` / Média `#7FBA27` / Alta `#00703C`, legend at the top right). This covers spec 4.4's priority distribution. The grouping depends on G8.
  - "Status das solicitações" (`PieChart` donut, inner label = total + "solicitações", legend with count and %).
- **Solicitações recentes:** the compact `RequestsTable` (`GET /requests?limit=5`) with a "Ver todas →" link to `/solicitacoes`.
- Refetch the summary and table after a request is created.
- Loading: `Skeleton` in the cards, charts, and rows. Empty state when total = 0.

### 5.3 Solicitações (`/solicitacoes`)
- Page header "Consulta de solicitações" + subtitle + **Nova solicitação**.
- **Filters card:** Buscar (search, debounced 300ms), Status select, Prioridade select, and "Ordenar por data" (Mais recentes / Mais antigos → `order`, G4). Summary row: quick-status pills (Todas/Abertas/Em análise/Aprovadas/Rejeitadas with counts from the summary; clicking one sets the status filter), "N solicitações encontradas", and "Limpar filtros".
- All filters plus `page` and `limit` live in the URL search params, and filter changes reset `page=1`.
- **Table:** the full `RequestsTable` with "Criado em" (date + time) and a sort arrow on that column (it toggles `order`). The row actions menu (`MoreVertRounded`) shows only the actions that are valid for the row:
  - **Alterar status:** only when `status === PENDING` and `me.role === MANAGER`.
  - **Decisão final:** only when `status === UNDER_REVIEW` and `me.role === MANAGER`.
  - **Excluir:** only when `status === PENDING`, with a confirm dialog → `DELETE /requests/:id`.
  - Decided requests (APPROVED/REJECTED) offer **Ver detalhes** (read-only `RequestSummary` + decision comment + `decidedAt`). This is optional if time is short.
- **Pagination footer:** "Exibindo X–Y de N", "Linhas por página" (10/25/50), and MUI `Pagination` with first/last page and ellipsis (needs G3).
- States: skeleton rows, an empty state ("Nenhuma solicitação encontrada" + Limpar filtros), and an error `Alert` with retry.

## 6. Modals

### 6.1 Nova Solicitação (`NewRequestDialog`)
- Header "Nova Solicitação" + subtitle. The "Tipo de registro" toggle is hidden (G6).
- Fields:
  - **Título *** (max 100, counter in the helper row)
  - **Descrição *** (multiline, max 1000, counter). The backend requires it, so mark it required even though the design doesn't.
  - Row: **Solicitante** (disabled, `LockRounded`, value = `me.name`, helper "Preenchido com seu usuário.") + **Departamento *** (select from `GET /areas`)
  - **Nível de prioridade *** (`RadioGroup` row: Baixa/Média/Alta) + a hint box (`bg`, `InfoRounded`) whose text changes with the selection. The design only specifies Média ("impacto em processos internos, sem prazo regulatório. Prazo de análise: até 5 dias úteis."). Write matching copy for Baixa and Alta.
- Footer: "* Campos obrigatórios" on the left, **Cancelar** / **Salvar** (`CheckRounded`) on the right.
- Submit → `POST /requests` `{ title, description, requester: me.id, areaId, priority }`. On success, close, show a success snackbar, and refetch. Map backend 400 validation messages to field errors or an `Alert`. Disable Salvar while submitting.

### 6.2 Alterar Status (`ChangeStatusDialog`)
- Header "Alterar status" + subtitle ("Os demais dados não podem ser editados nesta etapa.").
- `RequestSummary` (read-only).
- **Novo status *:** two option cards. **Aberta** shows a "Status atual" tag and is not selectable as a target. **Em análise** is selected (`primary` border + `primary-tint` background). Each card has a chip + description.
- Info hint: "Aprovação ou rejeição são registradas na etapa de Decisão final, após a análise."
- Footer: "Registrada no histórico" (`HistoryRounded`) on the left, **Cancelar** / **Atualizar status** on the right.
- Submit → `PATCH /requests/:id` `{ status: 'UNDER_REVIEW' }`.

### 6.3 Decisão Final (`DecisionDialog`)
- Header "Decisão final" + subtitle. `RequestSummary`.
- **Decisão *:** two option cards. **Aprovar** (`CheckCircleRounded`, "segue para execução", result chip Aprovada) and **Rejeitar** (`CancelRounded`, "encerrada sem execução", result chip Rejeitada). The selected card gets a tinted background.
- **Comentário da decisão *:** multiline, max 1000 with a counter, required, and trimmed non-empty (the backend rejects decisions without it).
- Warning hint (`warning-tint`, `WarningRounded`): "A decisão final é definitiva e não poderá ser alterada após a confirmação."
- Footer: "Registrada no histórico" on the left, **Cancelar** / **Confirmar decisão** (`GavelRounded`) on the right.
- Submit → `PATCH /requests/:id` `{ status: 'APPROVED' | 'REJECTED', decisionComment }`. The backend sets `decidedAt` (spec 4.3).

Shared modal behavior: close on Esc or the backdrop (not while submitting), focus the first field, reset state on close, and use `fullScreen` below `sm`.

---

## 7. Suggested order of work

1. Backend prerequisites: G1 (CORS), G2 (include names), G3 (pagination meta), G4 (order), G5 (summary), G7 (requester from the JWT). These are small, isolated changes in `requests.service.ts` / `main.ts`.
2. Foundation (§1) and the API/auth layer (§2).
3. Signin page (§5.1). This makes the authenticated flow testable end to end.
4. Shared layout (§3) and shared components (§4).
5. Solicitações page (§5.3). It covers the spec's listing, search, filters, and sort requirements.
6. Nova Solicitação modal (§6.1). It covers creating requests.
7. Alterar Status and Decisão Final modals (§6.2–6.3). They cover the analysis and decision flow.
8. Dashboard (§5.2). It reuses the table, cards, and modal.
9. Polish: loading/empty/error states, responsiveness, `npm run lint`, and a visual check against the Pencil screenshots.
10. README: run instructions, assumptions, and limitations (G6, G8, G9, G10), as required by spec §8.1/§11.

## 8. Definition of done (per screen)

- Visually matches the Pencil frame (spacing, tokens, typography, icons) at 1440px and degrades reasonably on smaller viewports.
- Uses only theme values (no hardcoded hex outside `theme/`).
- Real API data. Loading, empty, and error states handled.
- `npm run lint` and `npm run build` pass.
