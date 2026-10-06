const STRAPI_URL =
  process.env.NEXT_PUBLIC_STRAPI_URL ?? "http://localhost:1337";

const API_TOKEN = process.env.STRAPI_API_TOKEN ?? "";

const isDev = process.env.NODE_ENV !== "production";

export function strapiUrl(path = "") {
  return `${STRAPI_URL}${path}`;
}

export function isStrapiConfigured() {
  return Boolean(STRAPI_URL);
}

/** Resolve a Strapi media object (or raw string) to an absolute URL. */
export function getStrapiMedia(
  media: { url?: string } | string | null | undefined
): string | undefined {
  if (!media) return undefined;
  if (typeof media === "string") {
    return media.startsWith("http") ? media : strapiUrl(media);
  }
  if (!media.url) return undefined;
  return media.url.startsWith("http") ? media.url : strapiUrl(media.url);
}

/** Extract an absolute URL from any Strapi media shape (flat, v5, v4, arrays). */
export function getStrapiMediaUrl(media: unknown): string | undefined {
  if (!media) return undefined;
  if (Array.isArray(media)) return getStrapiMediaUrl(media[0]);

  // raw string
  if (typeof media === "string") {
    return media.startsWith("http") ? media : strapiUrl(media);
  }

  if (typeof media !== "object") return undefined;
  const obj = media as Record<string, unknown>;

  // flat shape: { url }
  if (typeof obj.url === "string") return getStrapiMedia(obj.url);

  // v5 shape: { data: { url } }  or  v4 shape: { data: { attributes: { url } } }
  const data = obj.data as Record<string, unknown> | null | undefined;
  if (data && typeof data === "object") {
    if (typeof data.url === "string") return getStrapiMedia(data.url);
    const attrs = data.attributes as Record<string, unknown> | null | undefined;
    if (attrs && typeof attrs.url === "string") return getStrapiMedia(attrs.url);
    const formats = data.formats as Record<string, { url?: string }> | null | undefined;
    const small = formats?.small?.url || formats?.thumbnail?.url;
    if (small) return getStrapiMedia(small);
  }

  return undefined;
}

/** Extract every absolute URL from a multi-media field (v5 array, v4 `{ data: [] }`, or single). */
export function getStrapiMediaUrls(media: unknown): string[] {
  if (!media) return [];
  let items: unknown[];
  if (Array.isArray(media)) items = media;
  else if (typeof media === "object" && Array.isArray((media as { data?: unknown }).data))
    items = (media as { data: unknown[] }).data;
  else items = [media];
  return items
    .map((m) => getStrapiMediaUrl(m && typeof m === "object" && "attributes" in m ? { data: m } : m))
    .filter((u): u is string => Boolean(u));
}

type StrapiListResponse<T> = {
  data: T[];
  meta?: { pagination?: { page?: number; pageSize?: number; total?: number } };
};

type StrapiSingleResponse<T> = {
  data: T | null;
};

export type StrapiItem<T> = {
  id: number;
  documentId?: string;
  attributes?: T;
} & Partial<T>;

/** Unwrap Strapi v5 (flat) vs v4 (attributes-nested) item shapes. */
export function unwrap<T>(item: StrapiItem<T>): T & { id: number } {
  if (item && typeof item === "object" && "attributes" in item && item.attributes) {
    return { id: (item as { id: number }).id, ...(item.attributes as T) };
  }
  return item as T & { id: number };
}

function logWarn(message: string) {
  if (isDev) console.warn(`[strapi] ${message}`);
}

async function doFetch(url: string, init: RequestInit = {}): Promise<Response | null> {
  try {
    return await fetch(url, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...(API_TOKEN ? { Authorization: `Bearer ${API_TOKEN}` } : {}),
        ...(init.headers ?? {}),
      },
      next: { revalidate: 60 },
    });
  } catch (e) {
    // Strapi offline → caller falls back to mock data.
    logWarn(`offline or unreachable (${STRAPI_URL}): ${(e as Error).message}`);
    return null;
  }
}

export async function fetchAPI<T>(
  path: string,
  params: Record<string, string | number | boolean> = {},
  init: RequestInit = {}
): Promise<T[]> {
  const url = new URL(`/api${path}`, STRAPI_URL);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, String(v));

  const res = await doFetch(url.toString(), init);
  if (!res) return [];
  if (!res.ok) {
    logWarn(
      `GET ${url.pathname}${url.search} → ${res.status}. ` +
        (res.status === 403
          ? "Enable find/findOne for this type (Settings → Roles → Public)."
          : res.status === 401
            ? "Check STRAPI_API_TOKEN."
            : "Check the collection exists and is published.")
    );
    return [];
  }
  const json = (await res.json()) as StrapiListResponse<StrapiItem<T>>;
  if (!Array.isArray(json.data)) return [];
  return json.data.map((d) => unwrap<T>(d) as T);
}

/** Fetch a list with pagination meta (total count). */
export async function fetchAPIWithMeta<T>(
  path: string,
  params: Record<string, string | number | boolean> = {},
  init: RequestInit = {}
): Promise<{ data: T[]; total: number }> {
  const url = new URL(`/api${path}`, STRAPI_URL);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, String(v));

  const res = await doFetch(url.toString(), init);
  if (!res) return { data: [], total: 0 };
  if (!res.ok) {
    logWarn(
      `GET ${url.pathname}${url.search} → ${res.status}. ` +
        (res.status === 403
          ? "Enable find/findOne for this type (Settings → Roles → Public)."
          : res.status === 401
            ? "Check STRAPI_API_TOKEN."
            : "Check the collection exists and is published.")
    );
    return { data: [], total: 0 };
  }
  const json = (await res.json()) as StrapiListResponse<StrapiItem<T>>;
  if (!Array.isArray(json.data)) return { data: [], total: 0 };
  return {
    data: json.data.map((d) => unwrap<T>(d) as T),
    total: json.meta?.pagination?.total ?? json.data.length,
  };
}

/** Single-item fetch (Strapi findOne). Returns null when missing/offline/forbidden. */
export async function fetchOne<T>(
  path: string,
  params: Record<string, string | number | boolean> = {},
  init: RequestInit = {}
): Promise<(T & { id: number }) | null> {
  const url = new URL(`/api${path}`, STRAPI_URL);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, String(v));

  const res = await doFetch(url.toString(), init);
  if (!res) return null;
  if (!res.ok) {
    logWarn(`GET ${url.pathname}${url.search} → ${res.status}.`);
    return null;
  }
  const json = (await res.json()) as StrapiSingleResponse<StrapiItem<T>>;
  if (!json.data) return null;
  return unwrap<T>(json.data) as T & { id: number };
}
