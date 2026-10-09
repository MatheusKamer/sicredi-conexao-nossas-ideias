# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Context

Frontend for "Conexão Nossas Ideias", built for a Sicredi technical challenge (spec PDF: `../conexao-nossas-ideias-backend/docs/Desafio_Tecnico_Assessor_Desenvolvimento_Sistemas-v2.pdf`). Users submit ideas/requests to an area (agency or headquarters), and those requests go through a review/decision workflow. The git repo root is the parent folder, which also holds `conexao-nossas-ideias-backend` (NestJS + Prisma, port 3001, which has its own CLAUDE.md) and a `docker-compose.yml` that runs Postgres, the backend, and this frontend.

Stack: Next.js 16.3 App Router (`app/`), React 19.2, TypeScript strict, MUI Material v9, TanStack Query v5, react-hook-form + zod v4. Tailwind v4 is still installed. The implementation roadmap (with its step order and product decisions) lives in `docs/PLAN.md`.

## Architecture

- `app/layout.tsx`: loads the fonts (`--font-exo2`, `--font-roboto`) and wraps the app in `AppRouterCacheProvider` (`enableCssLayer`) → `app/providers.tsx` (client: `ThemeProvider` + `CssBaseline` + `QueryClientProvider` + `AuthProvider`).
- `theme/theme.ts`: the single source of visual values. It exports `theme` and `tokens`, and augments the palette with `outline` and `priority`.
- `lib/api/`: `client.ts` (`apiRequest`, a fetch wrapper that adds the Bearer token, drops empty query params, and throws `ApiError { status, messages[] }` normalized from Nest errors), `endpoints.ts` (`authApi`, `usersApi`, `areasApi`, `requestsApi`), and `types.ts` (mirrors of the backend contract).
- `lib/queries/requests.ts`: `queryKeys` plus TanStack hooks. Every request mutation invalidates the whole `['requests']` tree (lists, summary, details).
- `lib/auth/`:
  - `session.ts`: JWT stored in the non-HttpOnly `cni_session` cookie, with `max-age` taken from the token `exp`. It's shared with `proxy.ts`, so it has no `"use client"`.
  - `auth-provider.tsx`: `useAuth()` returns `{ user, isManager, signin, signout }`. On a 401, `apiRequest` clears the cookie and calls the handler AuthProvider registered, which clears the query cache and routes to `/signin?next=…`.
