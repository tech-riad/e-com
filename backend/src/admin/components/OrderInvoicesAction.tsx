import { useState } from 'react';
import { useFetchClient, useNotification } from '@strapi/strapi/admin';
import type { BulkActionComponent } from '@strapi/content-manager/strapi-admin';

const ORDER_UID = 'api::order.order';

type OrderItem = {
  title?: unknown;
  price?: unknown;
  qty?: unknown;
  quantity?: unknown;
  color?: unknown;
};

type OrderRecord = {
  documentId: string;
  customerName: string;
  phone: string;
  address: string;
  city: string;
  division: string;
  paymentMethod: string;
  total: number;
  createdAt: string;
  items: OrderItem[];
};

type SiteBrand = {
  siteName: string;
  tagline: string;
  phone: string;
  email: string;
  address: string;
  logoUrl: string;
};

const asText = (value: unknown) => (typeof value === 'string' ? value : '');

const money = (value: unknown) => {
  const amount = Number(value);
  return Number.isFinite(amount)
    ? `৳${new Intl.NumberFormat('en-BD', { maximumFractionDigits: 2 }).format(amount)}`
    : '-';
};

const toSiteBrand = (value: unknown): SiteBrand => {
  if (typeof value !== 'object' || value === null) {
    throw new Error('Pickenby site settings could not be loaded.');
  }
  const settings = value as Record<string, unknown>;
  const logo = settings.logo;
  const logoRecord = typeof logo === 'object' && logo !== null
    ? (logo as Record<string, unknown>)
    : null;
  const nestedLogo =
    logoRecord?.data && typeof logoRecord.data === 'object'
      ? (logoRecord.data as Record<string, unknown>)
      : null;
  const logoUrl = asText(logoRecord?.url ?? nestedLogo?.url);

  return {
    siteName: asText(settings.siteName) || 'Pickenby',
    tagline: asText(settings.tagline),
    phone: asText(settings.contactPhone),
    email: asText(settings.contactEmail),
    address: asText(settings.address),
    logoUrl,
  };
};

const escapeHtml = (value: unknown) =>
  String(value ?? '').replace(/[&<>"']/g, (character) => {
    const entities: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    };
    return entities[character];
  });

const parseItems = (value: unknown): OrderItem[] => {
  const parsed = typeof value === 'string' ? JSON.parse(value) : value;
  if (!Array.isArray(parsed)) return [];
  return parsed.filter(
    (item): item is OrderItem => typeof item === 'object' && item !== null
  );
};

const toOrderRecord = (value: unknown, documentId: string): OrderRecord => {
  if (typeof value !== 'object' || value === null) {
    throw new Error('An order could not be loaded.');
  }
  const order = value as Record<string, unknown>;

  return {
    documentId,
    customerName: asText(order.customerName),
    phone: asText(order.phone),
    address: asText(order.address),
    city: asText(order.city),
    division: asText(order.division),
    paymentMethod: asText(order.paymentMethod),
    total: Number(order.total) || 0,
    createdAt: asText(order.createdAt),
    items: parseItems(order.items),
  };
};

const renderItems = (items: OrderItem[]) =>
  items.length
    ? items
        .map((item) => {
          const quantity = Number(item.qty ?? item.quantity ?? 1);
          const price = Number(item.price);
          const validQuantity = Number.isFinite(quantity) && quantity > 0 ? quantity : 1;
          const color =
            typeof item.color === 'string'
              ? item.color
              : typeof item.color === 'object' && item.color !== null
                ? asText((item.color as Record<string, unknown>).name)
                : '';

          return `<tr>
            <td>${escapeHtml(item.title || 'Product')}${color ? `<small>${escapeHtml(color)}</small>` : ''}</td>
            <td class="center">${validQuantity}</td>
            <td class="right">${money(item.price)}</td>
            <td class="right">${money(Number.isFinite(price) ? price * validQuantity : NaN)}</td>
          </tr>`;
        })
        .join('')
    : '<tr><td colspan="4">No item details recorded.</td></tr>';

