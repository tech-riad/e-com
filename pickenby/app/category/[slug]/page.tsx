import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { getCategoryBySlug, getProductsByCategory, getCategories } from "@/lib/cms";
import { DealCard } from "@/components/ProductCard";

export const revalidate = 60;

type Props = {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ page?: string }>;
};

export async function generateStaticParams() {
  const cats = await getCategories().catch(() => []);
  return cats.filter((c) => c.slug).map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const cat = await getCategoryBySlug(slug);
  return { title: cat ? `${cat.label} — Pickenby` : "Category — Pickenby" };
}

const PAGE_SIZE = 24;

export default async function CategoryPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { page: pageParam } = (await searchParams) ?? {};
  const page = Math.max(1, parseInt(pageParam ?? "1", 10) || 1);

  const category = await getCategoryBySlug(slug);
  const { products, total } = await getProductsByCategory(slug, page, PAGE_SIZE);

  if (!category && products.length === 0) notFound();

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  // Build parent breadcrumb
  let parentCategory = null;
  if (category?.parentSlug) {
    parentCategory = await getCategoryBySlug(category.parentSlug);
  }

  return (
    <main className="pb-16">
      <div className="container-page">
        <nav aria-label="Breadcrumb" className="flex items-center gap-0.5 py-4 text-[11px] text-muted">
          <Link href="/" className="hover:text-brand-700">Home</Link>
          <ChevronRight className="size-3" />
          {parentCategory && (
            <>
              <Link href={`/category/${parentCategory.slug}`} className="hover:text-brand-700">
                {parentCategory.label}
              </Link>
              <ChevronRight className="size-3" />
            </>
          )}
          <span className="line-clamp-1 text-ink">{category?.label ?? slug}</span>
        </nav>

        <header className="mb-6">
          <h1 className="text-2xl font-extrabold tracking-tight">{category?.label ?? slug}</h1>
          <p className="mt-1 text-xs text-muted">{total} products</p>
        </header>

        {/* Subcategory tiles */}
        {category?.children && category.children.length > 0 && (
          <div className="mb-8">
            <h2 className="mb-3 text-sm font-bold text-ink">Subcategories</h2>
            <ul className="grid grid-cols-2 gap-1 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
              {category.children.map((child) => (
                <li key={child.slug}>
                  <Link
                    href={`/category/${child.slug}`}
                    className="flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs font-semibold text-ink shadow-card transition hover:border-brand-500 hover:text-brand-700"
                  >
                    <span className="flex-1 truncate">{child.label}</span>
                    <ChevronRight className="size-3 text-muted" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}

        {products.length > 0 ? (
          <>
            <ul className="grid grid-cols-2 gap-1.5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
              {products.map((p) => (
                <li key={p.id} className="flex">
                  <DealCard p={p} className="w-full" />
                </li>
              ))}
            </ul>

            {totalPages > 1 && (
              <nav aria-label="Pagination" className="mt-8 flex justify-center gap-1">
                {page > 1 && (
                  <Link
                    href={`/category/${slug}?page=${page - 1}`}
                    className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold hover:border-brand-500"
                  >
                    Previous
                  </Link>
                )}
                <span className="px-3 py-1.5 text-xs text-muted">
                  Page {page} of {totalPages}
                </span>
                {page < totalPages && (
                  <Link
                    href={`/category/${slug}?page=${page + 1}`}
                    className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold hover:border-brand-500"
                  >
                    Next
                  </Link>
                )}
              </nav>
            )}
          </>
        ) : (
          <div className="rounded-2xl bg-white p-10 text-center shadow-card">
            <p className="text-sm font-semibold text-ink">No products in this category yet.</p>
            <Link href="/" className="mt-3 inline-block text-xs font-semibold text-brand-700 hover:underline">
              Back to home
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}