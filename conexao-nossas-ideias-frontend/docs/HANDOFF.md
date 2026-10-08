# Handoff: where we stopped (2026-10-07)

Read this together with `docs/PLAN.md` (roadmap and decisions) and `CLAUDE.md` (architecture and conventions).

## Progress (PLAN.md §7)

| Step | Status | Branch (merged into `frontend` or `backend`) |
|---|---|---|
| 1. Backend prerequisites (CORS, names, pagination, order, summary, requester from JWT) | ✅ | `20261007-frontend-support-endpoints` → `backend` → `frontend` |
| 2. Foundation + API/auth layer | ✅ | `20261007-frontend-foundation` |
| 3. Signin page | ✅ | `20261007-signin-page` |
| 4. Shared layout + shared components | ✅ | `20261007-shared-layout` |
| 5. Solicitações page | ⏳ next, **waiting on the questions below** | — |
| 6. Nova Solicitação modal | — | — |
| 7. Alterar Status + Decisão Final modals | — | — |
| 8. Dashboard | — | — |
| 9. Polish | — | — |
| 10. README | — | — |

Workflow agreed with the user:
- Ask before starting each step.
- Never commit to or merge into `main`.
- Create frontend branches from `frontend` and backend branches from `backend`, then merge back with `--no-ff` and push. The `gh` CLI isn't installed, so merges are done locally.

## What step 4 delivered

- **App shell** (`components/layout/`). `app/(app)/layout.tsx` wraps the authenticated pages.
  - **`AppSidebar`:**
    - **Brand:** the Sicredi logo (`public/sicredi-logo.png`).
    - **PRINCIPAL group:** Dashboard, and Solicitações with an open-count badge (PENDING + UNDER_REVIEW from `/requests/summary`).
    - **ADMINISTRAÇÃO group:** disabled with an "Em breve" tooltip.
    - **User card:** avatar initials, name, role ("Gestor" / "Assistente"), and a menu with **Sair**.
  - **`AppTopbar`:** breadcrumb (titles in `PAGE_TITLES`), a search box that navigates to `/solicitacoes?search=…` (Ctrl/Cmd+K focuses it), and notification/help icons marked "em breve".
  - **Responsive:** permanent sidebar on `md+`; below that, a temporary drawer opened by a menu button.
- **Shared components:**
  - `PageHeader`: title, subtitle and actions.
  - `MetricCard`: color variants primary/secondary/warning/error, optional highlight row, loading skeleton.
  - `DialogShell`: header/content/footer anatomy from the design. Pass `onSubmit` to make it a form; `busy` blocks closing; full screen below `sm`.
  - `StatusChip` and `PriorityLabel`: design colors.
  - `RequestsTable`:
    - `variant="compact"`: "Atualizado", relative time.
    - `variant="full"`: "Criado em" date and time, a sort label wired through `order`/`onToggleOrder`, and `renderActions` for the row menu.
    - Loading skeleton and empty row are built in.
  - `RequestSummary`: read-only card for the dialogs.
- **`lib/format.ts`:** pt-BR formatters (`formatDate`, `formatTime`, `formatRelative`, `formatPercent`, `formatRequestCode` → `#3B248836`, `initials`).
- **Theme:** added `secondary.dark` (#4E7A12), `palette.muted` (#6C757D), and `palette.priorityText` (table priority colors). Table headers are 12/600.
- **Placeholder pages:** `/dashboard` and `/solicitacoes` show only their `PageHeader`. Steps 5 and 8 replace them.
- **Verified in the browser** (Playwright, 1440 and 390 widths): sign-in → shell, active nav state, badge, user card, search navigation, mobile drawer, sign-out. Two bugs were fixed during testing: a hidden table-header label made the page overflow sideways (now `aria-label` on the cell), and the sidebar had a horizontal scrollbar.
- Typecheck, lint and production build pass.

## Environment state

- **Database:** 6 sample requests were created through the API, as Theodor (MANAGER) and Diana (ASSISTANT):
  - 2 PENDING
  - 2 UNDER_REVIEW
  - 1 APPROVED
  - 1 REJECTED

  The user hasn't decided whether to keep them; for now they're used for testing.
- **Logins:**
  - `theodor_amstad@hotmail.com` (MANAGER)
  - `diana_amstad@hotmail.com` (ASSISTANT)

  The password is in `../conexao-nossas-ideias-backend/prisma/seed.ts`.
- **Docker:**
  - **Frontend container `sicredi-conexao-nossas-ideias-frontend`:** stopped on purpose; its image is the old scaffold. Bring it back with `docker compose up --build frontend` (from the parent folder) once you want the containerized app.
  - **Backend and Postgres containers:** running.
- **Browser testing:**
  - **Port:** run the app on port **3000**, because the backend CORS only allows `http://localhost:3000`.
  - **Server command:** use `node node_modules/next/dist/bin/next start -p 3000` (after `npm run build`) or `npm run dev`. With `npx`, stopping the task leaves the Node child running; free the port with `Get-NetTCPConnection -LocalPort 3000 | Stop-Process` (PowerShell).
  - **Sample data from Git Bash:** create it with Node (`fetch`), not `curl`. `curl` in Git Bash corrupted accented characters.

## Open questions for step 5 (Solicitações page): ask the user first

1. **Quick-status pill counts:** they come from `GET /requests/summary`, so they're totals over all requests and ignore the search text and other filters. Is that acceptable for the MVP? The alternative is adding filter params to the backend summary endpoint, which is a backend branch from `backend`.
2. **"Ver detalhes" for decided requests (optional in PLAN.md §5.3):** a read-only dialog with `RequestSummary` + decision comment + `decidedAt`, reachable from the row menu of APPROVED/REJECTED requests. It's cheap now that `RequestSummary` and `DialogShell` exist. Include it in step 5?

## Step 5 scope (as proposed to the user)

- **Filters card:**
  - Buscar: debounced 300ms.
  - Status, Prioridade, and "Ordenar por data" (Mais recentes / Mais antigos → `order`) selects.
  - Quick-status pills with counts; clicking one sets the status filter.
  - "N solicitações encontradas" and "Limpar filtros".
- **URL as state:** all filters plus `page`/`limit` live in the URL search params. Any filter change resets `page=1`, and `?search=` from the top bar must be respected.
- **`RequestsTable variant="full"`:** the "Criado em" sort label toggles `order`.
- **Row menu (⋮), only valid actions:**
  - **Alterar status:** `PENDING` and `isManager`.
  - **Decisão final:** `UNDER_REVIEW` and `isManager`.
  - **Excluir:** `PENDING`, any role, with a confirmation dialog → `useDeleteRequest`.
- **Pagination footer:** "Exibindo X–Y de N", "Linhas por página" (10/25/50), and MUI `Pagination`.
- **States:** loading skeleton, empty state with "Limpar filtros", and an error `Alert` with retry.
- **Modals:** "Nova solicitação" and the status/decision modals come in steps 6–7. In step 5, wire the button and menu items so the modals can be plugged in later.
