import { fetchAPI, fetchAPIWithMeta, fetchOne, getStrapiMediaUrl, getStrapiMediaUrls } from "./strapi";
import type { Product } from "./data";

// ---- Raw Strapi attribute shapes (subset we use) ----

type MediaAttr = { url?: string } | null;

type BrandAttr = { id: number; name: string; slug?: string; logo?: unknown };
type CategoryAttr = {
  id: number;
  label: string;
  slug?: string;
  icon?: string;
  tone?: string;
  navVisible?: boolean;
  trendingSection?: "none" | "large" | "small";
  parent?: { id: number; label?: string; slug?: string } | null;
  children?: { id: number; label?: string; slug?: string }[] | null;
  image?: unknown;
};
type ProductAttr = {
  id: number;
  title: string;
  slug?: string;
  seller?: string;
  price: number | string;
  mrp?: number | string;
  discount?: number;
  sold?: number;
  outOfStock?: boolean;
  emi?: boolean;
  badges?: Product["badges"];
  image?: { data?: { attributes?: { url?: string } } | null } | MediaAttr;
  gallery?: unknown;
  brand?: { data?: { attributes?: { name?: string } } | null } | BrandAttr | null;
  categories?: { data?: { attributes?: { label?: string } }[] | null } | CategoryAttr[] | null;
  isTopSelling?: boolean;
  isTopPick?: boolean;
  isNewArrival?: boolean;
  isRecentSaving?: boolean;
};
type HeroAttr = {
  id: number;
  sort?: number;
  image?: unknown;
};
type PromoAttr = { id: number; brand: string; text?: string; tone?: string; image?: unknown };

type SettingAttr = {
  id: number;
  siteName?: string;
  tagline?: string;
  logo?: unknown;
  favicon?: unknown;
  footerContent?: string;
  contactPhone?: string;
  contactEmail?: string;
  whatsapp?: string;
  address?: string;
  socials?: { label?: string; url?: string; icon?: string }[] | null;
};

export type Category = {
  label: string;
  slug: string;
  icon: string;
  tone?: string;
  trendingSection?: string;
  parentSlug?: string;
  children?: { label: string; slug: string }[];
  productCount?: number;
  image?: string;
};

const num = (v: number | string | undefined | null, fallback = 0) =>
  typeof v === "string" ? Number(v) || fallback : (v ?? fallback);

const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9\u0980-\u09FF]+/gi, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || "item";

function toProduct(p: ProductAttr): Product {
  // brand may be populated object, flat object, or v4 {data:{attributes}}
  let brandName: string | undefined;
  const b = p.brand as unknown;
  if (b && typeof b === "object") {
    if ("name" in (b as Record<string, unknown>)) brandName = (b as BrandAttr).name;
    else if ("data" in (b as Record<string, unknown>)) {
      const d = (b as { data?: { attributes?: { name?: string } } | null }).data;
      brandName = d?.attributes?.name;
    }
  }
  const cover = getStrapiMediaUrl(p.image);
  const images = [...new Set([cover, ...getStrapiMediaUrls(p.gallery)].filter((u): u is string => Boolean(u)))];
  const image = cover ?? images[0];

  return {
    id: String(p.id),
    slug: p.slug ?? slugify(p.title),
    seller: p.seller,
    brand: brandName,
    title: p.title,
    price: num(p.price),
    mrp: num(p.mrp, num(p.price)),
    image,
    images,
    sold: p.sold ?? undefined,
    outOfStock: p.outOfStock,
    discount: p.discount ?? undefined,
    badges: Array.isArray(p.badges) ? p.badges : undefined,
    emi: p.emi,
  };
}

const PRODUCT_POPULATE = {
  "populate[brand]": true,
  "populate[image]": true,
  "populate[gallery]": true,
  "populate[categories]": true,
} as const;

