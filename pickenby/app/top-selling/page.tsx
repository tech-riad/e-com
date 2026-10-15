import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { getProducts } from "@/lib/cms";
import { topSelling } from "@/lib/data";
import { SoldCard } from "@/components/ProductCard";

export const metadata: Metadata = { title: "Top Selling Products — Pickenby" };

export const revalidate = 60;

const PAGE_SIZE = 24;

type Sort = "top_selling" | "price_asc" | "price_desc";
type Props = { searchParams?: Promise<{ page?: string; sort?: string }> };

export default async function TopSellingPage({ searchParams }: Props) {
  const { page: pageParam, sort: sortParam } = (await searchParams) ?? {};
  const requestedPage = Math.max(1, parseInt(pageParam ?? "1", 10) || 1);
  const sort: Sort = sortParam === "price_asc" || sortParam === "price_desc" ? sortParam : "top_selling";
  const cmsProducts = await getProducts({ isTopSelling: true }).catch(() => []);
  const allProducts = [...(cmsProducts.length > 0 ? cmsProducts : topSelling)].sort((a, b) => {
    if (sort === "price_asc") return a.price - b.price;
    if (sort === "price_desc") return b.price - a.price;
    return (b.sold ?? 0) - (a.sold ?? 0);
  });
  const totalPages = Math.max(1, Math.ceil(allProducts.length / PAGE_SIZE));
  const page = Math.min(requestedPage, totalPages);
  const products = allProducts.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const sortHref = (value: Sort) => `/top-selling?page=1&sort=${value}`;
  const linkClass = (active: boolean) =>
    `rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
      active ? "bg-brand-700 text-white" : "border border-slate-200 hover:border-brand-500"
    }`;

  return (
    <main className="pb-16">
      <div className="container-page">
        <nav aria-label="Breadcrumb" className="flex items-center gap-0.5 py-3 text-[11px] text-muted">
          <Link href="/" className="hover:text-brand-700">Home</Link>
          <ChevronRight className="size-3" />
          <span className="text-ink">Top Selling Products</span>
        </nav>

        <header className="mb-4 flex items-end justify-between">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight">Top Selling Products</h1>
            <p className="mt-1 text-xs text-muted">{allProducts.length} products</p>
          </div>
          <div className="flex gap-1">
            <Link href={sortHref("top_selling")} className={linkClass(sort === "top_selling")}>Top selling</Link>
            <Link href={sortHref("price_asc")} className={linkClass(sort === "price_asc")}>Price ↑</Link>
            <Link href={sortHref("price_desc")} className={linkClass(sort === "price_desc")}>Price ↓</Link>
          </div>
        </header>

        {allProducts.length > 0 ? (
          <>
            <ul className="grid grid-cols-2 gap-1.5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
              {products.map((product) => (
                <li key={product.id}><SoldCard p={product} /></li>
              ))}
            </ul>

            {totalPages > 1 && (
              <nav aria-label="Pagination" className="mt-6 flex justify-center gap-1">
                {page > 1 && (
                  <Link
                    href={`/top-selling?page=${page - 1}&sort=${sort}`}
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
                    href={`/top-selling?page=${page + 1}&sort=${sort}`}
                    className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold hover:border-brand-500"
                  >
                    Next
                  </Link>
                )}
              </nav>
            )}
          </>
        ) : (
          <div className="rounded-2xl bg-white p-6 text-center shadow-card">
            <p className="text-sm font-semibold text-ink">No top selling products yet.</p>
            <Link href="/" className="mt-3 inline-block text-xs font-semibold text-brand-700 hover:underline">
              Back to home
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}