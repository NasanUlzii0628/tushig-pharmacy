# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development (uses Turbopack, port 3030)
pnpm dev

# Build
pnpm build

# Lint
pnpm lint

# Format
pnpm format

# Generate theme presets (re-runs after adding new presets to globals.css)
pnpm generate:presets
```

The package manager is **pnpm**. There are no test commands — this project has no test suite.

The dev server runs at `http://localhost:3030`.

## Environment

Requires `API_BASE_URL` env var pointing to the backend API. All API calls in `src/services/handler/index.ts` prepend this to every request path.

## Architecture

### Route Groups

- `src/app/(main)/` — authenticated app shell with sidebar layout
- `src/app/(external)/` — public pages (e.g., landing page)
- `src/app/(main)/dashboard/` — all dashboard pages; layout wraps content in `SidebarProvider`
- `src/app/(main)/auth/` — login/register screens

### Colocation Pattern

Feature-specific pages, components, and logic live inside their route folder under `_components/`. Shared UI lives in `src/components/`. Follow this pattern when adding new pages.

### Preferences System

User preferences (theme mode, theme preset, sidebar variant/collapsible, content layout, navbar style) flow through:

1. **`ThemeBootScript`** (`src/scripts/theme-boot.tsx`) — inline `<script>` injected in `<head>` that reads cookies/localStorage and applies `data-*` attributes and CSS classes to `<html>` before hydration to prevent flicker.
2. **`preferences-config.ts`** (`src/lib/preferences/`) — single source of truth for defaults and persistence strategy (`client-cookie`, `server-cookie`, `localStorage`, or `none`).
3. **`PreferencesStoreProvider`** (`src/stores/preferences/preferences-provider.tsx`) — Zustand store (vanilla) wrapped in React context; bootstraps from DOM attributes on mount.

Layout variants are applied via Tailwind's attribute selector pattern: `[html[data-content-layout=centered]_&]:...`

### API Layer

All authenticated API calls go through `src/services/handler/index.ts` — server actions (`GET`, `POST`, `PUT`, `DELETE`) that read the `token` cookie from `next/headers` and attach it as `Authorization: Bearer`. Response shape is always `{ success, message, data, httpStatus }`.

Service actions live in `src/services/actions/<domain>/index.ts` and call `revalidatePath` after mutations.

### Auth & RBAC

- Login stores `token` (httpOnly) and `user` (JSON, non-httpOnly) as cookies via `src/lib/auth.ts`.
- `getAuthUser()` (`src/lib/auth-user.ts`) reads the `user` cookie server-side.
- Route-level permissions are defined in `src/lib/permissions.ts` (`ROUTE_PERMISSIONS`).
- Sidebar items are filtered by role via `filterMenuByRole()` in `src/navigation/sidebar/sidebar-items.ts`.
- `allowedRoles` on a sidebar item uses the same `ROUTE_PERMISSIONS` entries — keep them in sync.

### Sidebar Navigation

Sidebar structure is defined in `src/navigation/sidebar/sidebar-items.ts` as `NavGroup[]`. The sidebar reads `sidebarVariant` and `sidebarCollapsible` from the Zustand preferences store at runtime.

### Theme Presets

CSS variables for each preset are defined in `src/app/globals.css` between `/* generated:themePresets:start */` and `/* generated:themePresets:end */` markers. TypeScript types and metadata are in `src/lib/preferences/theme.ts` between matching markers. After editing globals.css presets, run `pnpm generate:presets` to sync the TypeScript.
