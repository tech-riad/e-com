import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { getAllProducts, toSort } from "@/lib/cms";
import { DealCard } from "@/components/ProductCard";

export const metadata: Metadata = { title: "All Products — Pickenby" };

export const revalidate = 60;

const PAGE_SIZE = 24;

type Props = { searchParams?: Promise<{ page?: string; sort?: string }> };

export default async function ProductsPage({ searchParams }: Props) {
  const { page: pageParam, sort: sortParam } = (await searchParams) ?? {};
  const page = Math.max(1, parseInt(pageParam ?? "1", 10) || 1);
  const sort = toSort(sortParam);

  const { products, total } = await getAllProducts(page, PAGE_SIZE, sort);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const sortHref = (s: string) => `/products?page=1&sort=${s}`;
  const linkClass = (active: boolean) =>
    `rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
      active ? "bg-brand-700 text-white" : "border border-slate-200 hover:border-brand-500"
    }`;

  return (
    <main className="pb-16">
      <div className="container-page">
        <nav aria-label="Breadcrumb" className="flex items-center gap-0.5 py-4 text-[11px] text-muted">
          <Link href="/" className="hover:text-brand-700">Home</Link>
          <ChevronRight className="size-3" />
          <span className="text-ink">All Products</span>
        </nav>

        <header className="mb-6 flex items-end justify-between">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight">All Products</h1>
            <p className="mt-1 text-xs text-muted">{total} products</p>
          </div>
          <div className="flex gap-1">
            <Link href={sortHref("newest")} className={linkClass(sort === "newest")}>Newest</Link>
            <Link href={sortHref("price_asc")} className={linkClass(sort === "price_asc")}>Price ↑</Link>
            <Link href={sortHref("price_desc")} className={linkClass(sort === "price_desc")}>Price ↓</Link>
          </div>
        </header>

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
                    href={`/products?page=${page - 1}&sort=${sort}`}
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
                    href={`/products?page=${page + 1}&sort=${sort}`}
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
            <p className="text-sm font-semibold text-ink">No products yet.</p>
            <Link href="/" className="mt-3 inline-block text-xs font-semibold text-brand-700 hover:underline">
              Back to home
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}