import type { StrapiApp } from '@strapi/strapi/admin';
import { OrderInvoicesAction } from './components/OrderInvoicesAction';

export default {
  register(app: StrapiApp) {
    app.customFields.register({
      name: 'order-items-preview',
      type: 'json',
      intlLabel: { id: 'order-items-preview.label', defaultMessage: 'Order items' },
      intlDescription: {
        id: 'order-items-preview.description',
        defaultMessage: 'Product preview with editable color and quantity',
      },
      components: {
        Input: async () => import('./components/OrderItemsPreviewInput'),
      },
    });
    const addBulkAction = app.getPlugin('content-manager').apis.addBulkAction;
    if (typeof addBulkAction !== 'function') {
      throw new Error('Strapi Content Manager bulk actions are unavailable.');
    }
    addBulkAction([OrderInvoicesAction]);
  },
};
