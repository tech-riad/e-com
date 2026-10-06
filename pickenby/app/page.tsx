import { Sparkles, TrendingDown, Trophy } from "lucide-react";
import { Hero } from "@/components/Hero";
import { CategoryCircles } from "@/components/CategoryCircles";
import { PromoBanners } from "@/components/PromoBanners";
import { TopSelling } from "@/components/TopSelling";
import { Brands } from "@/components/Brands";
import { TrendingCategories } from "@/components/TrendingCategories";
import { ProductRail } from "@/components/ProductRail";
import {
  categoryCircles,
  heroSlides,
  newArrivals,
  promoBanners,
  recentSavings,
  topPicks,
  topSelling,
} from "@/lib/data";
import {
  getBrandsWithSlugs,
  getCategories,
  getCategoryProductCounts,
  getHeroSlides,
  getProducts,
  getPromoBanners,
  getTrending,
} from "@/lib/cms";

export const revalidate = 60;

export default async function HomePage() {
  // CMS-first, mock fallback. Each getter returns [] when Strapi is
  // offline/empty, so the storefront never blanks during migration.
  const [
    cmsCategories,
    cmsBrands,
    cmsHero,
    cmsPromos,
    cmsTopSelling,
    cmsTopPicks,
    cmsSavings,
    cmsNew,
    cmsTrending,
  ] = await Promise.all([
    getCategories().catch(() => []),
    getBrandsWithSlugs().catch(() => []),
    getHeroSlides().catch(() => []),
    getPromoBanners().catch(() => []),
    getProducts({ isTopSelling: true }).catch(() => []),
    getProducts({ isTopPick: true }).catch(() => []),
    getProducts({ isRecentSaving: true }).catch(() => []),
    getProducts({ isNewArrival: true }).catch(() => []),
    getTrending().catch(() => ({ large: [], small: [] })),
  ]);

  const circles =
    cmsCategories.length > 0
      ? cmsCategories.map((c, i) => ({
          label: c.label,
          slug: c.slug,
          tone: c.tone ?? categoryCircles[i % categoryCircles.length].tone,
          image: c.image,
        }))
      : categoryCircles;

  // Sidebar: top-level categories with product counts
  const topLevelCats = cmsCategories.filter((c) => !c.parentSlug);
  const sidebarSlugs = topLevelCats.map((c) => c.slug);
  const sidebarCounts = sidebarSlugs.length > 0
    ? await getCategoryProductCounts(sidebarSlugs).catch(() => new Map<string, number>())
    : new Map<string, number>();
  const sidebar = topLevelCats.map((c) => ({
    label: c.label,
    icon: c.icon ?? "house",
    slug: c.slug,
    productCount: sidebarCounts.get(c.slug) ?? 0,
    children: c.children,
  }));

  const slides = cmsHero.length > 0 ? cmsHero : heroSlides;
  const promos = cmsPromos.length > 0 ? cmsPromos : promoBanners;
  const trendingData =
    cmsTrending.large.length > 0 || cmsTrending.small.length > 0
      ? cmsTrending
      : undefined;

  return (
    <main>
      <Hero slides={slides} sidebar={sidebar} />
      <CategoryCircles items={circles} />
      <PromoBanners items={promos} />
      <TopSelling products={cmsTopSelling.length > 0 ? cmsTopSelling : topSelling} />
      <Brands items={cmsBrands.length > 0 ? cmsBrands : undefined} />
      <TrendingCategories data={trendingData} />
      <ProductRail
        eyebrow="Best sellers"
        title="Top picks loved by our customers"
        icon={Trophy}
        products={cmsTopPicks.length > 0 ? cmsTopPicks : topPicks}
        moreLabel="991+ more"
        moreTitle="See every bestseller"
        moreText="Full collection, sorted, filtered, ready to shop."
      />
      <ProductRail
        eyebrow="Price just dropped"
        title="Recent savings"
        icon={TrendingDown}
        products={cmsSavings.length > 0 ? cmsSavings : recentSavings}
        layout="row"
      />
      <ProductRail
        eyebrow="New arrivals"
        title="Fresh additions to our collection"
        icon={Sparkles}
        products={cmsNew.length > 0 ? cmsNew : newArrivals}
        moreLabel="1+ more"
        moreTitle="Browse new arrivals"
        moreText="Full collection, sorted, filtered, ready to shop."
      />
    </main>
  );
}
