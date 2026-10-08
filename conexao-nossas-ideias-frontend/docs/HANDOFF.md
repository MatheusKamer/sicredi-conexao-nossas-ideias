# Handoff: where we stopped (2026-10-08)

Read this together with `docs/PLAN.md` (roadmap and decisions) and `CLAUDE.md` (architecture and conventions).

## Progress (PLAN.md §7)

| Step | Status | Branch (merged into `frontend` or `backend`) |
|---|---|---|
| 1. Backend prerequisites (CORS, names, pagination, order, summary, requester from JWT) | ✅ | `20261007-frontend-support-endpoints` → `backend` → `frontend` |
| 2. Foundation + API/auth layer | ✅ | `20261007-frontend-foundation` |
| 3. Signin page | ✅ | `20261007-signin-page` |
| 4. Shared layout + shared components | ✅ | `20261007-shared-layout` |
| 5. Solicitações page | ✅ | `20261008-solicitacoes-page` |
| 6. Nova Solicitação modal | ✅ | `20261008-new-request-dialog` |
| 7. Alterar Status + Decisão Final modals | ⏳ next | — |
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

## What step 5 delivered

Decisions taken with the user (2026-10-08):
- **Quick-status pill counts** stay global totals from `GET /requests/summary`. They ignore the search and other filters, and no backend change was made.
- **"Ver detalhes"** for APPROVED/REJECTED requests is included.

What was built:
- **`/solicitacoes`** (`app/(app)/solicitacoes/`):
  - `page.tsx` (server): `PageHeader` plus `<Suspense>` around `RequestsView`, because `useSearchParams` needs a Suspense boundary.
  - `requests-view.tsx` (client): wires the filters, table, pagination and dialogs together.
- **URL as state** (`lib/requests/use-request-filters.ts`):
  - **Params:** `search`, `status`, `priority`, `order`, `page`, `limit` (10/25/50).
  - **Parsing:** invalid values fall back to the defaults, and defaults are left out of the URL.
  - **Page reset:** any change that doesn't set `page` resets it to 1.
  - **Out-of-range pages:** a page past the end (stale link, or deleting the last row of the last page) is clamped to the last page.
  - **Writes:** `router.replace` with `scroll: false`.
- **`RequestsFilters`** (filters card):
  - Buscar, debounced 300ms. It keeps its own input and re-syncs when the URL changes from outside, e.g. the top-bar search or Limpar filtros.
  - Status, Prioridade and "Ordenar por data" selects.
  - Quick-status pills (`aria-pressed`).
  - "N solicitações encontradas" (singular aware).
  - "Limpar filtros": resets search/status/priority/order and keeps the page size. Disabled when nothing is active.
- **Search placeholder:** "Título ou descrição". The design says "Título, código ou solicitante", but the backend only searches title and description.
- **`RequestsPagination`:** "Exibindo X–Y de N", "Linhas por página", MUI `Pagination` with pt-BR aria labels.
- **`RequestRowActions` + `availableActions()`:** the status-flow/role rules from PLAN.md §5.3. As Gestor:
  - PENDING → Alterar status + Excluir
  - UNDER_REVIEW → Decisão final
  - APPROVED/REJECTED → Ver detalhes

  As Assistente: PENDING → Excluir, UNDER_REVIEW → no menu, decided → Ver detalhes.
- **`DeleteRequestDialog`:** `RequestSummary` + confirmation, `useDeleteRequest`, an error `Alert`, and a success snackbar ("Solicitação excluída.").
- **`RequestDetailsDialog`:** `RequestSummary` + decision chip + comment + "Decidida em … às …".
- **Dialog state pattern:** dialogs take `open` and `request` separately. The view keeps `{ action, request }` and only clears `action` on close, so the content doesn't vanish during the exit transition. Reuse this pattern for the step 6–7 dialogs.
- **States:** skeleton rows (`limit` rows), a thin `LinearProgress` while refetching with previous data, an empty state (with Limpar filtros when filters are active), and an error `Alert` with "Tentar novamente".
- **`NewRequestButton`** (`components/requests/new-request-button.tsx`): the header action, which does nothing yet. Step 6 adds `NewRequestDialog` inside it, so the Dashboard can reuse the same button.
- **Tweaks to shared components:**
  - `RequestsTable`: Departamento is 200px and Solicitante 160px (real area names are long), table `minWidth` is 1040, and the sorted "Criado em" label is `primary` like the design, with an aria-label.
  - `RequestSummary`: truncated meta values get a `title`.
  - `AppTopbar`: clears its search box after submitting.
