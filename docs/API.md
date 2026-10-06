# API reference

How the storefront and any integrator talk to the Pickenby Strapi backend.

- Base URL: `http://localhost:1337` (dev) — set in the frontend via `NEXT_PUBLIC_STRAPI_URL`.
- Response shape is Strapi v5: `{ "data": [...], "meta": {...} }` for lists,
  `{ "data": {...}, "meta": {...} }` for singles. Attributes are **flat** on each item.
- Draft & publish types (`category`, `brand`, `product`, `hero-slide`, `promo-banner`)
  only return **published** entries through the public API. `order` is not draft/publish.
- Auth: public read endpoints need no token (Public role permissions are granted by the
  seeder). For a locked-down setup, pass a read token as `Authorization: Bearer <token>`
  (`STRAPI_API_TOKEN`).

## Read endpoints (used by the storefront)

| Purpose | Endpoint + query |
|---------|------------------|
| List products (populated) | `GET /api/products?populate[brand]=1&populate[image]=1&populate[categories]=1` |
| Product by slug | `GET /api/products?filters[slug][$eq]=<slug>` |
| Products on a rail | `GET /api/products?filters[isTopSelling][$eq]=true&pagination[pageSize]=50` |
| Products in a category | `GET /api/products?filters[categories][slug][$eq]=<slug>&pagination[page]=1&pagination[pageSize]=24` |
| Products for a brand | `GET /api/products?filters[brand][slug][$eq]=<slug>` |
| Search | `GET /api/products?filters[$or][0][title][$containsi]=<q>&filters[$or][1][seller][$containsi]=<q>` |
| All products (sorted) | `GET /api/products?sort[0]=price:asc` (or `price:desc`, `createdAt:desc`) |
| Categories | `GET /api/categories?pagination[pageSize]=100&sort[0]=label:asc` |
| Category by slug | `GET /api/categories?filters[slug][$eq]=<slug>` |
| Brands | `GET /api/brands?pagination[pageSize]=50&sort[0]=name:asc` |
| Hero slides | `GET /api/hero-slides?sort[0]=sort:asc` |
| Promo banners | `GET /api/promo-banners?sort[0]=sort:asc` |
| Site settings | `GET /api/setting?populate[logo]=1&populate[favicon]=1` |

Note: `setting` is a single type — the response `data` is one object (no pagination).
Fields: `siteName`, `tagline`, `logo`, `favicon`, `footerContent`, `contactPhone`,
`contactEmail`, `whatsapp`, `address`, `socials` (json array of `{ label, url, icon }`).
Consumed by `getSiteSettings()` in `pickenby/lib/cms.ts`, which returns `null` when
offline/unpublished so pages fall back to hardcoded defaults.

### Field notes

- `populate[X]=1` sets boolean-form populate; the storefront uses `PRODUCT_POPULATE`
  (`brand`, `image`, `categories`) — see `pickenby/lib/cms.ts`.
- `decimal` values may arrive as numbers (Strapi 5 REST returns them as numbers); the
  frontend `num()` helper handles both number and string forms.
- `json` attributes (`product.badges`, `order.items`) return as actual JSON
  arrays/objects.

## Order creation

Orders are read-only hidden from the public, but `create` is public.

**Frontend → proxy → Strapi flow:**

```
POST /api/orders                    (Next.js route handler: pickenby/app/api/orders/route.ts)
  ↓ forwards { data: body }
POST http://localhost:1337/api/orders
```

### Request body (sent to the proxy)

```json
{
  "customerName": "Rahim Uddin",
  "phone": "01711111111",
  "address": "House 4, Road 7, Dhanmondi",
  "city": "Dhaka",
  "division": "Dhaka",
  "paymentMethod": "Cash on Delivery",
  "note": "Call before delivery",
  "items": [
    { "slug": "fujita-5-0l-faf-501dw-digital-display-air-fryer", "title": "Fujita 5.0L Air Fryer", "price": 5900, "qty": 2 }
  ],
  "total": 11800
}
```

The route handler requires `customerName`, `phone`, and `address` (non-empty strings),
then sends `{ "data": <body> }` to Strapi.

### Response

`201` with `{ "data": { ...fields, "documentId": "<ref>", "status": "pending" }, "meta": {} }`.
The frontend uses `data.documentId` as the order reference shown on
`/order-confirmation`.

`paymentMethod` accepted values: `Cash on Delivery`, `bKash`, `Nagad`, `Card`.
`status` values: `pending`, `confirmed`, `shipped`, `delivered`, `cancelled` (default `pending`).

## Auth (users-permissions)

Authentication endpoints exist under `/api/auth` (register/login/etc.) from the
built-in `@strapi/plugin-users-permissions`. The storefront currently does **not** use
them (cart is client-side); see the [Strapi users-permissions docs](https://docs.strapi.io/dev-docs/plugins/users-permissions)
to enable account login.