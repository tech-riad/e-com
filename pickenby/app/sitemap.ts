import type { MetadataRoute } from "next";
import { getAllProducts, getCategories } from "@/lib/cms";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [cats, products] = await Promise.all([
    getCategories().catch(() => []),
    getAllProducts(1, 1000, "newest").catch(() => ({ products: [] as never[], total: 0 })),
  ]);

  const staticEntries: MetadataRoute.Sitemap = [
    { url: `${siteUrl}/`, changeFrequency: "daily", priority: 1 },
    { url: `${siteUrl}/products`, changeFrequency: "daily", priority: 0.8 },
    { url: `${siteUrl}/search`, changeFrequency: "weekly", priority: 0.3 },
  ];

  const categoryEntries: MetadataRoute.Sitemap = cats.map((c) => ({
    url: `${siteUrl}/category/${c.slug}`,
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  const productEntries: MetadataRoute.Sitemap = products.products.map((p) => ({
    url: `${siteUrl}/products/${p.slug ?? p.id}`,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  return [...staticEntries, ...categoryEntries, ...productEntries];
}