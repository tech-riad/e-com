# Pickenby — E-commerce monorepo

An online electronics & home-appliances store for Bangladesh: a **Strapi 5** headless CMS plus a **Next.js 16** storefront, kept as two apps and wired together.

```
pickenby-ecom/
  backend/    → Strapi 5 CMS        http://localhost:1337  (admin at /admin)
  pickenby/   → Next.js storefront  http://localhost:3000
  docs/       → content model & API reference
  package.json → root orchestration (runs both together)
```

> **Why two packages?** The backend pins React 18 (Strapi admin requirement) while the
> storefront uses React 19 + Next 16. They cannot share one `package.json` — the root
> `package.json` only orchestrates scripts; each app installs its own dependencies.

---

## Prerequisites

- Node.js **20 – 26** (`backend/package.json` engines) — confirmed working on Node 24.
- npm ≥ 6.

## Quick start

1. **Install** (once):

   ```bash
   npm run install:all
   ```

   This installs the root runner plus both apps.

2. **Env** (see [Environment variables](#environment-variables)):

   - `backend/.env` — create from `backend/.env.example`; SQLite + dev secrets work out of the box.
   - `pickenby/.env.local` — create from `pickenby/.env.example`; only `NEXT_PUBLIC_STRAPI_URL` is required for local dev.

3. **Run both**:

   ```bash
   npm run dev
   ```

   Or individually: `npm run dev:backend` / `npm run dev:frontend`.

On first backend boot, the database is **automatically seeded** (brands, categories,
hero slides, promo banners, 28 sample products, and site settings) and the **public
read permissions** are granted automatically — no manual admin steps required. See
[Auto-seeding](#auto-seeding).

---

## Scripts (root)

| Script | What it does |
|--------|--------------|
| `npm run dev`           | Run backend + frontend together with `concurrently` |
| `npm run dev:backend`   | `strapi develop` (port 1337) |
| `npm run dev:frontend`  | `next dev` (port 3000) |
| `npm run build`         | Build backend then frontend |
| `npm run build:backend` / `build:frontend` | Build one app |
| `npm run install:all`   | Install root + backend + frontend deps |

---

## Features

### Storefront routes (`pickenby/`)

| Route | Purpose |
|-------|---------|
| `/` | Homepage — hero carousel, category circles/sidebar, promo banners, top-selling, brands, trending, product rails |
| `/products` | All products with pagination + sort (newest / price ↑ / price ↓) |
| `/products/[slug]` | Product detail (image, price, EMI, badges, related) |
| `/category/[slug]` | Category listing (paginated) |
| `/brands/[slug]` | Brand listing |
| `/search?q=` | Title/seller search |
| `/cart` | Client-side cart (localStorage) |
| `/checkout` | Delivery + payment form → places an order |
| `/order-confirmation` | Success page with order reference |
| `/api/orders` | `POST` proxy route handler → Strapi `orders` |
| `/login` | Sign in (email/password + Google) |
| `/register` | Create an account (email/password + Google) |
| `/forgot-password` | Password reset email |
| `/account` | Protected profile page |

Non-page routes: `sitemap.xml` (`app/sitemap.ts`), `robots.txt` (`app/robots.ts`), plus
global `loading.tsx` and `not-found.tsx`.

The `Header` (sticky, search, cart badge) and `Footer` live in the **root layout**
(`app/layout.tsx`), so they render on every page.

### Cart & checkout flow

1. `AddToCartButton` writes to a client-side cart (`lib/cart.tsx`, persisted to
   `localStorage` under `pickenby-cart`).
2. `/cart` shows line items with quantity controls + order summary.
3. `/checkout` collects delivery/payment details and `POST`s to the frontend
   `/api/orders` route, which proxies to Strapi `POST /api/orders` (public `create`).
4. On success the cart clears and `/order-confirmation` shows the order reference.

> Cart is intentionally **client-side only** (no auth / no backend cart) — fine for
> local development. Orders are persisted server-side in Strapi.

### Authentication (Firebase)

Login and registration are handled **client-side** with **Firebase Auth**: email &
password plus one-tap **Google** sign-in. Pages live at `/login`, `/register`,
`/forgot-password`, and `/account` (the last is only reachable when signed in).

- No server-side sessions — auth state is managed by a React context
  (`pickenby/lib/auth.tsx`) driven by `onAuthStateChanged`.
- Checkout stays **guest-based**; authenticated users are not yet linked to orders.
- Requires a Firebase web-app config in `pickenby/.env.local`
  (`NEXT_PUBLIC_FIREBASE_*`). Without it the app builds and runs normally — the
  auth forms just show a "Firebase is not configured" notice on submit.

### Headless CMS (`backend/`)

Seven content types: `category`, `brand`, `product`, `hero-slide`, `promo-banner`,
`setting` (a single type for site-wide config: logo, favicon, footer & contact
info), and `order`.
See [docs/CONTENT-MODEL.md](docs/CONTENT-MODEL.md) and [docs/API.md](docs/API.md).

---

## Auto-seeding

`backend/src/index.ts` runs on every boot (unless `SEED_ON_BOOT=false`) and, for each
collection, seeds **only if empty**. It:

1. Seeds `brand`s (12 base), `category`ies (11), `hero-slide`s (3), `promo-banner`s (3).
2. Seeds 28 `product`s (deduped from the old mock data) with rail flags and
   brand/category relations — creating extra `brand` rows for seller names not in the
   base list (e.g. "Silver Electronics", "Pure It").
3. Seeds the `setting` single type (site name, contact details) if empty.
4. Grants the **Public** role `find`/`findOne` on the read types, `find` on
   `setting`, and `create` on `order`.

To disable: set `SEED_ON_BOOT=false` in `backend/.env`.

---

## Environment variables

### `backend/.env`

| Variable | Purpose | Default |
|----------|---------|---------|
| `HOST` / `PORT` | Server bind / port | `0.0.0.0` / `1337` |
| `APP_KEYS` | Session signing keys (comma-separated) | required |
| `API_TOKEN_SALT`, `ADMIN_JWT_SECRET`, `JWT_SECRET`, `TRANSFER_TOKEN_SALT`, `ENCRYPTION_KEY` | Strapi secrets | required |
| `CORS_ORIGIN` | Allowed frontend origin(s) | `http://localhost:3000` |
| `DATABASE_CLIENT` | `sqlite` / `postgres` / `mysql` | `sqlite` |
| `DATABASE_FILENAME` | SQLite file path | `.tmp/data.db` |
| `DATABASE_HOST/PORT/NAME/USERNAME/PASSWORD/SSL` | DB connection (PG/MySQL) | — |
| `SEED_ON_BOOT` | Run auto-seed on boot | `true` (set `false` to disable) |

Generate secure values with `openssl rand -base64 24` or use the ones already in the
existing `.env` (they are git-ignored).

### `pickenby/.env.local`

| Variable | Purpose | Default |
|----------|---------|---------|
| `NEXT_PUBLIC_STRAPI_URL` | Strapi API base URL | `http://localhost:1337` |
| `STRAPI_API_TOKEN` | Read/API token (optional; only needed if Public role is locked down) | — |
| `NEXT_PUBLIC_SITE_URL` | Canonical site URL (metadata, sitemap) | `http://localhost:3000` |
| `NEXT_PUBLIC_FIREBASE_*` | Firebase web-app config (`API_KEY`, `AUTH_DOMAIN`, `PROJECT_ID`, `STORAGE_BUCKET`, `MESSAGING_SENDER_ID`, `APP_ID`) — enables login/register | — |

---

## Documentation

- [docs/CONTENT-MODEL.md](docs/CONTENT-MODEL.md) — every content type, field by field, plus how to add and publish products so they show on the storefront.
- [docs/API.md](docs/API.md) — Strapi endpoints used by the frontend and the order-creation contract.
- [pickenby/README.md](pickenby/README.md) — frontend-specific guide.
- [backend/README.md](backend/README.md) — CMS-specific guide.

---

## Git

Repository lives at `https://github.com/Entrogic/pickenby-ecom.git`, branch `main`.
`node_modules`, build output (`.next`, `dist`, `.strapi`, `.tmp`), databases, and real
`.env` files are git-ignored (see the root `.gitignore`)."# e-com" 
