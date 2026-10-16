import { useEffect, useState } from 'react';

type Item = {
  slug?: string;
  id?: string;
  title?: string;
  price?: number | string;
  mrp?: number | string;
  qty?: number | string;
  quantity?: number | string;
  image?: string | { url?: string } | null;
  brand?: string | { name?: string } | null;
};

type Props = { value?: unknown };
type CatalogDetails = { image?: string; brand?: string };

const getItems = (value: unknown): Item[] => {
  let parsed = value;
  if (typeof value === 'string') {
    try {
      parsed = JSON.parse(value);
    } catch {
      return [];
    }
  }
  return Array.isArray(parsed)
    ? parsed.filter((item): item is Item => typeof item === 'object' && item !== null)
    : [];
};

const getSlug = (item: Item) => String(item.slug ?? item.id ?? '');

const getImage = (image: Item['image']): string | undefined =>
  typeof image === 'string' ? image : image?.url;

const getBrand = (brand: Item['brand']): string | undefined =>
  typeof brand === 'string' ? brand : brand?.name;

const money = (value: unknown) => {
  const amount = Number(value);
  return Number.isFinite(amount)
    ? `BDT ${new Intl.NumberFormat('en-BD').format(amount)}`
    : 'Not available';
};

const mediaUrl = (url: string) =>
  url.startsWith('/') ? `${window.location.origin}${url}` : url;

const productionMediaUrl = (url: string) => {
  try {
    const parsed = new URL(url, window.location.origin);
    if (
      parsed.pathname.startsWith('/uploads/') &&
      ['localhost', '127.0.0.1'].includes(parsed.hostname)
    ) {
      return `https://admin.pickenby.com${parsed.pathname}`;
    }
  } catch {
    return undefined;
  }
  return undefined;
};

export default function OrderItemsPreviewInput({ value }: Props) {
  const items = getItems(value);
  const lookupKey = [...new Set(items.filter((item) => !getImage(item.image)).map(getSlug).filter(Boolean))].join('|');
  const [catalog, setCatalog] = useState<Record<string, CatalogDetails>>({});

  useEffect(() => {
    if (!lookupKey) return;
    const controller = new AbortController();
    const slugs = lookupKey.split('|');

    Promise.all(
      slugs.map(async (slug) => {
        const query = new URLSearchParams({
          'filters[slug][$eq]': slug,
          populate: 'image,brand',
        });
        const response = await fetch(`/api/products?${query}`, { signal: controller.signal });
        if (!response.ok) return [slug, {}] as const;

        const result = await response.json();
        const product = result.data?.[0];
        const details = product?.attributes ?? product ?? {};
        const image = details.image?.url ?? details.image?.data?.attributes?.url;
        const brand = details.brand?.name ?? details.brand?.data?.attributes?.name;
        return [slug, { image, brand }] as const;
      })
    )
      .then((entries) => setCatalog(Object.fromEntries(entries)))
      .catch(() => {
        if (!controller.signal.aborted) setCatalog({});
      });

    return () => controller.abort();
  }, [lookupKey]);

  if (items.length === 0) {
    return <p style={{ color: '#666687', margin: 0 }}>No order items found.</p>;
  }

  return (
    <div style={{ display: 'grid', gap: 8, maxWidth: 720 }}>
      <div style={{ color: '#32324d', fontSize: 12, fontWeight: 600 }}>Order items</div>
      <div style={{ display: 'grid', gap: 12 }}>
        {items.map((item, index) => {
        const slug = getSlug(item);
        const details = catalog[slug];
        const image = getImage(item.image) ?? details?.image;
        const brand = getBrand(item.brand) ?? details?.brand;
        const quantity = Number(item.qty ?? item.quantity ?? 1) || 1;
        const price = Number(item.price);

        return (
          <article
            key={`${slug}-${index}`}
            style={{
              alignItems: 'center',
              border: '1px solid #dcdce4',
              borderRadius: 8,
              display: 'grid',
              gap: 14,
              gridTemplateColumns: '88px minmax(0, 1fr)',
              padding: 12,
            }}
          >
            <div
              style={{
                alignItems: 'center',
                background: '#f6f6f9',
                borderRadius: 6,
                display: 'flex',
                height: 88,
                justifyContent: 'center',
                overflow: 'hidden',
                width: 88,
              }}
            >
              {image ? (
                <img
                  alt={item.title ?? 'Ordered product'}
                  onError={(event) => {
                    const fallback = productionMediaUrl(image);
                    if (fallback && event.currentTarget.src !== fallback) {
                      event.currentTarget.src = fallback;
                    } else {
                      event.currentTarget.style.display = 'none';
                    }
                  }}
                  src={mediaUrl(image)}
                  style={{ height: '100%', objectFit: 'contain', width: '100%' }}
                />
              ) : (
                <span style={{ color: '#666687', fontSize: 12, textAlign: 'center' }}>
                  Image unavailable
                </span>
              )}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ color: '#32324d', fontSize: 14, marginBottom: 4 }}>
                Item {index + 1}{brand ? ` · ${brand}` : ''}
              </div>
              <div style={{ color: '#181826', fontSize: 14, fontWeight: 600 }}>
                {item.title ?? 'Untitled product'}
              </div>
              {slug && (
                <div style={{ color: '#666687', fontSize: 14, marginTop: 3 }}>
                  Product: {slug}
                </div>
              )}
              <div style={{ color: '#32324d', fontSize: 14, marginTop: 7 }}>
                Price: {money(item.price)}
                {item.mrp != null && ` · MRP: ${money(item.mrp)}`}
                {' · '}Qty: {quantity}
                {' · '}Line total: {money(Number.isFinite(price) ? price * quantity : NaN)}
              </div>
              {slug && (
                <a
                  href={`http://localhost:3000/products/${encodeURIComponent(slug)}`}
                  rel="noreferrer"
                  target="_blank"
                  style={{ color: '#4945ff', display: 'inline-block', fontSize: 12, marginTop: 7 }}
                >
                  View product page
                </a>
              )}
            </div>
          </article>
        );
        })}
      </div>
    </div>
  );
}