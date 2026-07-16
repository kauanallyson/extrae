# JWT Auth Integration — Design

Date: 2026-07-16
Branch: auth integration (separate from the `camposNaoEncontrados` branch)

## Context

`extrae-api` PR #10 (merged 2026-07-16) added JWT auth to every route except `GET /health`. The frontend (`src/lib/api.ts`) never sends an `Authorization` header today, so every existing screen currently 401s against the updated API. This spec covers making the frontend auth-aware: login, registration (unlinked), token storage, a route guard, and global 401 handling.

New API endpoints (see frontend guideline doc for full detail):
- `POST /auth/register` — `{ nome, email, senha }` (senha min 8 chars) → `201 { token }`, `409` on duplicate email.
- `POST /auth/login` — `{ email, senha }` → `200 { token }`, `401` on bad creds.
- `GET /auth/me` — Bearer required → `200 { id, nome, email }`, `401` if invalid/missing.

Token is a JWT, 7-day expiry, no refresh endpoint.

## Decisions

- **Scope**: this branch covers auth only. `camposNaoEncontrados` (PR #12 follow-up) is a separate branch/spec.
- **Registration**: `/registrar` route exists but is not linked anywhere in the nav or login page — internal/manual account creation only, no public self-signup link.
- **Token storage**: `localStorage`, validated via `GET /auth/me` on app boot (brief loading state before the route guard decides). No refresh-token flow exists, so this is the simplest correct fit.
- **401 handling**: hard redirect. On any `401`, clear the stored token and hard-navigate (`window.location.href = "/login"`) rather than wiring reactive state updates through every call site.

## Architecture

- **`src/lib/auth.ts`** (new) — plain functions over `localStorage`: `getToken()`, `setToken(token)`, `clearToken()`. Key: `extrae_token`. Mirrors the plain-function style already used in `api.ts` (no class/service wrapper).
- **`src/lib/api.ts`** (edit) — add `authHeaders(): HeadersInit` and merge it into every existing fetch call's headers (`fetchAvaliadores`, `createAvaliador`, `updateAvaliador`, `deleteAvaliador`, `gerarAmostraIa`, `downloadExcelRae`, `downloadAmostrasPlanilha`, `fetchAmostras`, `createAmostra`, `fetchAmostra`, `updateAmostra`, `deleteAmostra`). Add `login`, `register`, `me` functions. `assertOk`, plus the two call sites that check `res.ok` directly (`fetchAmostras`, `downloadAmostrasPlanilha`), get a shared 401 branch: call `clearToken()` then `window.location.href = "/login"` before throwing/returning.
- **`src/features/auth/schema.ts`** (new) — Zod schemas for login (`email`, `senha`) and register (`nome`, `email`, `senha` min 8 chars), matching the shape/style of `src/features/avaliadores/schema.ts` (trim + `createZodResolver`).
- **`src/features/auth/AuthContext.tsx`** (new) — React context + `useAuth()` hook exposing `{ user, isLoading, login, register, logout }`.
  - On mount: if `getToken()` returns a token, call `me()`. Success → `user` set, `isLoading` false. Failure → `clearToken()`, `user` null, `isLoading` false. No token → `isLoading` false immediately, no request.
  - `login(email, senha)` / `register(nome, email, senha)`: call the API function, `setToken(token)` on success, then call `me()` to populate `user`.
  - `logout()`: `clearToken()`, `user` set to `null`, hard-navigate to `/login`.
- **`src/components/auth/RequireAuth.tsx`** (new) — wraps protected routes. `isLoading` → spinner (same `LoaderCircleIcon` pattern used in `AvaliadorPage.tsx`). No `user` → `<Navigate to="/login" replace />`. Else → render children.
- **`src/pages/LoginPage.tsx`** (new) — form (`email`, `senha`) via `react-hook-form` + `createZodResolver`, same idiom as `AvaliadorFormDialog`. On success, navigate to `/`.
- **`src/pages/RegisterPage.tsx`** (new) — form (`nome`, `email`, `senha`), same idiom. Route registered but not linked from anywhere in the UI.
- **`src/App.tsx`** (edit) — wrap `<RouterProvider>` in `AuthProvider`. Add public routes `/login`, `/registrar`. Wrap the existing protected routes (`/`, `/nova-amostra`, `/amostras`, `/amostras/:id`, `/amostras/:id/editar`, `/avaliadores`) with `RequireAuth` as a layout route.
- **`src/components/Navbar.tsx`** (edit) — when `user` is present, show `user.nome` and a logout button (calls `useAuth().logout()`). Nav stays minimal — no visual redesign beyond adding this element.

## Data flow

1. App boots → `AuthProvider` checks `localStorage` for a token → calls `/auth/me` if present → resolves `user`/`null`.
2. `RequireAuth` reads `useAuth()`; while `isLoading`, shows a spinner; once resolved, redirects to `/login` or renders the route.
3. `LoginPage` submits → `login()` → token stored → `/auth/me` populates `user` → navigate to `/`.
4. Any subsequent API call includes `Authorization: Bearer <token>` via `authHeaders()`.
5. Any `401` response (including an expired token mid-session) → token cleared, hard redirect to `/login`, which naturally re-triggers the boot check with no token and renders the login form.

## Error handling

- 401 anywhere → centralized in `assertOk` (+ the two direct `res.ok` checks) → clear token + hard redirect. No per-call special-casing.
- Login `401` ("Credenciais inválidas.") / Register `409` (duplicate email) → surfaced via the existing `getErrorMessage` + Sonner toast pattern used by other mutations (e.g. `useSaveAmostra.ts`).

## Testing

No test suite exists in this repo currently (matches existing convention — none of the other features have tests). Verification is manual:
- Register (via `/registrar` directly) → redirected into the app.
- Refresh the page → session persists via `/auth/me`.
- Logout → redirected to `/login`.
- Expired/invalid token on any request → redirected to `/login`.
- Login with bad credentials → toast, no redirect.
