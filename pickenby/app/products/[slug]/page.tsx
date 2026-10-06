import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Truck, ShieldCheck, RotateCcw, ChevronRight } from "lucide-react";
import { taka, topPicks } from "@/lib/data";
import { getProductBySlug, getProducts, getAllProducts } from "@/lib/cms";
import { ProductGallery } from "@/components/ProductGallery";
import { DealCard } from "@/components/ProductCard";
import { AddToCartButton } from "@/components/AddToCartButton";
import { BuyNowButton } from "@/components/BuyNowButton";

export const revalidate = 60;

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const { products } = await getAllProducts(1, 100, "newest").catch(() => ({
    products: [],
    total: 0,
  }));
  return products
    .filter((p) => p.slug)
    .map((p) => ({ slug: p.slug as string }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const p = await getProductBySlug(slug);
  if (!p) return { title: "Product not found — Pickenby" };
  return { title: `${p.title} — Pickenby`, description: `${p.brand ?? ""} ${p.title}` };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;

  // CMS-first; fall back to matching a mock product when Strapi is offline.
  let p = await getProductBySlug(slug);
  if (!p) {
    p = topPicks.find((x) => (x.slug ?? x.id) === slug) ?? null;
  }
  if (!p) notFound();

  const related = (await getProducts({ isTopPick: true })).filter(
    (x) => (x.slug ?? x.id) !== slug
  ).slice(0, 5);
  const fallbackRelated = topPicks.filter((x) => (x.slug ?? x.id) !== slug).slice(0, 5);
  const relatedToShow = related.length > 0 ? related : fallbackRelated;

  return (
    <main className="pb-16">
      <div className="container-page">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-0.5 py-4 text-[11px] text-muted">
          <Link href="/" className="hover:text-brand-700">Home</Link>
          <ChevronRight className="size-3" />
          <span className="line-clamp-1 text-ink">{p.title}</span>
        </nav>

        <div className="grid gap-4 lg:grid-cols-2">
          <ProductGallery images={p.images ?? (p.image ? [p.image] : [])} alt={p.title} />

          <div>
            {p.brand && (
              <p className="text-[11px] font-semibold uppercase tracking-wide text-brand-600">{p.brand}</p>
            )}
            <h1 className="mt-1 text-2xl font-extrabold leading-snug tracking-tight">{p.title}</h1>

            <div className="mt-4 flex flex-wrap items-baseline gap-1.5">
              <span className="text-3xl font-extrabold text-brand-800">{taka(p.price)}</span>
              {p.mrp > p.price && (
                <s className="text-sm text-muted">{taka(p.mrp)}</s>
              )}
              {p.discount ? (
                <span className="rounded-md bg-gold px-2 py-0.5 text-xs font-bold text-white">−{p.discount}%</span>
              ) : null}
            </div>

            {p.outOfStock ? (
              <p className="mt-4 inline-block rounded-lg bg-slate-100 px-3 py-1.5 text-sm font-semibold text-muted">
                Out of Stock
              </p>
            ) : (
              <div className="mt-5 grid w-full gap-2 sm:w-[26rem] sm:grid-cols-2">
                <AddToCartButton product={p} />
                <BuyNowButton product={p} />
              </div>
            )}

            {p.emi && (
              <span className="mt-3 inline-block rounded bg-emerald-100 px-1.5 py-0.5 text-[11px] font-bold text-emerald-700">
                0% EMI available
              </span>
            )}

            <ul className="mt-6 grid gap-1 text-xs text-muted">
              <li className="flex items-center gap-1">
                <Truck className="size-3.5 text-brand-600" /> Free delivery on eligible orders
              </li>
              <li className="flex items-center gap-1">
                <ShieldCheck className="size-3.5 text-brand-600" /> Official warranty
              </li>
              <li className="flex items-center gap-1">
                <RotateCcw className="size-3.5 text-brand-600" /> Easy returns
              </li>
            </ul>
          </div>
        </div>

        {relatedToShow.length > 0 && (
          <section aria-labelledby="related" className="mt-14">
            <h2 id="related" className="mb-5 text-lg font-extrabold tracking-tight">You may also like</h2>
            <ul className="grid grid-cols-2 gap-1.5 sm:grid-cols-3 lg:grid-cols-5">
              {relatedToShow.map((r) => (
                <li key={r.id} className="flex">
                  <DealCard p={r} className="w-full" />
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </main>
  );
}