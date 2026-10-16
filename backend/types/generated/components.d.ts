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

declare module '@strapi/strapi' {
  export namespace Public {
    export interface ComponentSchemas {
      'product.color-option': ProductColorOption;
    }
  }
}
