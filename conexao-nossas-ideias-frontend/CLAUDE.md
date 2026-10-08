# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Context

Frontend for "Conexão Nossas Ideias", built for a Sicredi technical challenge (spec PDF: `../conexao-nossas-ideias-backend/docs/Desafio_Tecnico_Assessor_Desenvolvimento_Sistemas-v2.pdf`). Users submit ideas/requests to an area (agency or headquarters), and those requests go through a review/decision workflow. The git repo root is the parent folder, which also holds `conexao-nossas-ideias-backend` (NestJS + Prisma, port 3001, which has its own CLAUDE.md) and a `docker-compose.yml` that runs Postgres, the backend, and this frontend.

This app is still the stock `create-next-app` scaffold: Next.js 16.3 App Router (`app/`), React 19.2, Tailwind CSS v4, and TypeScript strict. No API client, auth handling, or test setup exists yet. The implementation roadmap lives in `docs/PLAN.md`.

## UI stack: MUI Material

- Build UI with **MUI Material** (`@mui/material`, Emotion). Use `@mui/icons-material` for icons and `@mui/x-charts` for charts. Prefer MUI components and the theme over hand-rolled markup or Tailwind utilities. Tailwind is still installed; keep it, at most, for page-level layout glue.
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
| `Button/Contained` | Fill `accent` with **dark text** (`text-dark`), 15px/500, padding 10×22, small shadow, optional start icon | `Button variant="contained" color="secondary"` with `startIcon`. The theme needs `secondary.contrastText = text-dark` |
| `Button/Outlined` | `outline` border, `#495057` text | `Button variant="outlined"`, neutral color override |
| `NavItem` | 224×44, icon 22 + 14px/500 label, optional count badge (`primary-tint` bg, `primary` text). Active state = `primary-tint` bg + `primary` text | `ListItemButton` + `ListItemIcon` + `ListItemText` + `Chip`/badge, with `selected` styling from the theme |
| `StatusChip` | Pill (radius 12), 6px dot + 12px/500 label, tinted bg | Small `Chip` with a dot icon. Variants: **Aberta** `#EAF1FB`/`#1F5FAD` (PENDING) · **Em análise** `warning-tint`/`warning` (UNDER_REVIEW) · **Aprovada** `primary-tint`/`primary` (APPROVED) · **Rejeitada** `error-tint`/`error` (REJECTED) |
| `RadioOption` | 42px row, 24px radio icon (`outline` → checked `primary`), 15px label | `FormControlLabel` + `Radio` inside a `RadioGroup` |
| `MetricCard` | 264 wide, `surface` with `divider` border and a light shadow, padding 20. Label 14/500 + 40×40 `primary-tint` icon box, value in Exo 2 32/700, delta row (trend icon + 13/600 delta + secondary note) | `Card variant="outlined"` + `Typography`, shared `MetricCard` component |

Priority display (not a component, but repeated): Alta = `keyboard_double_arrow_up`, Média = `drag_handle`, Baixa = `keyboard_arrow_down`. Chart priority colors are Baixa `#B5D67F`, Média `#7FBA27`, Alta `#00703C`. Icons in the design use Material Symbols **Rounded**, so use the `*Rounded` variants from `@mui/icons-material`.

Shared layout (all authenticated screens): a 256px white sidebar (brand, nav groups "PRINCIPAL"/"ADMINISTRAÇÃO", user card at the bottom), a 64px top bar (breadcrumb, search, notifications, help), and a content area with 32px padding on a `bg` background. Dialogs are 600px wide with radius 8, a header (title 22 + subtitle + close button), and a footer with actions on the right.

## Commands

```bash
npm run dev     # next dev on http://localhost:3000
npm run build   # production build
npm run start   # serve the build
npm run lint    # eslint (flat config: next core-web-vitals + typescript)
```

There's no test runner configured. To run the full stack from the parent directory, use `docker compose up`. Compose passes `NEXT_PUBLIC_API_URL=http://localhost:3001` to the frontend.

## Next.js 16 notes

- See AGENTS.md: read the bundled docs in `node_modules/next/dist/docs/` (`01-app`, `02-pages`, `03-architecture`) before using Next APIs. Don't rely on memory.
- Layouts and pages use the globally generated route-prop types (for example `LayoutProps<"/">` in `app/layout.tsx`), so you don't need to import them.
- Tailwind v4 is configured CSS-first. There's no `tailwind.config.*` file. Theme tokens live in `app/globals.css` under `@theme inline`, and PostCSS uses `@tailwindcss/postcss`.
- The path alias `@/*` maps to the project root.

## Backend API contract

- Base URL: `${NEXT_PUBLIC_API_URL}/api/v1`.
- Auth: `POST /auth/signin` with `{ email, password }` (password must be at least 8 characters) returns `{ accessToken }`. The JWT expires after 30 minutes. Every other route is protected by a global guard and needs `Authorization: Bearer <token>`.
- Endpoints: `GET /users/me`, `GET /areas`, and `POST|GET /requests` plus `GET|PATCH|DELETE /requests/:id`.
- `GET /requests` accepts `search`, `status`, `priority`, `areaId`, `page`, and `limit` (default 10).
- Request status flow: new requests are `PENDING`. `PATCH` accepts only `UNDER_REVIEW`, `APPROVED`, or `REJECTED`; `APPROVED` and `REJECTED` require `decisionComment`. Only `PENDING` requests can be deleted.
- The backend's `main.ts` doesn't call `enableCors()`. Browser requests from port 3000 to port 3001 will be blocked until CORS is enabled on the backend or calls are proxied through Next (for example rewrites, route handlers, or server actions).

## Gotchas

- The `Dockerfile` has `EXPOSE 3001`, but `next start` listens on 3000, and compose maps `3000:3000`.
- `NEXT_PUBLIC_*` variables are inlined into client code during `npm run build`, which runs inside the Docker image build. Compose only sets `NEXT_PUBLIC_API_URL` as a runtime `environment` value, so client-side code in the container won't see it unless it's also passed as a build arg.
