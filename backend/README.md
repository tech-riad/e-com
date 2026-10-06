# backend — Pickenby CMS (Strapi 5)

Headless CMS powering the Pickenby storefront. Runs as its own server on port 1337
(admin panel at `/admin`) and exposes a REST API under `/api`.

```bash
npm run develop   # dev server with auto-reload (http://localhost:1337)
npm run start     # production server
npm run build     # build the admin panel
npm run console   # interactive Strapi console
```

## Content types

| Type | Collection name | Purpose | Draft/Publish |
|------|-----------------|---------|---------------|
| `category` | `categories` | nav, sidebar, circles, trending tiles | yes |
| `brand` | `brands` | brand strip + brand pages | yes |
| `product` | `products` | catalog (rails, top-selling, detail) | yes |
| `hero-slide` | `hero_slides` | homepage hero carousel | yes |
| `promo-banner` | `promo_banners` | promo strip | yes |
| `setting` | `settings` (single type) | site-wide config: logo, favicon, footer & contact info | yes |
| `order` | `orders` | customer checkout orders | no |

Full field reference and a product-authoring guide: see
[`../docs/CONTENT-MODEL.md`](../docs/CONTENT-MODEL.md).

## Auto-seeding & permissions

File: `src/index.ts` (runs on every boot unless disabled).

On boot it, **idempotently** (only when a collection is empty):

1. Seeds `brands` (12 base), `categories` (11), `promo_banners` (3) —
   as **published** entries with slugs. (Hero slides are **not** seeded — they are
   image-only banners authored in admin; any legacy image-less rows are removed on boot.)
2. Seeds `products` (28, deduped from the old mock data) with rail flags
   (`isTopSelling`, `isTopPick`, `isNewArrival`, `isRecentSaving`) and connected
   `brand`/`categories` relations (adding extra `brand` rows for seller names not in the
   base list).
3. Seeds a single `setting` entry (site name, contact details) if none exists.
4. Grants the **Public** users-permissions role:
   - `find` + `findOne` on `category`, `brand`, `product`, `hero-slide`, `promo-banner`
   - `find` on the `setting` single type
   - `create` on `order`

To skip all of it, set `SEED_ON_BOOT=false`. To re-seed from scratch, delete the
SQLite database (`.tmp/data.db`) and restart.

## Environment variables

See `backend/.env.example`. Active values live in `backend/.env` (git-ignored).

| Variable | Purpose | Default |
|----------|---------|---------|
| `HOST` / `PORT` | Bind address / port | `0.0.0.0` / `1337` |
| `APP_KEYS` | Session keys (comma-separated) | required |
| `API_TOKEN_SALT`, `ADMIN_JWT_SECRET`, `JWT_SECRET`, `TRANSFER_TOKEN_SALT`, `ENCRYPTION_KEY` | Secrets | required |
| `CORS_ORIGIN` | Allowed origin(s) for `strapi::cors` | `http://localhost:3000` |
| `DATABASE_CLIENT` | `sqlite`, `postgres`, or `mysql` | `sqlite` |
| `DATABASE_FILENAME` | SQLite file (relative) | `.tmp/data.db` |
| `DATABASE_HOST/PORT/NAME/USERNAME/PASSWORD/SSL` | PG/MySQL connection | — |
| `SEED_ON_BOOT` | Run auto-seed on boot | enabled |

Generate secrets with e.g. `openssl rand -base64 24`.

## Database

Defaults to **SQLite** at `.tmp/data.db` (no extra setup). For PostgreSQL/MySQL set
`DATABASE_CLIENT` and the `DATABASE_*` connection vars — see `config/database.ts`.

## API

REST API is available at `http://localhost:1337/api/<collection>`. Public read access
is granted automatically by the seeder. Full endpoints and the order-creation contract:
see [`../docs/API.md`](../docs/API.md).

### Config overview

- `config/server.ts` — host, port, app keys, webhooks.
- `config/admin.ts` — admin secrets + flags.
- `config/api.ts` — REST limits (`defaultLimit 25`, `maxLimit 100`) and document settings.
- `config/middlewares.ts` — global middleware + CORS (origin from `CORS_ORIGIN`).
- `config/plugins.ts` — users-permissions sessions, upload allowed types.
- `config/database.ts` — multi-client DB factory.

## Adding a new content type

1. Use the admin **Content-Type Builder**, or create
   `src/api/<name>/content-types/<name>/schema.json` + `controllers/services/routes`.
2. Restart `strapi develop` so `types/generated/*` regenerate.
3. To expose it publicly, add its `find`/`findOne` (or `create`) action to the
   `actions` array in `src/index.ts` (`ensurePublicPermissions`).