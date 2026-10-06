export type Product = {
  id: string;
  /** URL slug — present for CMS products, derived for mocks. */
  slug?: string;
  seller?: string;
  brand?: string;
  title: string;
  price: number;
  mrp: number;
  image?: string;
  /** All product images, cover first (cover + CMS gallery). */
  images?: string[];
  sold?: number;
  outOfStock?: boolean;
  discount?: number;
  badges?: ("Bestseller" | "Free delivery" | "New")[];
  emi?: boolean;
};

export const taka = (n: number) => "৳" + n.toLocaleString("en-IN");

export const navLinks = [
  "Home",
  "Electronics & Home Appliance",
  "Mobile & Gadgets",
  "Footwear",
  "Fashion",
  "Home & Lifestyle",
  "Groceries & Essentials",
  "Computer & Accessories",
  "Mother & Baby",
];

export const sidebarCategories = [
  { label: "Televisions", icon: "tv" },
  { label: "Air Conditioners", icon: "snowflake" },
  { label: "Fridges & Freezers", icon: "fridge" },
  { label: "Laundry & Cleaning", icon: "washer" },
  { label: "Cooking Appliances", icon: "pot" },
  { label: "Gas Stoves & Kitchen Hoods", icon: "flame" },
  { label: "Ovens", icon: "oven" },
  { label: "Food Preparation", icon: "blender" },
  { label: "Audio & Entertainment", icon: "speaker" },
  { label: "Air & Water", icon: "drops" },
  { label: "Home & Lifestyle", icon: "house" },
] as const;

export const heroSlides = [
  {
    seller: "M.K. Electronics",
    headline: "Best deal in Bangladesh!",
    sub: "Less oil. More enjoyment.",
    mrp: 7900,
    price: 5900,
    product: "Fujita 5L Air Fryer",
    perks: ["Free delivery", "0% EMI for 3 months", "1 year replacement guarantee"],
  },
  {
    seller: "Silver Electronics",
    headline: "Inverter AC season sale",
    sub: "Stay cool with 10 year compressor warranty.",
    mrp: 71990,
    price: 51113,
    product: "Haier 1.5 Ton ZenGlow",
    perks: ["Free installation", "0% EMI for 6 months", "10 year warranty"],
  },
  {
    seller: "New Udoy Electronics",
    headline: "Top loading washers from ৳29,962",
    sub: "KONKA 7 Kg automatic, delivered free.",
    mrp: 36990,
    price: 29962,
    product: "KONKA 7 Kg Automatic",
    perks: ["Free delivery", "Official warranty", "Easy returns"],
  },
];

export const categoryCircles = [
  { label: "Electronics & Home Appliance", tone: "from-slate-200 to-slate-400" },
  { label: "Mobile & Gadgets", tone: "from-sky-300 to-blue-600" },
  { label: "Footwear", tone: "from-rose-100 to-rose-300" },
  { label: "Fashion", tone: "from-fuchsia-100 to-pink-300" },
  { label: "Home & Lifestyle", tone: "from-amber-100 to-stone-400" },
  { label: "Groceries & Essentials", tone: "from-lime-100 to-emerald-400" },
  { label: "Computer & Accessories", tone: "from-zinc-300 to-slate-700" },
  { label: "Mother & Baby", tone: "from-orange-100 to-stone-300" },
];

export const promoBanners = [
  { brand: "Midea", text: "১০ বছরের ওয়ারেন্টি", tone: "bg-[#0d2a6b] text-white" },
  { brand: "ANKER", text: "Power banks & chargers", tone: "bg-[#e9ebee] text-[#0a7bd8]" },
  { brand: "SAMSUNG | electra", text: "Refrigerators & washers", tone: "bg-[#eef0f4] text-[#1b3a8f]" },
];

