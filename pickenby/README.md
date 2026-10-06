# pickenby — Next.js storefront

The customer-facing shop. Server-rendered **Next.js 16 (App Router)** + **React 19**,
styled with **Tailwind CSS v4** (CSS-first config) and `lucide-react` icons. It reads
published content from the Strapi backend and falls back to bundled mock data when
Strapi is unreachable or empty.

```bash
npm install
npm run dev      # http://localhost:3000
```

## Scripts

| Script | What it does |
|--------|--------------|
| `npm run dev`   | `next dev` (Turbopack) |
| `npm run build` | `next build` (pre-renders product/category pages via `generateStaticParams`) |
| `npm run start` | `next start` (serve the production build) |

## Routing map

| Route | File | Purpose |
|-------|------|---------|
| `/` | `app/page.tsx` | Homepage (hero, promos, top-selling, brands, trending, rails) |
| `/products` | `app/products/page.tsx` | All products, paginated + sortable |
| `/products/[slug]` | `app/products/[slug]/page.tsx` | Product detail + related |
| `/category/[slug]` | `app/category/[slug]/page.tsx` | Category listing |
| `/brands/[slug]` | `app/brands/[slug]/page.tsx` | Brand listing |
| `/search` | `app/search/page.tsx` | Title/seller search |
| `/cart` | `app/cart/page.tsx` | Client-side cart |
| `/checkout` | `app/checkout/page.tsx` | Delivery/payment form |
| `/order-confirmation` | `app/order-confirmation/page.tsx` | Order success |
| `/api/orders` | `app/api/orders/route.ts` | `POST` proxy → Strapi orders |
| `/login` | `app/login/page.tsx` | Sign in (email/password + Google) |
| `/register` | `app/register/page.tsx` | Create an account |
| `/forgot-password` | `app/forgot-password/page.tsx` | Password reset email |
| `/account` | `app/account/page.tsx` | Profile + log out (requires sign-in) |
| `sitemap.xml` / `robots.txt` | `app/sitemap.ts` / `app/robots.ts` | SEO |

`app/layout.tsx` wraps **every** page with the `Header` (sticky, search, cart badge)
and `Footer`. `app/loading.tsx` and `app/not-found.tsx` provide shared states.

## Data flow

All CMS access goes through two files in `lib/`:

1. **`lib/strapi.ts`** — low-level client:
   - `fetchAPI(path, params)` / `fetchOne(...)` with optional bearer `STRAPI_API_TOKEN`,
     `next: { revalidate: 60 }` caching, and dev-mode warning logs for `40x` errors.
   - `unwrap()` handles Strapi v5 (flat) vs v4 (`attributes`-nested) response shapes.
   - `getStrapiMedia()` resolves a media object to an absolute URL.

2. **`lib/cms.ts`** — typed getters used by pages (`getProducts`, `getProductBySlug`,
   `getAllProducts`, `getProductsByCategory`, `getProductsByBrand`, `searchProducts`,
   `getCategories`, `getCategoryBySlug`, `getBrands`/`getBrandsWithSlugs`, `getTrending`,
   `getHeroSlides`, `getPromoBanners`, `getBrandBySlug`, `getSiteSettings`).

**Fallback strategy:** every page calls these and, when the result is empty (backend
offline, or type has no published entries), it falls back to the static arrays in
`lib/data.ts`. This means the storefront never renders blank during an outage.
`getSiteSettings()` (`/api/setting`) instead returns `null`, so the layout keeps its
hardcoded header/footer and metadata defaults as fallbacks.

Pages that list products set `export const revalidate = 60` for ISR; dynamic pages
(`/products/[slug]`, `/category/[slug]`) pre-render a bounded set at build time via
`generateStaticParams` and server-render the rest on demand.

## Cart & checkout

- `lib/cart.tsx` exposes a `CartProvider` + `useCart()` (context + `useReducer`),
  persisted to `localStorage` under `pickenby-cart`.
- `AddToCartButton` adds a product; `CartCount` is the header badge.
- `/checkout` (`components/CheckoutForm.tsx`) validates the form and `POST`s to
  `/api/orders`, which forwards `{ data: body }` to Strapi `POST /api/orders`.
- On success, the cart clears and the user is redirected to `/order-confirmation`.

Cart state lives only in the browser (no server cart / no auth).

## Environment variables

Create `pickenby/.env.local`:

| Variable | Purpose | Default |
|----------|---------|---------|
| `NEXT_PUBLIC_STRAPI_URL` | Strapi API base URL | `http://localhost:1337` |
| `STRAPI_API_TOKEN` | Strapi API token (only if the Public role is locked down) | — |
| `NEXT_PUBLIC_SITE_URL` | Canonical URL for metadata + sitemap | `http://localhost:3000` |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Firebase web app config (Auth) | — |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Firebase web app config (Auth) | — |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Firebase web app config (Auth) | — |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Firebase web app config (Auth) | — |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Firebase web app config (Auth) | — |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Firebase web app config (Auth) | — |

## Authentication (Firebase)

Login/registration is **client-side only** via Firebase Auth — the storefront has no
server-side session handling. Order checkout stays guest-based (unauth).

- Routes: `/login`, `/register`, `/forgot-password`, `/account`.
- Context: `lib/auth.tsx` (`AuthProvider` + `useAuth`) wrapped in the root layout;
  `lib/firebase.ts` initializes Firebase guarded by `typeof window`.
- Without `NEXT_PUBLIC_FIREBASE_*` env values the app still builds and renders — the
  auth forms show a "Firebase is not configured" error on submit.

**Setup:** create a Firebase project → enable **Email/Password** and **Google**
sign-in providers (Authentication → Sign-in method) → add a **Web app**, copy its
config into `NEXT_PUBLIC_FIREBASE_*` → add `http://localhost:3000` to
**Authorized domains**. Google sign-in uses a popup.

## Styling

Tailwind v4 CSS-first config lives in `app/globals.css` (`@import "tailwindcss"`,
`@theme` tokens). Reusable helpers:

- `container-page` — max-width content wrapper.
- `scrollbar-none` — hides scrollbars on horizontal scrollers.
- Theme tokens: `brand-*`, `ink`, `muted`, `page`, `tile`, `lavender`, `gold`, `sale`,
  `sold`, `footer`, plus `shadow-card` / `shadow-float`.

Product images come from Strapi uploads; the asset host is allow-listed in
`next.config.ts` (`images.remotePatterns` for `localhost:1337/uploads`).