# Content model

Reference for the Pickenby Strapi content types. Schema source of truth:
`backend/src/api/*/content-types/*/schema.json`.

## Site settings

Collection: single type `settings` · draft & publish: yes (must be published to show)

| Field | Type | Notes |
|-------|------|-------|
| `siteName` | string | Brand name (header logo text, footer, metadata) |
| `tagline` | string | Short descriptor (footer + SEO description) |
| `logo` | media | Header logo image |
| `favicon` | media | Browser favicon (metadata `icons`) |
| `footerContent` | text | Footer about/blurb paragraph |
| `contactPhone` | string | Shown in header top bar + footer (`tel:` link) |
| `contactEmail` | string | Footer contact (`mailto:` link) |
| `whatsapp` | string | International-format number for `wa.me/` links |
| `address` | text | Footer address line |
| `socials` | json | Array of `{ label, url, icon? }` — footer badges |

Seeded on boot with defaults (siteName "Pickenby", contact phone, etc.) when the
entry does not exist. Consumed by the storefront via `lib/cms.ts` →
`getSiteSettings()`; falls back to hardcoded defaults when offline/unpublished.

## Category

Collection: `categories` · draft & publish: yes

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `label` | string | yes | Display name |
| `slug` | uid (from `label`) | yes | URL slug |
| `icon` | enumeration | no | `tv, snowflake, fridge, washer, pot, flame, oven, blender, speaker, drops, house` |
| `tone` | string | no | Tailwind gradient classes for circle/trending tiles |
| `navVisible` | boolean | no (default `true`) | Show in the header nav |
| `trendingSection` | enumeration | no (default `none`) | `none`, `large`, or `small` — drives the homepage "Trending categories" `large`/`small` tile groups |
| `parent` / `children` | relation | no | Self-referential hierarchy (not used by current frontend) |
| `products` | relation (manyToMany) | no | Products in this category (`inversedBy` on product) |

The storefront homepage uses `trendingSection`: categories marked `large` fill the two
big Trending tiles, `small` fill the eight small tiles. Seeded categories default to
`none`, so name/`tone`/`trendingSection` should be set for those tiles to appear.

## Brand

Collection: `brands` · draft & publish: yes

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `name` | string | yes (unique) | Display name |
| `slug` | uid (from `name`) | yes | URL slug |
| `logo` | media | no | Brand image |
| `featured` | boolean | no (default `false`) | Not used by frontend yet |
| `products` | relation (oneToMany) | no | Products for this brand |

## Product

Collection: `products` · draft & publish: yes · **must be published to appear in the API**

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `title` | string | yes | Product name |
| `slug` | uid (from `title`) | yes | URL slug |
| `brand` | relation (manyToOne) | no | → `brand` |
| `categories` | relation (manyToMany) | no | → `category` |
| `seller` | string | no | Seller name shown on cards |
| `price` | decimal | yes | Selling price |
| `mrp` | decimal | no | Original price (strikethrough) |
| `discount` | integer | no (default `0`) | Discount percentage pill |
| `sold` | integer | no (default `0`) | "Sold count" badge |
| `outOfStock` | boolean | no (default `false`) | Shows "Out of Stock" |
| `emi` | boolean | no (default `false`) | Shows "0% EMI" |
| `badges` | json | no | String array — see [badges values](#badges-values) |
| `image` | media | no | Main product photo (used on cards, cart and as the gallery cover) |
| `gallery` | media (multiple) | no | Extra product photos shown as a thumbnail gallery on the product page |
| `isTopSelling` | boolean | no (default `false`) | → "Top Selling Products" grid |
| `isTopPick` | boolean | no (default `false`) | → "Top picks" rail |
| `isNewArrival` | boolean | no (default `false`) | → "New arrivals" rail |
| `isRecentSaving` | boolean | no (default `false`) | → "Recent savings" rail |

### `badges` values

The storefront renders only these values (each with its own icon):

```json
["Bestseller"]
["Free delivery"]
["New"]
```

### Getting a product onto the homepage

The four rail flag booleans above are what route a product into each section:

1. Create a **Product**, fill `title`, `price`, `mrp` (optional), and connect a `brand`
   (and optionally `categories`).
2. Set the rail flag(s) you want — a product can be in more than one rail.
3. Upload an `image` (optional — a placeholder is shown otherwise), and optionally more
   photos to `gallery` for the product-page gallery.
4. **Publish** the entry (drafts are invisible to the public API).

## Hero slide

Collection: `hero_slides` · draft & publish: yes

Hero slides are **image-only** banners. Upload a full-bleed banner image (all text baked
into the image) and the storefront renders it edge-to-edge as a responsive carousel slide.

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `image` | media | yes | Full-bleed banner image |
| `sort` | integer | no (default `0`) | Order (ascending) |

## Promo banner

Collection: `promo_banners` · draft & publish: yes

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `brand` | string | yes | Big brand text |
| `text` | string | no | Subtitle |
| `tone` | string | no | Tailwind classes (e.g. `bg-[#0d2a6b] text-white`) |
| `image` | media | no | Background |
| `sort` | integer | no (default `0`) | Order |

## Order

Collection: `orders` · draft & publish: **no** · created only via `POST /api/orders`

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `customerName` | string | yes | Customer full name |
| `phone` | string | yes | Contact number |
| `address` | text | yes | Delivery address |
| `city` | string | no | City/town |
| `division` | string | no | e.g. `Dhaka`, `Chattogram`, … |
| `paymentMethod` | enumeration | no (default `Cash on Delivery`) | `Cash on Delivery`, `bKash`, `Nagad`, `Card` |
| `note` | text | no | Customer note |
| `items` | json | no | Array of `{ slug, title, price, qty }` |
| `total` | decimal | no | Order total |
| `status` | enumeration | no (default `pending`) | `pending`, `confirmed`, `shipped`, `delivered`, `cancelled` |

Orders are not browsable by the public (only `create` is exposed); manage them in the
Strapi admin content manager.