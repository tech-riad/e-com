import type { Core } from '@strapi/strapi';

const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80) || 'item';

type Doc = { documentId: string; [k: string]: unknown };

const BRANDS = [
  'FOTILE', 'FUJITA', 'HITACHI', 'LG', 'Moulinex', 'PANASONIC',
  'PHILIPS', 'SAMSUNG', 'SEC', 'SHARP', 'TCL', 'Tefal',
];

const CATEGORIES = [
  { label: 'Televisions', icon: 'tv' },
  { label: 'Air Conditioners', icon: 'snowflake' },
  { label: 'Fridges & Freezers', icon: 'fridge' },
  { label: 'Laundry & Cleaning', icon: 'washer' },
  { label: 'Cooking Appliances', icon: 'pot' },
  { label: 'Gas Stoves & Kitchen Hoods', icon: 'flame' },
  { label: 'Ovens', icon: 'oven' },
  { label: 'Food Preparation', icon: 'blender' },
  { label: 'Audio & Entertainment', icon: 'speaker' },
  { label: 'Air & Water', icon: 'drops' },
  { label: 'Home & Lifestyle', icon: 'house' },
];

const PROMO_BANNERS = [
  { brand: 'Midea', text: '১০ বছরের ওয়ারেন্টি', tone: 'bg-[#0d2a6b] text-white', sort: 1 },
  { brand: 'ANKER', text: 'Power banks & chargers', tone: 'bg-[#e9ebee] text-[#0a7bd8]', sort: 2 },
  { brand: 'SAMSUNG | electra', text: 'Refrigerators & washers', tone: 'bg-[#eef0f4] text-[#1b3a8f]', sort: 3 },
];

const DEFAULT_SETTINGS = {
  siteName: 'Pickenby',
  tagline: 'Electronics & home appliances in Bangladesh',
  footerContent:
    'Pickenby is an online electronics & home-appliance store for Bangladesh, delivering free across the country with 0% EMI options.',
  contactPhone: '09647274752',
  contactEmail: 'support@pickenby.com',
  whatsapp: '8809647274752',
  address: 'Dhaka, Bangladesh',
  socials: [],
};

type SeedProduct = {
  seller: string;
  brand: string;
  title: string;
  price: number;
  mrp: number;
  sold?: number;
  outOfStock?: boolean;
  discount?: number;
  badges?: string[];
  emi?: boolean;
  category: string;
  topSelling?: boolean;
  topPick?: boolean;
  newArrival?: boolean;
  recentSaving?: boolean;
};