export async function getProducts(filter?: {
  isTopSelling?: boolean;
  isTopPick?: boolean;
  isNewArrival?: boolean;
  isRecentSaving?: boolean;
}): Promise<Product[]> {
  const params: Record<string, string | number | boolean> = {
    ...PRODUCT_POPULATE,
    "pagination[pageSize]": 50,
  };
  if (filter?.isTopSelling) params["filters[isTopSelling][$eq]"] = true;
  if (filter?.isTopPick) params["filters[isTopPick][$eq]"] = true;
  if (filter?.isNewArrival) params["filters[isNewArrival][$eq]"] = true;
  if (filter?.isRecentSaving) params["filters[isRecentSaving][$eq]"] = true;

  const rows = await fetchAPI<ProductAttr>("/products", params);
  return rows.map(toProduct);
}

/** Single product by slug (detail page). */
export async function getProductBySlug(slug: string): Promise<Product | null> {
  const rows = await fetchAPI<ProductAttr>("/products", {
    ...PRODUCT_POPULATE,
    "filters[slug][$eq]": slug,
    "pagination[pageSize]": 1,
  });
  return rows.length > 0 ? toProduct(rows[0]) : null;
}

/** Recursively collect all descendant category slugs for a parent. */
async function getChildSlugs(parentSlug: string, _visited = new Set<string>()): Promise<string[]> {
  if (_visited.has(parentSlug)) return [];
  _visited.add(parentSlug);
  const cats = await getCategories();
  const parent = cats.find((c) => c.slug === parentSlug);
  if (!parent?.children?.length) return [];
  const slugs = parent.children.map((c) => c.slug);
  for (const child of [...slugs]) {
    slugs.push(...await getChildSlugs(child, _visited));
  }
  return [...new Set(slugs)];
}

/** Paginated products in a category (listing page). Includes child categories. */
export async function getProductsByCategory(
  categorySlug: string,
  page = 1,
  pageSize = 24
): Promise<{ products: Product[]; total: number }> {
  const childSlugs = await getChildSlugs(categorySlug);
  const allSlugs = [categorySlug, ...childSlugs];

  const params: Record<string, string | number | boolean> = {
    ...PRODUCT_POPULATE,
    "pagination[page]": page,
    "pagination[pageSize]": pageSize,
  };

  if (allSlugs.length === 1) {
    params["filters[categories][slug][$eq]"] = categorySlug;
  } else {
    allSlugs.forEach((s, i) => {
      params[`filters[categories][slug][$in][${i}]`] = s;
    });
  }

  const { data, total } = await fetchAPIWithMeta<ProductAttr>("/products", params);
  return { products: data.map(toProduct), total };
}

/** Paginated products of a brand. */
export async function getProductsByBrand(
  brandSlug: string,
  page = 1,
  pageSize = 24
): Promise<Product[]> {
  const rows = await fetchAPI<ProductAttr>("/products", {
    ...PRODUCT_POPULATE,
    "filters[brand][slug][$eq]": brandSlug,
    "pagination[page]": page,
    "pagination[pageSize]": pageSize,
  });
  return rows.map(toProduct);
}

const SEARCH_ALIASES: Record<string, string[]> = {
  ac: ["air conditioner"],
  tv: ["television"],
  tvs: ["television"],
  fridge: ["refrigerator", "freezer"],
  washer: ["washing machine"],
  phone: ["mobile", "smartphone"],
  mobile: ["mobile phone", "smartphone"],
  "এসি": ["air conditioner"],
  "এয়ার কন্ডিশনার": ["air conditioner"],
  "টিভি": ["television"],
  "টিভির": ["television"],
  "ফ্রিজ": ["refrigerator", "freezer"],
  "ওয়াশিং মেশিন": ["washing machine"],
  "ওয়াশার": ["washing machine"],
  "ফোন": ["mobile", "smartphone"],
  "মোবাইল": ["mobile phone", "smartphone"],
};

/** Case-insensitive search across product text, seller, brand and category. */
export async function searchProducts(query: string, limit = 24): Promise<Product[]> {
  const q = query.trim();
  if (!q) return [];

  const terms = [q, ...(SEARCH_ALIASES[q.toLowerCase()] ?? [])];
  const filters: Record<string, string | number | boolean> = {
    ...PRODUCT_POPULATE,
    "pagination[pageSize]": limit,
  };

  terms.forEach((term, termIndex) => {
    const offset = termIndex * 4;
    filters[`filters[$or][${offset}][title][$containsi]`] = term;
    filters[`filters[$or][${offset + 1}][seller][$containsi]`] = term;
    filters[`filters[$or][${offset + 2}][brand][name][$containsi]`] = term;
    filters[`filters[$or][${offset + 3}][categories][label][$containsi]`] = term;
  });

  const rows = await fetchAPI<ProductAttr>("/products", filters);
  return rows.map(toProduct);
}

