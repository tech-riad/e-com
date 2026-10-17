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
  color?: string | { name?: string; hexCode?: string } | null;
};

type Props = {
  value?: unknown;
  name?: string;
  attribute?: { type?: string };
  disabled?: boolean;
  onChange?: (event: { target: { name: string; type: string; value: unknown } }) => void;
};
type CatalogDetails = {
  image?: string;
  brand?: string;
  colors?: { name: string; hexCode?: string }[];
};

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

const getColor = (color: Item['color']): string | undefined =>
  typeof color === 'string' ? color : color?.name;

const getColorHex = (color: Item['color']): string | undefined => {
  if (typeof color !== 'object' || !color?.hexCode) return undefined;
  return /^#(?:[\da-f]{3,4}|[\da-f]{6}|[\da-f]{8})$/i.test(color.hexCode)
    ? color.hexCode
    : undefined;
};

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

const storefrontOrigin = () => {
  const { hostname, origin, protocol } = window.location;
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return `${protocol}//${hostname}:3000`;
  }
  if (hostname.startsWith('admin.')) {
    return `${protocol}//${hostname.slice('admin.'.length)}`;
  }
  return origin;
};

export default function OrderItemsPreviewInput({
  value,
  name = 'items',
  attribute,
  disabled = false,
  onChange,
}: Props) {
  const items = getItems(value);
  const lookupKey = [...new Set(items.map(getSlug).filter(Boolean))].join('|');
  const [catalog, setCatalog] = useState<Record<string, CatalogDetails>>({});

  const updateItem = (index: number, changes: Partial<Item>, updateTotal = false) => {
    const nextItems = items.map((item, itemIndex) =>
      itemIndex === index ? { ...item, ...changes } : item
    );
    onChange?.({
      target: { name, type: attribute?.type ?? 'json', value: nextItems },
    });
    if (updateTotal) {
      const total = nextItems.reduce((sum, item) => {
        const price = Number(item.price);
        const quantity = Number(item.qty ?? item.quantity ?? 1);
        return Number.isFinite(price)
          ? sum + price * (Number.isFinite(quantity) && quantity > 0 ? quantity : 1)
          : sum;
      }, 0);
      onChange?.({ target: { name: 'total', type: 'decimal', value: total } });
    }
  };

  useEffect(() => {
    if (!lookupKey) return;
    const controller = new AbortController();
    const slugs = lookupKey.split('|');

    Promise.all(
      slugs.map(async (slug) => {
        const query = new URLSearchParams({
          'filters[slug][$eq]': slug,
          populate: 'image,brand,colors',
        });
        const response = await fetch(`/api/products?${query}`, { signal: controller.signal });
        if (!response.ok) return [slug, {}] as const;

        const result = await response.json();
        const product = result.data?.[0];
        const details = product?.attributes ?? product ?? {};
        const image = details.image?.url ?? details.image?.data?.attributes?.url;
        const brand = details.brand?.name ?? details.brand?.data?.attributes?.name;
        const colors = Array.isArray(details.colors)
          ? details.colors
              .filter((color: { name?: unknown }) => typeof color.name === 'string' && color.name.length > 0)
              .map((color: { name: string; hexCode?: unknown }) => ({
                name: color.name,
                ...(typeof color.hexCode === 'string' ? { hexCode: color.hexCode } : {}),
              }))
          : [];
        return [slug, { image, brand, colors }] as const;
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
        const color = getColor(item.color);
        const colorHex = getColorHex(item.color);
        const currentColor =
          typeof item.color === 'string'
            ? { name: item.color }
            : item.color ?? undefined;
        const availableColors = details?.colors ?? [];
        const colorOptions = currentColor &&
          !availableColors.some((option) => option.name === currentColor.name)
          ? [currentColor, ...availableColors]
          : availableColors;
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
              <div style={{ display: 'grid', gap: 8, gridTemplateColumns: 'minmax(140px, 1fr) 110px', marginTop: 8, maxWidth: 380 }}>
                <label style={{ color: '#32324d', display: 'grid', fontSize: 12, gap: 4 }}>
                  Color
                  {availableColors.length > 0 ? (
                    <select
                      aria-label={`Color for ${item.title ?? `item ${index + 1}`}`}
                      disabled={disabled}
                      onChange={(event) => {
                        const option = colorOptions.find((entry) => entry.name === event.target.value);
                        updateItem(index, {
                          color: option
                            ? { name: option.name, ...(option.hexCode ? { hexCode: option.hexCode } : {}) }
                            : undefined,
                        });
                      }}
                      value={color ?? ''}
                      style={{ background: '#fff', border: '1px solid #dcdce4', borderRadius: 6, color: '#181826', minHeight: 36, padding: '6px 8px' }}
                    >
                      <option value="">Select color</option>
                      {colorOptions.map((option, optionIndex) => (
                        <option key={`${option.name}-${optionIndex}`} value={option.name}>
                          {option.name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      aria-label={`Color for ${item.title ?? `item ${index + 1}`}`}
                      disabled={disabled}
                      onChange={(event) => updateItem(index, {
                        color: event.target.value ? { name: event.target.value } : undefined,
                      })}
                      placeholder="Enter color"
                      value={color ?? ''}
                      style={{ background: '#fff', border: '1px solid #dcdce4', borderRadius: 6, color: '#181826', minHeight: 36, padding: '6px 8px' }}
                    />
                  )}
                  {colorHex && <span aria-hidden style={{ backgroundColor: colorHex, border: '1px solid #dcdce4', borderRadius: '50%', height: 12, width: 12 }} />}
                </label>
                <label style={{ color: '#32324d', display: 'grid', fontSize: 12, gap: 4 }}>
                  Quantity
                  <input
                    aria-label={`Quantity for ${item.title ?? `item ${index + 1}`}`}
                    disabled={disabled}
                    min={1}
                    onChange={(event) => {
                      const nextValue = event.target.value;
                      updateItem(index, {
                        qty: nextValue === '' ? '' : Math.max(1, Math.floor(Number(nextValue) || 1)),
                      }, true);
                    }}
                    onBlur={(event) => {
                      if (!event.target.value) updateItem(index, { qty: 1 }, true);
                    }}
                    type="number"
                    value={item.qty ?? item.quantity ?? 1}
                    style={{ background: '#fff', border: '1px solid #dcdce4', borderRadius: 6, color: '#181826', minHeight: 36, padding: '6px 8px', width: '100%' }}
                  />
                </label>
              </div>
              <div style={{ color: '#32324d', fontSize: 14, marginTop: 7 }}>
                Price: {money(item.price)}
                {item.mrp != null && ` · MRP: ${money(item.mrp)}`}
                {' · '}Qty: {quantity}
                {' · '}Line total: {money(Number.isFinite(price) ? price * quantity : NaN)}
              </div>
              {slug && (
                <a
                  href={`${storefrontOrigin()}/products/${encodeURIComponent(slug)}`}
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