const PRODUCTS: SeedProduct[] = [
  { seller: 'Silver Electronics', brand: 'Silver Electronics', title: 'Walton 213L Direct Cool Refrigerator (WFA-2A3-…', price: 32037, mrp: 37690, sold: 30537, category: 'Fridges & Freezers', topSelling: true },
  { seller: 'Silver Electronics', brand: 'Silver Electronics', title: 'Whirlpool Fresh Magic Pro 236L Glass Door Floral X…', price: 29172, mrp: 42890, sold: 27672, category: 'Fridges & Freezers', topSelling: true },
  { seller: 'New Udoy Electronics', brand: 'New Udoy Electronics', title: 'KONKA 7 Kg Automatic Washing Machine Top…', price: 29962, mrp: 36990, sold: 28462, category: 'Laundry & Cleaning', topSelling: true },
  { seller: 'New Udoy Electronics', brand: 'New Udoy Electronics', title: 'KONKA Top Loading Washing Machine 8.0 KG…', price: 31592, mrp: 39490, sold: 30092, category: 'Laundry & Cleaning', topSelling: true },
  { seller: 'New Udoy Electronics', brand: 'Sharp', title: 'Sharp R-77AT(ST) 34L Grill Microwave Oven', price: 20000, mrp: 25000, sold: 18500, category: 'Ovens', topSelling: true },
  { seller: 'New Udoy Electronics', brand: 'SAMSUNG', title: 'Samsung 43U8500F 43" Crystal 4K UHD LED Sma…', price: 45821, mrp: 45821, sold: 45821, outOfStock: true, category: 'Televisions', topSelling: true },
  { seller: 'Silver Electronics', brand: 'Silver Electronics', title: 'Haier 1.5 Ton ZenGlow Inverter Air Conditioner…', price: 51113, mrp: 71990, sold: 49613, category: 'Air Conditioners', topSelling: true },
  { seller: 'Silver Electronics', brand: 'Silver Electronics', title: 'Walton 1.5 Ton Riverine Prime Inverter Air…', price: 47563, mrp: 66990, sold: 46063, category: 'Air Conditioners', topSelling: true },
  { seller: 'Silver Electronics', brand: 'Silver Electronics', title: 'Haier 1 Ton ZenGlow Inverter Air Conditioner…', price: 42333, mrp: 57990, sold: 40833, category: 'Air Conditioners', topSelling: true },
  { seller: 'Bata', brand: 'Bata', title: 'Bata Platinum Voucher 5000 (Instant Activation)', price: 4000, mrp: 5000, sold: 3600, category: 'Home & Lifestyle', topSelling: true },
  { seller: 'Pure It', brand: 'Pure It', title: 'Pureit Ultima Pro RO+MF+Dual UV In-tank…', price: 32500, mrp: 35000, discount: 7, badges: ['Bestseller'], category: 'Air & Water', topPick: true, recentSaving: true },
  { seller: 'Silver Electronics', brand: 'FUJITA', title: 'Fujita 5.0L FAF-501DW Digital Display Air Fryer', price: 5900, mrp: 7900, discount: 25, badges: ['Free delivery'], emi: true, category: 'Cooking Appliances', topPick: true, newArrival: true },
  { seller: 'Silver Electronics', brand: 'PHILIPS', title: 'Philips 6.20Ltr NA231 Digital Airfryer', price: 15400, mrp: 17200, discount: 10, badges: ['Bestseller'], category: 'Cooking Appliances', topPick: true },
  { seller: 'Silver Electronics', brand: 'FUJITA', title: 'Fujita 2500W DTLW-V2 Single Burner Infrared…', price: 7800, mrp: 8700, discount: 10, badges: ['Free delivery'], category: 'Cooking Appliances', topPick: true, newArrival: true },
  { seller: 'Silver Electronics', brand: 'FUJITA', title: 'Fujita FJT-021-IH Single Burner 2000W Induction…', price: 6000, mrp: 6700, discount: 10, badges: ['Free delivery'], category: 'Cooking Appliances', topPick: true },
  { seller: 'Silver Electronics', brand: 'FUJITA', title: 'Fujita 7.0L FAF-701DW Digital Display Air Fryer', price: 11500, mrp: 12800, discount: 10, badges: ['Free delivery'], emi: true, category: 'Cooking Appliances', topPick: true },
  { seller: 'Pure It', brand: 'Pure It', title: 'Pureit Wave 6 Ltr RO+MF Water Purifier', price: 16000, mrp: 16500, discount: 3, badges: ['Bestseller'], category: 'Air & Water', topPick: true, recentSaving: true },
  { seller: 'Pure It', brand: 'Pure It', title: 'Pureit Marina 6 Ltr RO+UV+MF Water Purifier', price: 19500, mrp: 20500, discount: 5, badges: ['Bestseller'], category: 'Air & Water', topPick: true, recentSaving: true },
  { seller: 'Silver Electronics', brand: 'General', title: 'General ASGG-24CPTA 2.0 Ton Wall Inverter Air…', price: 149000, mrp: 165400, discount: 10, badges: ['Bestseller'], category: 'Air Conditioners', topPick: true },
  { seller: 'Pure It', brand: 'Pure It', title: 'Pureit Ultima Mineral RO+UV+MF Water Purifier', price: 30000, mrp: 32000, discount: 6, category: 'Air & Water', recentSaving: true },
  { seller: 'Pure It', brand: 'Pure It', title: 'Pureit Vital Max Water Purifier', price: 24000, mrp: 25000, discount: 4, category: 'Air & Water', recentSaving: true },
  { seller: 'Sharp', brand: 'SHARP', title: 'Sharp 140 Ltr (Net) 180 Ltr (Gross) SJC188-BK Chest…', price: 45000, mrp: 50000, discount: 10, badges: ['Bestseller'], category: 'Fridges & Freezers', newArrival: true },
  { seller: 'FUJITA', brand: 'FUJITA', title: 'Fujita 12.00 Kg FJ-W12DD Top Loading Inverter…', price: 65500, mrp: 72800, discount: 10, badges: ['Free delivery'], category: 'Laundry & Cleaning', newArrival: true },
  { seller: 'FUJITA', brand: 'FUJITA', title: 'Fujita 10.00 Kg FJ-W10DD Top Loading Inverter…', price: 59000, mrp: 65400, discount: 10, badges: ['Free delivery'], category: 'Laundry & Cleaning', newArrival: true },
  { seller: 'FUJITA', brand: 'FUJITA', title: 'Fujita 345 Ltr BCD-345WG Glass Door Refrigerator…', price: 105000, mrp: 116700, discount: 10, badges: ['Free delivery'], emi: true, category: 'Fridges & Freezers', newArrival: true },
  { seller: 'FUJITA', brand: 'FUJITA', title: 'Fujita 345 Ltr BCD-345BG Glass Door Refrigerator…', price: 105000, mrp: 116700, discount: 10, badges: ['Free delivery'], emi: true, category: 'Fridges & Freezers', newArrival: true },
  { seller: 'Sharp', brand: 'SHARP', title: 'Sharp 93 Ltr (Net) 110 Ltr (Gross) SJC128-GY Chest…', price: 29900, mrp: 33200, discount: 10, badges: ['New'], category: 'Fridges & Freezers', newArrival: true },
  { seller: 'Sharp', brand: 'SHARP', title: 'Sharp 190 Ltr (Net) 220 Ltr (Gross) SJC218-WH Chest…', price: 48000, mrp: 53400, discount: 10, badges: ['New'], category: 'Fridges & Freezers', newArrival: true },
];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const documents = (strapi: Core.Strapi, uid: string): any =>
  (strapi as any).documents(uid);