- `proxy.ts` (Next 16's middleware): an optimistic cookie check. It redirects `/dashboard` and `/solicitacoes` to `/signin` without a session, and `/signin` to `/dashboard` with one.
- Routes: `app/(auth)/signin` (no shell) and `app/(app)/*`. `app/(app)/layout.tsx` wraps pages in `AppShell` (permanent sidebar on `md+`, temporary drawer plus menu button below). Add new authenticated pages under `(app)` and register their breadcrumb title in `PAGE_TITLES` (`components/layout/app-topbar.tsx`).
- `components/layout/`: `AppShell`, `AppSidebar` (nav, open-count badge from the summary, user menu with Sair), `AppTopbar` (breadcrumb, search → `/solicitacoes?search=`, Ctrl/Cmd+K), `PageHeader`.
- `components/requests/`: `StatusChip`, `PriorityLabel`, `RequestsTable` (`variant="compact" | "full"`; handles loading skeleton and empty rows; `renderActions` for the row menu), `RequestSummary` (read-only card for dialogs). `components/ui/`: `MetricCard`, `DialogShell` (header/content/footer anatomy; pass `onSubmit` to render a form; `busy` blocks closing; full screen below `sm`).
- `lib/format.ts`: pt-BR formatters (`formatDate` "07 out 2026", `formatTime`, `formatRelative` "há 2 h", `formatPercent`, `formatRequestCode` "#3B248836", `initials`).
- `lib/requests/labels.ts`: pt-BR labels for statuses, priorities, area types, and roles. Use them instead of inline strings.
- Role rule (frontend-only by decision): only `MANAGER` (`useAuth().isManager`) may change status or decide.

## UI stack: MUI Material

- Build UI with **MUI Material v9** (`@mui/material`, Emotion). v9 removed the deprecated props: use `slotProps` (e.g. `slotProps.input` on TextField, `slotProps.paper` on Dialog), and use `sx` instead of system props on `Box`/`Typography`/`Stack`. Use `@mui/icons-material` for icons and `@mui/x-charts` for charts. Prefer MUI components and the theme over hand-rolled markup or Tailwind utilities. Tailwind is still installed; keep it, at most, for page-level layout glue.
- Integrate with the App Router through `@mui/material-nextjs` (`AppRouterCacheProvider` in the root layout) plus a `ThemeProvider`/`CssBaseline` client wrapper. MUI components that take event handlers or use hooks must live in `"use client"` files.
- All visual values come from the theme (see below). Don't hardcode hex colors in components.

## Design source: Pencil (`.pen`)

The design is in `../../sicredi_nossas_ideias.pen` (outside this git repo). `.pen` files are encrypted, so read them only through the Pencil MCP tools (`get_app_state`, `execute` with `Get`/`GetVariables`/`TakeScreenshot`), never with Read or Grep. The screens are Dashboard — Visão Geral, Dashboard — Modal Nova Solicitação, Solicitações — Consulta, Solicitações — Modal Alterar Status, Solicitações — Modal Decisão Final, and Login — Entrar. All UI copy is in pt-BR.

### Design tokens (Pencil variables → MUI theme)

| Token | Value | Theme mapping |
|---|---|---|
| `primary` / `primary-dark` / `primary-tint` | `#00703C` / `#00562E` / `#E6F1EB` | `palette.primary.main` / `.dark` / `.light` |
| `accent` / `accent-tint` | `#7FBA27` / `#F1F8E7` | `palette.secondary` |
| `bg` / `surface` | `#F8F9FA` / `#FFFFFF` | `palette.background.default` / `.paper` |
| `text-dark` / `text-secondary` | `#212529` / `#5C6670` | `palette.text.primary` / `.secondary` |
| `outline` / `divider` | `#8C959D` / `#E4E7EA` | input border / `palette.divider` |
| `error` / `error-tint` | `#C62828` / `#FDECEC` | `palette.error` |
| `warning` / `warning-tint` | `#B45309` / `#FEF3E2` | `palette.warning` |
| `font-heading` / `font-body` | Exo 2 / Roboto | headings h1–h6 / body + buttons (load with `next/font/google`) |
| `radius` | 8 | `shape.borderRadius` |

### Components frame (reusable components → MUI)

| Pencil component | Spec | MUI implementation |
|---|---|---|
| `TextField` | Outlined, 56px tall, floating 12px label, 16px value, optional trailing icon (`arrow_drop_down`, `search`, `lock`, `visibility`, `mail`…), helper text on the left and a character counter (`45/100`) on the right | `TextField variant="outlined"`. Use `select` for dropdowns, `InputAdornment` for icons, and `helperText` for the helper and counter row |
| `Button/Contained` | Fill `accent` with **dark text** (`text-dark`), 15px/500, padding 10×22, small shadow, optional start icon | `Button variant="contained"` with `startIcon`. The theme defaults Button `color` to `secondary` (accent, dark contrast text) |
| `Button/Outlined` | `outline` border, `#495057` text | `Button variant="outlined"`. The default secondary color is restyled as the neutral design button |
| `NavItem` | 224×44, icon 22 + 14px/500 label, optional count badge (`primary-tint` bg, `primary` text). Active state = `primary-tint` bg + `primary` text | `ListItemButton` + `ListItemIcon` + `ListItemText` + `Chip`/badge, with `selected` styling from the theme |
| `StatusChip` | Pill (radius 12), 6px dot + 12px/500 label, tinted bg | Small `Chip` with a dot icon. Variants: **Aberta** `#EAF1FB`/`#1F5FAD` (PENDING) · **Em análise** `warning-tint`/`warning` (UNDER_REVIEW) · **Aprovada** `primary-tint`/`primary` (APPROVED) · **Rejeitada** `error-tint`/`error` (REJECTED) |
| `RadioOption` | 42px row, 24px radio icon (`outline` → checked `primary`), 15px label | `FormControlLabel` + `Radio` inside a `RadioGroup` |
| `MetricCard` | 264 wide, `surface` with `divider` border and a light shadow, padding 20. Label 14/500 + 40×40 `primary-tint` icon box, value in Exo 2 32/700, delta row (trend icon + 13/600 delta + secondary note) | `Card variant="outlined"` + `Typography`, shared `MetricCard` component |

Priority display (not a component, but repeated): Alta = `keyboard_double_arrow_up`, Média = `drag_handle`, Baixa = `keyboard_arrow_down`. Chart priority colors are Baixa `#B5D67F`, Média `#7FBA27`, Alta `#00703C`. Icons in the design use Material Symbols **Rounded**, so use the `*Rounded` variants from `@mui/icons-material`.

Brand: use `public/sicredi-logo.png` (the green wordmark, 3500×823) instead of the design's light-bulb brand mark. It only works on light backgrounds, so on the login page it sits on the white form panel. The login art panel's tile composition is a static export from Pencil (`public/login-art.webp`).

Shared layout (all authenticated screens): a 256px white sidebar (brand, nav groups "PRINCIPAL"/"ADMINISTRAÇÃO", user card at the bottom), a 64px top bar (breadcrumb, search, notifications, help), and a content area with 32px padding on a `bg` background. Dialogs are 600px wide with radius 8, a header (title 22 + subtitle + close button), and a footer with actions on the right.

## Commands

```bash
npm run dev     # next dev on http://localhost:3000
npm run build   # production build
npm run start   # serve the build
npm run lint    # eslint (flat config: next core-web-vitals + typescript)
```

There's no test runner configured. Copy `.env.example` to `.env.local` (`NEXT_PUBLIC_API_URL=http://localhost:3001`). To run the full stack from the parent directory, use `docker compose up`. The compose file passes `NEXT_PUBLIC_API_URL` as a build arg, because `NEXT_PUBLIC_*` values are inlined at build time. Seeded login users (password in `../conexao-nossas-ideias-backend/prisma/seed.ts`): `theodor_amstad@hotmail.com` (MANAGER) and `diana_amstad@hotmail.com` (ASSISTANT).

## Next.js 16 notes

- See AGENTS.md: read the bundled docs in `node_modules/next/dist/docs/` (`01-app`, `02-pages`, `03-architecture`) before using Next APIs. Don't rely on memory.
- Layouts and pages use the globally generated route-prop types (for example `LayoutProps<"/">` in `app/layout.tsx`), so you don't need to import them.
- Tailwind v4 is configured CSS-first (no `tailwind.config.*`). `app/globals.css` declares `@layer theme, base, mui, components, utilities;` so MUI's styles sit below Tailwind utilities.
- The path alias `@/*` maps to the project root.

## Backend API contract

- Base URL: `${NEXT_PUBLIC_API_URL}/api/v1`.
- Auth: `POST /auth/signin` with `{ email, password }` (password must be at least 8 characters) returns `{ accessToken }`. The JWT expires after 30 minutes. Every other route is protected by a global guard and needs `Authorization: Bearer <token>`.
- Endpoints: `GET /users/me`, `GET /areas`, and `POST|GET /requests` plus `GET|PATCH|DELETE /requests/:id`.
- `GET /requests` accepts `search`, `status`, `priority`, `areaId`, `page`, `limit` (default 10), and `order` (`asc`|`desc` by `createdAt`). It returns `{ data, meta: { total, page, limit, totalPages } }`.
- `GET /requests/summary` returns `{ total, byStatus, byPriority }`.
- Request responses include `user: { id, name }` and `area: { id, name, type }`. `POST /requests` takes `{ title, description, areaId, priority }`; the requester comes from the JWT.
- Request status flow: new requests are `PENDING`. `PATCH` accepts only `UNDER_REVIEW`, `APPROVED`, or `REJECTED`; `APPROVED` and `REJECTED` require `decisionComment`. Only `PENDING` requests can be deleted.
- CORS on the backend allows `CORS_ORIGIN` (default `http://localhost:3000`). Running the frontend on another port needs that variable changed.

## Gotchas

- The Docker backend container mounts the working tree and runs in watch mode, so the checked-out git branch is what the API serves. Keep `backend` merged into `frontend`. After switching branches, its incremental compiler can get stuck on deleted files; `docker restart sicredi-conexao-nossas-ideias-backend` fixes it.
- The Docker frontend container (port 3000) serves a stale production image. For development, stop it or run `next dev`/`next start` on another port (and adjust `CORS_ORIGIN`).