- **Verified in the browser** (Playwright at 1440 and 390 widths, as Theodor and Diana):
  - debounced search → URL, and top-bar search → filter field
  - pills, Limpar filtros, sort toggle, page clamp
  - row menus per role
  - Ver detalhes
  - Excluir on a throwaway request (the sidebar badge and counts refresh)
  - mobile layout with no page-level overflow
- Typecheck, lint and production build pass.

## What step 6 delivered

- **`NewRequestDialog`** (`components/requests/new-request-dialog.tsx`), opened by `NewRequestButton`. The button owns the dialog, so the Dashboard header can reuse it as is.
  - **Validation (react-hook-form + zod):**
    - Título: required, trimmed, max 100.
    - Descrição: required, trimmed, max 1000.
    - Departamento: required.
    - Prioridade: defaults to Média, as in the design.
    - The 100/1000 limits come from the design. The backend only checks for non-empty values.
  - **Helper row:** helper text or error on the left, character counter on the right.
  - **Solicitante:** read-only `user.name` with a lock icon, labelled "Preenchido com seu usuário."
  - **Departamento:** a searchable `Autocomplete` instead of a plain select. There are 70 areas (10 sede, 60 agências), grouped "Sede" then "Agências" and alphabetical within each group.
  - **Priority:** `RadioGroup` with a hint that changes with the selection. The design only had copy for Média; the Baixa and Alta texts (10 and 2 business days) are ours, so adjust them if the business says otherwise.
  - **On open:** the form resets every time, and focus goes to Título after the enter transition (`DialogShell` `onEntered` + RHF `setFocus`). `autoFocus` doesn't work there, because MUI's focus trap moves focus to the paper.
  - **Submit:** `useCreateRequest` (the list, summary and badge refresh by themselves), then the dialog closes and shows "Solicitação registrada com sucesso." On failure an `Alert` appears and the values stay. Closing is blocked while saving.
- **`FeedbackProvider` / `useNotify()`** (`components/ui/feedback-provider.tsx`, mounted in `app/providers.tsx`): one shared message bar for the whole app. `RequestsView` now uses it for "Solicitação excluída."
- **`DialogShell` changes:**
  - New `onEntered` prop.
  - The footer note is hidden below `sm`, so the buttons get the whole row (they stay right-aligned).
  - The footer uses `useFlexGap`.
- **Hydration fix (bug from step 5):** in dev, the `<Suspense>` content hydrated after the sidebar had already cached `/requests/summary`, so the pill counts didn't match the server HTML.
  - `RequestsView` now renders `RequestsViewFallback` until hydration finishes (`lib/use-hydrated.ts`).
  - The same skeleton is the Suspense fallback, which used to be blank.
  - Use `useHydrated` for any late-hydrating subtree that reads queries other components share.
- **Verified in the browser** (1440 and 390 widths):
  - empty-submit validation, errors clearing as you type
  - department search and grouping, priority hint
  - creating a request (trimmed, list/pills/badge refreshed, message shown)
  - form reset and focus on reopen, full-screen layout on phones
  - simulated 500 → `Alert` with the values kept
  - cleanup through Excluir
  - no console errors
- The database is back to the original 6 sample requests.
- Typecheck, lint and production build pass.

## Next: step 7 (Alterar status + Decisão final)

`RequestsView` already sets `dialog.action` to `'change-status'` / `'decide'`. Render `ChangeStatusDialog` / `DecisionDialog` next to `DeleteRequestDialog` (the spot has a comment), following the same `open` + `request` pattern. Use `useUpdateRequestStatus`, `useNotify` for success, and `onEntered` for focus (the decision comment field).

## Known leftovers

- **Logo warning:** Next warns that `/sicredi-logo.png` has only one dimension changed. Add `width/height: auto` styles in `AppSidebar`. Polish (step 9).