async function listAll(strapi: Core.Strapi, uid: string): Promise<Doc[]> {
  return (await documents(strapi, uid).findMany({})) as Doc[];
}

async function ensurePublished(strapi: Core.Strapi, uid: string): Promise<void> {
  const docs = await listAll(strapi, uid);
  for (const d of docs) {
    if (!d.publishedAt && d.documentId) {
      await documents(strapi, uid).publish({ documentId: d.documentId });
    }
  }
}

async function ensureBrands(strapi: Core.Strapi): Promise<Map<string, string>> {
  const uid = 'api::brand.brand';
  const existing = await listAll(strapi, uid);
  if (existing.length === 0) {
    for (const name of BRANDS) {
      await documents(strapi, uid).create({
        data: { name, slug: slugify(name) },
        status: 'published',
      });
    }
  } else {
    for (const b of existing) {
      if (!b.slug && typeof b.name === 'string' && b.documentId) {
        await documents(strapi, uid).update({
          documentId: b.documentId,
          data: { slug: slugify(b.name) },
        });
      }
    }
  }
  await ensurePublished(strapi, uid);

  const map = new Map<string, string>();
  for (const b of await listAll(strapi, uid)) {
    if (typeof b.name === 'string' && b.documentId) map.set(b.name.toLowerCase(), b.documentId);
  }
  return map;
}

async function getOrCreateBrand(
  strapi: Core.Strapi, name: string, map: Map<string, string>
): Promise<string> {
  const key = name.toLowerCase();
  const found = map.get(key);
  if (found) return found;
  const doc = (await documents(strapi, 'api::brand.brand').create({
    data: { name, slug: slugify(name) },
    status: 'published',
  })) as Doc;
  map.set(key, doc.documentId);
  return doc.documentId;
}

async function ensureCategories(strapi: Core.Strapi): Promise<Map<string, string>> {
  const uid = 'api::category.category';
  const existing = await listAll(strapi, uid);
  if (existing.length === 0) {
    for (const c of CATEGORIES) {
      await documents(strapi, uid).create({
        data: { label: c.label, icon: c.icon, slug: slugify(c.label), navVisible: true },
        status: 'published',
      });
    }
  } else {
    for (const c of existing) {
      if (!c.slug && typeof c.label === 'string' && c.documentId) {
        await documents(strapi, uid).update({
          documentId: c.documentId,
          data: { slug: slugify(c.label) },
        });
      }
    }
  }
  await ensurePublished(strapi, uid);

  const map = new Map<string, string>();
  for (const c of await listAll(strapi, uid)) {
    if (typeof c.label === 'string' && c.documentId) map.set(c.label.toLowerCase(), c.documentId);
  }
  return map;
}