const renderInvoice = (order: OrderRecord, brand: SiteBrand, origin: string) => {
  const address = [order.address, order.city, order.division].filter(Boolean).join(', ');
  const date = order.createdAt
    ? new Date(order.createdAt).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
    : '-';
  const logoUrl = brand.logoUrl ? new URL(brand.logoUrl, origin).href : '';
  const collectLabel =
    order.paymentMethod.toLowerCase() === 'cash on delivery'
      ? 'AMOUNT TO COLLECT'
      : 'TOTAL AMOUNT';

  return `<article class="invoice">
    <div class="topline">
      <span>${escapeHtml(brand.siteName)}</span>
      <span>Invoice #${escapeHtml(order.documentId)}</span>
    </div>
    <header class="invoice-header">
      <div class="merchant">
        ${logoUrl
          ? `<div class="logo-frame"><img src="${escapeHtml(logoUrl)}" alt="${escapeHtml(brand.siteName)} logo"></div>`
          : `<div class="logo-wordmark"><span>P</span>${escapeHtml(brand.siteName)}</div>`}
        <div class="merchant-details">
          ${brand.tagline ? `<p>${escapeHtml(brand.tagline)}</p>` : ''}
          ${brand.phone ? `<p>${escapeHtml(brand.phone)}</p>` : ''}
          ${brand.address ? `<p>${escapeHtml(brand.address)}</p>` : ''}
          ${brand.email ? `<p>${escapeHtml(brand.email)}</p>` : ''}
        </div>
      </div>
      <div class="invoice-meta">
        <h1>INVOICE</h1>
        <p><span>Order ID</span><strong>${escapeHtml(order.documentId)}</strong></p>
        <p><span>Date</span><strong>${escapeHtml(date)}</strong></p>
        <p><span>Payment</span><strong>${escapeHtml(order.paymentMethod || 'Order payment')}</strong></p>
      </div>
    </header>
    <div class="accent-rule"></div>
    <section class="delivery">
      <div class="customer">
        <h2>DELIVER TO</h2>
        <strong>${escapeHtml(order.customerName || 'Customer')}</strong>
        ${order.phone ? `<p>${escapeHtml(order.phone)}</p>` : ''}
        ${address ? `<p>${escapeHtml(address)}</p>` : ''}
      </div>
      <div class="delivery-note">
        <span>ORDER REFERENCE</span>
        <strong>${escapeHtml(order.documentId)}</strong>
        <span>Thank you for choosing ${escapeHtml(brand.siteName)}.</span>
      </div>
    </section>
    <section class="items-section">
      <table>
        <thead><tr><th>Description</th><th class="center">Qty</th><th class="right">Unit price</th><th class="right">Amount</th></tr></thead>
        <tbody>${renderItems(order.items)}</tbody>
      </table>
    </section>
    <div class="amount-box">
      <span>${collectLabel}</span>
      <strong>${money(order.total)}</strong>
    </div>
    <footer>
      <span>We appreciate your business.</span>
      <span>${escapeHtml(brand.siteName)}${brand.phone ? ` · ${escapeHtml(brand.phone)}` : ''}</span>
    </footer>
  </article>`;
};