export async function getCategories(): Promise<Category[]> {
  const rows = await fetchAPI<CategoryAttr>("/categories", {
    "pagination[pageSize]": 100,
    "sort[0]": "label:asc",
    "populate[parent]": true,
    "populate[children]": true,
    "populate[image]": true,
  });
  return rows.map((c) => ({
    label: c.label,
    slug: c.slug ?? slugify(c.label),
    icon: c.icon ?? "house",
    tone: c.tone,
    trendingSection: c.trendingSection,
    parentSlug: c.parent?.slug,
    children: Array.isArray(c.children)
      ? c.children.map((ch) => ({
          label: ch.label ?? "",
          slug: ch.slug ?? slugify(ch.label ?? ""),
        }))
      : undefined,
    image: getStrapiMediaUrl(c.image),
  }));
}

/** Fetch product counts for each category slug (lightweight — pageSize=1, only reads meta.total). */
export async function getCategoryProductCounts(
  slugs: string[]
): Promise<Map<string, number>> {
  const counts = new Map<string, number>();
  await Promise.all(
    slugs.map(async (slug) => {
      try {
        const { total } = await fetchAPIWithMeta<ProductAttr>("/products", {
          "filters[categories][slug][$eq]": slug,
          "pagination[pageSize]": 1,
        });
        counts.set(slug, total);
      } catch {
        counts.set(slug, 0);
      }
    })
  );
  return counts;
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const rows = await fetchAPI<CategoryAttr>("/categories", {
    "filters[slug][$eq]": slug,
    "pagination[pageSize]": 1,
    "populate[parent]": true,
    "populate[children]": true,
  });
  const row = rows[0];
  if (row) {
    return {
      label: row.label,
      slug: row.slug ?? slugify(row.label),
      icon: row.icon ?? "house",
      tone: row.tone,
      trendingSection: row.trendingSection,
      parentSlug: row.parent?.slug,
      children: Array.isArray(row.children)
        ? row.children.map((ch) => ({
            label: ch.label ?? "",
            slug: ch.slug ?? slugify(ch.label ?? ""),
          }))
        : undefined,
    };
  }
  // Fallback: match client-side (slug may be derived when CMS slug empty).
  const all = await getCategories();
  return all.find((c) => c.slug === slug) ?? null;
}

export async function getNavLabels(): Promise<string[]> {
  const cats = await getCategories();
  // Prefer CMS order; page falls back to mock navLinks when empty.
  return cats.map((c) => c.label);
}

/** Categories split for the trending section (large tiles + small tiles). */
export async function getTrending(): Promise<{
  large: { label: string; slug: string; tone: string; image?: string }[];
  small: { label: string; slug: string; tone: string; image?: string }[];
}> {
  const cats = await getCategories();
  const tone = (i: number) =>
    cats[i]?.tone ?? `from-stone-200 to-stone-400`;
  const large = cats
    .filter((c) => c.trendingSection === "large")
    .map((c) => ({ label: c.label, slug: c.slug, tone: c.tone ?? tone(0), image: c.image }));
  const small = cats
    .filter((c) => c.trendingSection === "small")
    .map((c) => ({ label: c.label, slug: c.slug, tone: c.tone ?? tone(1), image: c.image }));
  return { large, small };
}

export async function getBrands(): Promise<string[]> {
  const rows = await fetchAPI<BrandAttr>("/brands", {
    "pagination[pageSize]": 50,
    "sort[0]": "name:asc",
  });
  return rows.map((b) => b.name);
}

export async function getBrandsWithSlugs(): Promise<{ name: string; slug: string; image?: string }[]> {
  const rows = await fetchAPI<BrandAttr>("/brands", {
    "pagination[pageSize]": 100,
    "sort[0]": "name:asc",
    "populate[logo]": true,
  });
  return rows.map((b) => ({
    name: b.name,
    slug: b.slug ?? slugify(b.name),
    image: getStrapiMediaUrl(b.logo),
  }));
}

