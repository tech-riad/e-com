import { topSelling, type Product } from "@/lib/data";
import { SoldCard } from "./ProductCard";

export function TopSelling({ products }: { products?: Product[] }) {
  const items = products && products.length > 0 ? products : topSelling;
  return (
    <section aria-labelledby="top-selling" className="py-10">
      <div className="container-page">
        <div className="mb-8 text-center">
          <h2 id="top-selling" className="text-2xl font-extrabold tracking-tight">Top Selling Products</h2>
          <p className="mt-1 text-xs text-muted">Check out what&apos;s trending — customer favourites and bestsellers.</p>
        </div>
        <ul className="grid grid-cols-2 gap-x-2 gap-y-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {items.map((p) => (
            <li key={p.id}><SoldCard p={p} /></li>
          ))}
        </ul>
      </div>
    </section>
  );
}
