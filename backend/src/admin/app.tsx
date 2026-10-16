import type { StrapiApp } from '@strapi/strapi/admin';

export default {
  register(app: StrapiApp) {
    app.customFields.register({
      name: 'order-items-preview',
      type: 'json',
      intlLabel: { id: 'order-items-preview.label', defaultMessage: 'Order items' },
      intlDescription: {
        id: 'order-items-preview.description',
        defaultMessage: 'Read-only product preview for order items',
      },
      components: {
        Input: async () => import('./components/OrderItemsPreviewInput'),
      },
    });
  },
};