export const topSelling: Product[] = [
  { id: "1", seller: "Silver Electronics", title: "Walton 213L Direct Cool Refrigerator (WFA-2A3-…", price: 32037, mrp: 37690, sold: 30537 },
  { id: "2", seller: "Silver Electronics", title: "Whirlpool Fresh Magic Pro 236L Glass Door Floral X…", price: 29172, mrp: 42890, sold: 27672 },
  { id: "3", seller: "New Udoy Electronics", title: "KONKA 7 Kg Automatic Washing Machine Top…", price: 29962, mrp: 36990, sold: 28462 },
  { id: "4", seller: "New Udoy Electronics", title: "KONKA Top Loading Washing Machine 8.0 KG…", price: 31592, mrp: 39490, sold: 30092 },
  { id: "5", seller: "New Udoy Electronics", title: "Sharp R-77AT(ST) 34L Grill Microwave Oven", price: 20000, mrp: 25000, sold: 18500 },
  { id: "6", seller: "New Udoy Electronics", title: 'Samsung 43U8500F 43" Crystal 4K UHD LED Sma…', price: 45821, mrp: 45821, sold: 45821, outOfStock: true },
  { id: "7", seller: "Silver Electronics", title: "Haier 1.5 Ton ZenGlow Inverter Air Conditioner…", price: 51113, mrp: 71990, sold: 49613 },
  { id: "8", seller: "Silver Electronics", title: "Walton 1.5 Ton Riverine Prime Inverter Air…", price: 47563, mrp: 66990, sold: 46063 },
  { id: "9", seller: "Silver Electronics", title: "Haier 1 Ton ZenGlow Inverter Air Conditioner…", price: 42333, mrp: 57990, sold: 40833 },
  { id: "10", seller: "Bata", title: "Bata Platinum Voucher 5000 (Instant Activation)", price: 4000, mrp: 5000, sold: 3600 },
];

/** The 10 brands shown on the homepage before "Explore All" is clicked. */
export const featuredBrands = [
  "FUJITA", "PHILIPS", "SAMSUNG", "LG", "SHARP",
  "PANASONIC", "HITACHI", "TCL", "Tefal", "FOTILE",
];

export const trending = {
  large: [
    { label: "Air Fryers", tone: "from-stone-300 to-stone-500" },
    { label: "Air Conditioners", tone: "from-sky-200 to-slate-500" },
  ],
  small: [
    { label: "Microwaves", tone: "from-stone-200 to-stone-400" },
    { label: "Televisions", tone: "from-slate-300 to-slate-600" },
    { label: "Split Air Conditioners", tone: "from-sky-100 to-slate-400" },
    { label: "Rice Cookers", tone: "from-stone-200 to-rose-300" },
    { label: "Electric Blenders", tone: "from-stone-200 to-stone-400" },
    { label: "Gas Stoves", tone: "from-zinc-200 to-zinc-500" },
    { label: "Home & Lifestyle", tone: "from-neutral-300 to-neutral-600" },
    { label: "Front Load Washing Machines", tone: "from-slate-200 to-slate-500" },
  ],
};

export const topPicks: Product[] = [
  { id: "p1", brand: "Pure It", title: "Pureit Ultima Pro RO+MF+Dual UV In-tank…", price: 32500, mrp: 35000, discount: 7, badges: ["Bestseller"] },
  { id: "p2", brand: "Fujita", title: "Fujita 5.0L FAF-501DW Digital Display Air Fryer", price: 5900, mrp: 7900, discount: 25, badges: ["Free delivery"], emi: true },
  { id: "p3", brand: "Philips", title: "Philips 6.20Ltr NA231 Digital Airfryer", price: 15400, mrp: 17200, discount: 10, badges: ["Bestseller"] },
  { id: "p4", brand: "Fujita", title: "Fujita 2500W DTLW-V2 Single Burner Infrared…", price: 7800, mrp: 8700, discount: 10, badges: ["Free delivery"] },
  { id: "p5", brand: "Fujita", title: "Fujita FJT-021-IH Single Burner 2000W Induction…", price: 6000, mrp: 6700, discount: 10, badges: ["Free delivery"] },
  { id: "p6", brand: "Fujita", title: "Fujita 7.0L FAF-701DW Digital Display Air Fryer", price: 11500, mrp: 12800, discount: 10, badges: ["Free delivery"], emi: true },
  { id: "p7", brand: "Pure It", title: "Pureit Wave 6 Ltr RO+MF Water Purifier", price: 16000, mrp: 16500, discount: 3, badges: ["Bestseller"] },
  { id: "p8", brand: "Pure It", title: "Pureit Marina 6 Ltr RO+UV+MF Water Purifier", price: 19500, mrp: 20500, discount: 5, badges: ["Bestseller"] },
  { id: "p9", brand: "General", title: "General ASGG-24CPTA 2.0 Ton Wall Inverter Air…", price: 149000, mrp: 165400, discount: 10, badges: ["Bestseller"] },
];

