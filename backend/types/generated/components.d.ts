import type { Schema, Struct } from '@strapi/strapi';

export interface ProductColorOption extends Struct.ComponentSchema {
  collectionName: 'components_product_color_options';
  info: {
    description: 'A color available for this product';
    displayName: 'Product color';
  };
  attributes: {
    hexCode: Schema.Attribute.String;
    name: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface SettingsPaymentMethod extends Struct.ComponentSchema {
  collectionName: 'components_settings_payment_methods';
  info: {
    description: 'Payment logo shown in the storefront footer';
    displayName: 'Payment method';
  };
  attributes: {
    image: Schema.Attribute.Media<'images'> & Schema.Attribute.Required;
    name: Schema.Attribute.String & Schema.Attribute.Required;
    show: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
  };
}

declare module '@strapi/strapi' {
  export namespace Public {
    export interface ComponentSchemas {
      'product.color-option': ProductColorOption;
      'settings.payment-method': SettingsPaymentMethod;
    }
  }
}
