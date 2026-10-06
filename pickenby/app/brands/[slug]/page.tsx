import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { getBrandBySlug, getProductsByBrand } from "@/lib/cms";
import { DealCard } from "@/components/ProductCard";

export const revalidate = 60;

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const brand = await getBrandBySlug(slug);
  return { title: brand ? `${brand.name} — Pickenby` : "Brand — Pickenby" };
}

export default async function BrandPage({ params }: Props) {
  const { slug } = await params;
  const brand = await getBrandBySlug(slug);
  const products = await getProductsByBrand(slug, 1, 100);

  if (!brand && products.length === 0) notFound();

  return (
    <main className="pb-16">
      <div className="container-page">
        <nav aria-label="Breadcrumb" className="flex items-center gap-0.5 py-4 text-[11px] text-muted">
          <Link href="/" className="hover:text-brand-700">Home</Link>
          <ChevronRight className="size-3" />
          <span className="text-ink">{brand?.name ?? slug}</span>
        </nav>

        <header className="mb-6 flex items-center justify-center rounded-2xl bg-white py-8 shadow-card">
          <div className="text-center">
            <h1 className="text-3xl font-black tracking-tight">{brand?.name ?? slug}</h1>
            <p className="mt-1 text-xs text-muted">{products.length} products</p>
          </div>
        </header>

        {products.length > 0 ? (
          <ul className="grid grid-cols-2 gap-1.5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {products.map((p) => (
              <li key={p.id} className="flex">
                <DealCard p={p} className="w-full" />
              </li>
            ))}
          </ul>
        ) : (
          <div className="rounded-2xl bg-white p-10 text-center shadow-card">
            <p className="text-sm font-semibold text-ink">No products from this brand yet.</p>
            <Link href="/" className="mt-3 inline-block text-xs font-semibold text-brand-700 hover:underline">
              Back to home
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}