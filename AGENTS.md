# AGENTS.md

## Repo layout

Two independent npm packages — **not** an npm workspace. Root `package.json` only
orchestrates via `npm --prefix` + `concurrently`; each app has its own
`node_modules` and lockfile. Never merge them: `backend/` (Strapi 5) pins React 18,
`pickenby/` (Next.js 16) uses React 19.

- `backend/` — Strapi 5 CMS, port 1337 (`/admin`), SQLite at `backend/.tmp/data.db`
- `pickenby/` — Next.js 16 App Router storefront, port 3000, Tailwind v4
- `docs/` — `CONTENT-MODEL.md` (fields), `API.md` (endpoints + order contract)

## Commands (from repo root)

```bash
npm run install:all      # install root + backend + frontend (once)
npm run dev              # both apps
npm run dev:backend      # strapi develop only
npm run dev:frontend     # next dev only
npm run build            # backend then frontend
```

No lint / format / test scripts and no CI exist. Only verification is typecheck,
and `tsc` is **not** installed at the root — run inside each package:

```bash
(cd backend  && npx tsc --noEmit)
(cd pickenby && npx tsc --noEmit)
```

Node must be 20–26 (backend `engines`).

## Env setup

- `backend/.env` ← `backend/.env.example` (secrets required; SQLite works as-is)
- `pickenby/.env.local` ← `pickenby/.env.example`; only `NEXT_PUBLIC_STRAPI_URL=http://localhost:1337` needed
- Both git-ignored. Frontend origin allowed by CORS via `CORS_ORIGIN` (default `http://localhost:3000`).

## Backend gotchas (Strapi 5)

- **Auto-seed on every boot** (`backend/src/index.ts` bootstrap): seeds each
  collection only if empty, and grants Public role `find`/`findOne` on read types +
  `create` on `order` (and `find` on the `setting` single type). Disable with
  `SEED_ON_BOOT=false`. Full re-seed: delete `backend/.tmp/data.db` and restart.
- **Adding a content type**: create `src/api/<name>/...`, restart `strapi develop`
  to regenerate `backend/types/generated/*.d.ts`, **and** add its actions to the
  `ensurePublicPermissions` array in `backend/src/index.ts` — otherwise the public
  API returns 403.
- **Single types** (e.g. `setting`, site-wide config): REST endpoint is
  `GET /api/<singularName>` (no id), public permission action is
  `api::<name>.<name>.find`, and the documents service uses `findFirst` (not
  `findMany`).
- Draft & publish is ON for category/brand/product/hero-slide/promo-banner/setting:
  unpublished entries are invisible to the storefront. `order` is not draft/publish.
- REST caps: `defaultLimit` 25, `maxLimit` 100 (`backend/config/api.ts`).
- Schema source of truth: `backend/src/api/*/content-types/*/schema.json`.

## Frontend conventions (`pickenby/`)

- All CMS reads go through `lib/strapi.ts` (fetch, v4/v5 `unwrap`, media URLs) and
  `lib/cms.ts` (typed getters). Pages never call Strapi directly.
- Every getter falls back to mock arrays / hardcoded defaults when Strapi is
  offline/empty — return empty arrays or `null` (never throw); preserve that
  contract for new getters.
- Listing pages export `revalidate = 60` (ISR); fetches use `next: { revalidate: 60 }`.
- Orders: `app/api/orders/route.ts` validates `customerName`/`phone`/`address`,
  then POSTs `{ data: body }` to Strapi `POST /api/orders` (public `create`).
  Confirmation reference = response `data.documentId`.
- Cart is client-only: `lib/cart.tsx`, `localStorage` key `pickenby-cart`. No auth.
- Auth is client-only Firebase (`lib/auth.tsx` `AuthProvider`, `lib/firebase.ts`):
  `/login`, `/register`, `/forgot-password`, `/account`. Requires
  `NEXT_PUBLIC_FIREBASE_*` env; without it the app builds/runs but auth methods
  return a "not configured" error. No server-side session verification / middleware,
  no Strapi users-permissions integration, checkout stays guest-only.
- Tailwind v4 is CSS-first: tokens live in `app/globals.css` (`@theme`); no
  `tailwind.config`.
- New image hosts must be added to `images.remotePatterns` in `pickenby/next.config.ts`
  (localhost:1337/uploads already allowed).
- `pickenby/package.json` pins `next`/`react`/`lucide-react` as `"latest"` — the
  lockfile is the real pin; don't run `npm update` casually.

## References

`README.md`, `backend/README.md`, `pickenby/README.md`, `docs/CONTENT-MODEL.md`, `docs/API.md`