export const recentSavings: Product[] = [
  { id: "r1", brand: "Pure It", title: "Pureit Marina 6 Ltr RO+UV+MF Water Purifier", price: 19500, mrp: 20500, discount: 5 },
  { id: "r2", brand: "Pure It", title: "Pureit Ultima Mineral RO+UV+MF Water Purifier", price: 30000, mrp: 32000, discount: 6 },
  { id: "r3", brand: "Pure It", title: "Pureit Vital Max Water Purifier", price: 24000, mrp: 25000, discount: 4 },
  { id: "r4", brand: "Pure It", title: "Pureit Wave 6 Ltr RO+MF Water Purifier", price: 16000, mrp: 16500, discount: 3 },
  { id: "r5", brand: "Pure It", title: "Pureit Ultima Pro RO+MF+Dual UV In-tank…", price: 32500, mrp: 35000, discount: 7 },
];

export const newArrivals: Product[] = [
  { id: "n1", brand: "Fujita", title: "Fujita 5.0L FAF-501DW Digital Display Air Fryer", price: 5900, mrp: 7900, discount: 25, badges: ["Free delivery"], emi: true },
  { id: "n2", brand: "Fujita", title: "Fujita 2500W DTLW-V2 Single Burner Infrared…", price: 7800, mrp: 8700, discount: 10, badges: ["Free delivery"] },
  { id: "n3", brand: "Sharp", title: "Sharp 140 Ltr (Net) 180 Ltr (Gross) SJC188-BK Chest…", price: 45000, mrp: 50000, discount: 10, badges: ["Bestseller"] },
  { id: "n4", brand: "Fujita", title: "Fujita 12.00 Kg FJ-W12DD Top Loading Inverter…", price: 65500, mrp: 72800, discount: 10, badges: ["Free delivery"] },
  { id: "n5", brand: "Fujita", title: "Fujita 10.00 Kg FJ-W10DD Top Loading Inverter…", price: 59000, mrp: 65400, discount: 10, badges: ["Free delivery"] },
  { id: "n6", brand: "Fujita", title: "Fujita 345 Ltr BCD-345WG Glass Door Refrigerator…", price: 105000, mrp: 116700, discount: 10, badges: ["Free delivery"], emi: true },
  { id: "n7", brand: "Fujita", title: "Fujita 345 Ltr BCD-345BG Glass Door Refrigerator…", price: 105000, mrp: 116700, discount: 10, badges: ["Free delivery"], emi: true },
  { id: "n8", brand: "Sharp", title: "Sharp 93 Ltr (Net) 110 Ltr (Gross) SJC128-GY Chest…", price: 29900, mrp: 33200, discount: 10, badges: ["New"] },
  { id: "n9", brand: "Sharp", title: "Sharp 190 Ltr (Net) 220 Ltr (Gross) SJC218-WH Chest…", price: 48000, mrp: 53400, discount: 10, badges: ["New"] },
];

export const payments = ["bKash", "Nagad", "VISA", "Mastercard", "Rocket", "Upay", "DBBL", "AmEx", "SSLCommerz", "Islami Bank", "City Bank", "bKash Pay"];
