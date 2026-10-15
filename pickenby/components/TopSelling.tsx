import Link from "next/link";
import { ArrowRight, Trophy } from "lucide-react";
import { topSelling, type Product } from "@/lib/data";
import { SoldCard } from "./ProductCard";

export function TopSelling({ products }: { products?: Product[] }) {
  const items = products && products.length > 0 ? products : topSelling;

  return (
    <section aria-labelledby="top-selling" className="py-2">
      <div className="container-page">
        <div className="mb-4 text-center">
          <h2 id="top-selling" className="text-2xl font-extrabold tracking-tight">Top Selling Products</h2>
          <p className="mt-1 text-xs text-muted">Check out what&apos;s trending — customer favourites and bestsellers.</p>
        </div>
        <ul id="top-selling-products" className="grid grid-cols-2 gap-x-2 gap-y-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {items.slice(0, 9).map((p) => (
            <li key={p.id}><SoldCard p={p} /></li>
          ))}
          {items.length > 9 && (
            <li className="flex">
              <Link
                href="/top-selling"
                aria-label={`View all ${items.length} top selling products`}
                className="flex h-full w-full flex-col rounded-xl bg-white p-5 text-left shadow-card transition hover:shadow-float"
              >
                <span className="grid size-9 place-items-center rounded-full bg-gold-soft text-gold">
                  <Trophy aria-hidden className="size-4" />
                </span>
                <span className="mt-4 text-[9px] font-bold uppercase tracking-widest text-muted">Top selling</span>
                <span className="mt-1 text-sm font-extrabold">See every bestseller</span>
                <span className="mt-2 text-[11px] leading-relaxed text-muted">
                  {items.length - 9} more products to discover.
                </span>
                <span className="mt-auto flex items-center gap-0.5 pt-6 text-xs font-bold text-brand-700">
                  View all <ArrowRight aria-hidden className="size-3.5" />
                </span>
              </Link>
            </li>
          )}
        </ul>
      </div>
    </section>
  );
}