async function ensureHeroAndPromo(strapi: Core.Strapi): Promise<void> {
  const heroUid = 'api::hero-slide.hero-slide';
  // Hero slides are image-only now: remove any legacy text-based rows that
  // lack an uploaded image, then let the admin create banner-image slides.
  const heroDocs = (await documents(strapi, heroUid).findMany({
    populate: { image: true },
  })) as Doc[];
  for (const h of heroDocs) {
    const withImage = typeof h.image === 'object' && h.image !== null;
    if (!withImage && typeof h.documentId === 'string') {
      await documents(strapi, heroUid).delete({ documentId: h.documentId });
    }
  }

  const promoUid = 'api::promo-banner.promo-banner';
  if ((await listAll(strapi, promoUid)).length === 0) {
    for (const b of PROMO_BANNERS) {
      await documents(strapi, promoUid).create({
        data: { ...b },
        status: 'published',
      });
    }
  }
  await ensurePublished(strapi, promoUid);
}

async function seedProducts(
  strapi: Core.Strapi,
  brandMap: Map<string, string>,
  categoryMap: Map<string, string>
): Promise<void> {
  const uid = 'api::product.product';
  const existing = await listAll(strapi, uid);
  if (existing.length > 0) return;

  for (const p of PRODUCTS) {
    const brandDocId = await getOrCreateBrand(strapi, p.brand, brandMap);
    const catDocId = categoryMap.get(p.category.toLowerCase());
    const categories = catDocId ? { connect: [catDocId] } : { connect: [] };

    await documents(strapi, uid).create({
      data: {
        title: p.title,
        slug: slugify(p.title),
        seller: p.seller,
        price: p.price,
        mrp: p.mrp,
        discount: p.discount ?? 0,
        sold: p.sold ?? 0,
        outOfStock: p.outOfStock ?? false,
        emi: p.emi ?? false,
        badges: p.badges ?? [],
        isTopSelling: p.topSelling ?? false,
        isTopPick: p.topPick ?? false,
        isNewArrival: p.newArrival ?? false,
        isRecentSaving: p.recentSaving ?? false,
        brand: { connect: [brandDocId] },
        categories,
      },
      status: 'published',
    });
  }
  strapi.log.info(`Seeded ${PRODUCTS.length} products`);
}

async function ensureSettings(strapi: Core.Strapi): Promise<void> {
  const uid = 'api::setting.setting';
  const existing = await documents(strapi, uid).findFirst({});
  if (existing) {
    if (!existing.publishedAt && existing.documentId) {
      await documents(strapi, uid).publish({ documentId: existing.documentId });
    }
    return;
  }
  await documents(strapi, uid).create({
    data: { ...DEFAULT_SETTINGS },
    status: 'published',
  });
  strapi.log.info('Seeded site settings');
}

async function ensurePublicPermissions(strapi: Core.Strapi): Promise<void> {
  const publicRole = await strapi.db
    .query('plugin::users-permissions.role')
    .findOne({ where: { type: 'public' } });
  if (!publicRole) return;

  const actions = [
    'api::product.product.find',
    'api::product.product.findOne',
    'api::category.category.find',
    'api::category.category.findOne',
    'api::brand.brand.find',
    'api::brand.brand.findOne',
    'api::hero-slide.hero-slide.find',
    'api::hero-slide.hero-slide.findOne',
    'api::promo-banner.promo-banner.find',
    'api::promo-banner.promo-banner.findOne',
    'api::setting.setting.find',
    'api::order.order.create',
  ];

  for (const action of actions) {
    const existing = await strapi.db
      .query('plugin::users-permissions.permission')
      .findMany({ where: { action, role: publicRole.id } });
    if (existing.length === 0) {
      await strapi.db
        .query('plugin::users-permissions.permission')
        .create({ data: { action, role: publicRole.id } });
    }
  }
  strapi.log.info('Ensured public read permissions');
}

export default {
  register() {},

  async bootstrap({ strapi }: { strapi: Core.Strapi }) {
    if (process.env.SEED_ON_BOOT === 'false') return;
    try {
      const brandMap = await ensureBrands(strapi);
      const categoryMap = await ensureCategories(strapi);
      await ensureHeroAndPromo(strapi);
      await seedProducts(strapi, brandMap, categoryMap);
      await ensureSettings(strapi);
      await ensurePublicPermissions(strapi);
    } catch (e) {
      strapi.log.warn(`Auto-seed skipped: ${(e as Error).message}`);
    }
  },
};