export async function getHeroSlides() {
  const rows = await fetchAPI<HeroAttr>("/hero-slides", {
    "pagination[pageSize]": 10,
    "sort[0]": "sort:asc",
    "populate[image]": true,
  });
  return rows
    .map((h) => ({
      seller: "",
      headline: "",
      sub: "",
      mrp: 0,
      price: 0,
      product: "",
      perks: [] as string[],
      image: getStrapiMediaUrl(h.image),
    }))
    .filter((s) => Boolean(s.image));
}

export async function getPromoBanners() {
  const rows = await fetchAPI<PromoAttr>("/promo-banners", {
    "pagination[pageSize]": 10,
    "sort[0]": "sort:asc",
    "populate[image]": true,
  });
  return rows.map((b) => ({ brand: b.brand, text: b.text ?? "", tone: b.tone ?? "", image: getStrapiMediaUrl(b.image) }));
}

/** Detail-page URL for a product (CMS slug, mock id fallback). */
export function productUrl(p: { slug?: string; id: string }) {
  return `/products/${p.slug ?? p.id}`;
}

/** Listing-page URL for a category. */
export function categoryUrl(c: { slug: string }) {
  return `/category/${c.slug}`;
}

export type ProductSort = "price_asc" | "price_desc" | "newest";

const SORT_MAP: Record<ProductSort, string> = {
  price_asc: "price:asc",
  price_desc: "price:desc",
  newest: "createdAt:desc",
};

function toSort(sort?: string): ProductSort {
  return sort === "price_asc" || sort === "price_desc" || sort === "newest"
    ? sort
    : "newest";
}

/** Paginated all-products listing with optional sort. */
export async function getAllProducts(
  page = 1,
  pageSize = 24,
  sort: ProductSort = "newest"
): Promise<{ products: Product[]; total: number }> {
  const { data, total } = await fetchAPIWithMeta<ProductAttr>("/products", {
    ...PRODUCT_POPULATE,
    "pagination[page]": page,
    "pagination[pageSize]": pageSize,
    "sort[0]": SORT_MAP[sort],
  });
  return { products: data.map(toProduct), total };
}

export async function getBrandBySlug(slug: string): Promise<{ name: string; slug: string; image?: string } | null> {
  const rows = await fetchAPI<BrandAttr>("/brands", {
    "filters[slug][$eq]": slug,
    "pagination[pageSize]": 1,
    "populate[logo]": true,
  });
  const row = rows[0];
  if (row) return { name: row.name, slug: row.slug ?? slugify(row.name), image: getStrapiMediaUrl(row.logo) };
  const all = await getBrandsWithSlugs();
  return all.find((b) => b.slug === slug) ?? null;
}

export type SiteSetting = {
  siteName: string;
  tagline: string;
  footerContent: string;
  contactPhone: string;
  contactEmail: string;
  whatsapp: string;
  address: string;
  logo?: string;
  favicon?: string;
  socials?: { label: string; url: string; icon?: string }[];
};

/** Site-wide settings (single type). Returns null when offline/unpublished. */
export async function getSiteSettings(): Promise<SiteSetting | null> {
  const row = await fetchOne<SettingAttr>("/setting", {
    "populate[logo]": true,
    "populate[favicon]": true,
  });
  if (!row) return null;
  return {
    siteName: row.siteName ?? "Pickenby",
    tagline: row.tagline ?? "",
    footerContent: row.footerContent ?? "",
    contactPhone: row.contactPhone ?? "",
    contactEmail: row.contactEmail ?? "",
    whatsapp: row.whatsapp ?? "",
    address: row.address ?? "",
    logo: getStrapiMediaUrl(row.logo),
    favicon: getStrapiMediaUrl(row.favicon),
    socials: Array.isArray(row.socials)
      ? row.socials.map((s) => ({
          label: s.label ?? "",
          url: s.url ?? "#",
          icon: s.icon,
        }))
      : undefined,
  };
}

export { toSort };