const renderPrintDocument = (
  orders: OrderRecord[],
  brand: SiteBrand,
  origin: string
) => `<!doctype html>
<html><head><meta charset="utf-8"><title>Pickenby invoices</title>
<style>
  @page { size: A4; margin: 10mm; }
  * { box-sizing: border-box; }
  body { background: #fff; color: #172033; font: 13px Arial, sans-serif; margin: 0; }
  .invoice { border: 1.5px solid #d9deea; border-top: 5px solid #6b4bc3; border-radius: 12px; min-height: 270mm; padding: 8mm; page-break-after: always; break-after: page; }
  .invoice:last-child { page-break-after: auto; break-after: auto; }
  .topline { color: #7a8191; display: flex; font-size: 10px; justify-content: space-between; letter-spacing: .3px; margin-bottom: 14px; }
  .invoice-header { align-items: flex-start; display: flex; justify-content: space-between; padding-bottom: 20px; }
  .merchant { align-items: flex-start; display: flex; gap: 12px; max-width: 62%; }
  .logo-frame { height: 58px; overflow: hidden; position: relative; width: 178px; }
  .logo-frame img { height: 178px; left: 0; max-width: none; object-fit: contain; position: absolute; top: -60px; width: 178px; }
  .logo-wordmark { align-items: center; color: #233d8e; display: flex; font-size: 24px; font-weight: 800; gap: 7px; }
  .logo-wordmark span { align-items: center; background: #6b4bc3; border-radius: 9px; color: #fff; display: inline-flex; height: 34px; justify-content: center; width: 34px; }
  .merchant-details { color: #596173; font-size: 11px; line-height: 1.55; padding-top: 2px; }
  .merchant-details p { margin: 0 0 2px; }
  .invoice-meta { min-width: 195px; text-align: right; }
  .invoice-meta h1 { color: #192341; font-size: 27px; letter-spacing: 2px; margin: -4px 0 6px; }
  .invoice-meta p { display: flex; gap: 14px; justify-content: space-between; line-height: 1.55; margin: 2px 0; }
  .invoice-meta p span { color: #81899a; }
  .invoice-meta p strong { color: #252d40; }
  .accent-rule { background: #252d40; height: 2px; margin-bottom: 20px; }
  .delivery { align-items: center; border-bottom: 1px solid #dce1e8; display: flex; justify-content: space-between; min-height: 92px; padding: 0 0 18px; }
  .customer h2 { color: #747d8d; font-size: 11px; letter-spacing: .7px; margin: 0 0 9px; }
  .customer strong { color: #1c2435; font-size: 16px; }
  .customer p { color: #4e5869; line-height: 1.45; margin: 3px 0 0; max-width: 340px; }
  .delivery-note { align-items: flex-end; color: #737d8c; display: flex; flex-direction: column; font-size: 10px; gap: 5px; text-align: right; }
  .delivery-note strong { color: #1e2739; font-size: 18px; letter-spacing: 1px; }
  .items-section { margin-top: 22px; }
  table { border-collapse: collapse; width: 100%; }
  th, td { border-bottom: 1px solid #e0e4eb; padding: 11px 7px; text-align: left; vertical-align: top; }
  thead th { border-bottom: 2px solid #222b3d; border-top: 1px solid #d9deea; color: #798293; font-size: 10px; letter-spacing: .6px; text-transform: uppercase; }
  tbody td { color: #252d3b; }
  small { color: #7a8391; display: block; font-size: 10px; margin-top: 4px; }
  .center { text-align: center; }
  .right { text-align: right; }
  .amount-box { align-items: center; background: #edf8f2; border: 1.5px solid #25a66a; border-radius: 9px; color: #1c3428; display: flex; justify-content: space-between; margin-top: 18px; padding: 15px 18px; }
  .amount-box span { font-size: 12px; font-weight: 700; letter-spacing: .5px; }
  .amount-box strong { font-size: 25px; }
  footer { border-top: 1px solid #dce1e8; color: #7a8391; display: flex; font-size: 10px; justify-content: space-between; margin-top: 20px; padding-top: 12px; }
</style></head>
<body>${orders.map((order) => renderInvoice(order, brand, origin)).join('')}</body></html>`;

export const OrderInvoicesAction: BulkActionComponent = ({ documents, model }) => {
  const { get } = useFetchClient();
  const { toggleNotification } = useNotification();
  const [isPreparing, setIsPreparing] = useState(false);

  if (model !== ORDER_UID) return null;

  return {
    label: isPreparing ? 'Preparing invoices...' : 'Download invoices (PDF)',
    disabled: isPreparing || documents.length === 0,
    onClick: () => {
      if (isPreparing) return;

      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        toggleNotification({
          type: 'danger',
          message: 'Allow pop-ups to download invoices.',
        });
        return;
      }

      setIsPreparing(true);
      void (async () => {
        try {
          printWindow.document.write('<!doctype html><title>Preparing invoices</title><p>Preparing invoices...</p>');
          printWindow.document.close();

          const orders = await Promise.all(
            documents.map(async ({ documentId }) => {
              if (!documentId) throw new Error('A selected order is missing its reference.');
              const { data } = await get<{ data?: unknown }>(
                `/content-manager/collection-types/${ORDER_UID}/${encodeURIComponent(documentId)}`
              );
              return toOrderRecord(data.data, documentId);
            })
          );
          const { data: settingsResponse } = await get<{ data?: unknown }>(
            '/content-manager/single-types/api::setting.setting?populate=logo'
          );
          const brand = toSiteBrand(settingsResponse.data);

          printWindow.onafterprint = () => printWindow.close();
          printWindow.onload = () => {
            printWindow.focus();
            printWindow.print();
          };
          printWindow.document.open();
          printWindow.document.write(
            renderPrintDocument(orders, brand, window.location.origin)
          );
          printWindow.document.close();
        } catch (error) {
          printWindow.close();
          toggleNotification({
            type: 'danger',
            message:
              error instanceof Error
                ? `Could not prepare invoices: ${error.message}`
                : 'Could not prepare invoices. Please try again.',
          });
        } finally {
          setIsPreparing(false);
        }
      })();
    },
  };
};
