import type { Metadata } from "next";
import Link from "next/link";
import { Search } from "lucide-react";
import { searchProducts } from "@/lib/cms";
import { DealCard } from "@/components/ProductCard";

export const revalidate = 60;

type Props = { searchParams?: Promise<{ q?: string }> };

export const metadata: Metadata = { title: "Search — Pickenby" };

export default async function SearchPage({ searchParams }: Props) {
  const { q } = (await searchParams) ?? {};
  const query = q?.trim() ?? "";
  const results = query ? await searchProducts(query) : [];

  return (
    <main className="pb-16">
      <div className="container-page">
        <header className="py-6">
          <h1 className="flex items-center gap-1 text-2xl font-extrabold tracking-tight">
            <Search className="size-5 text-brand-600" /> Search results
          </h1>
          {query && (
            <p className="mt-1 text-xs text-muted">
              {results.length} result{results.length === 1 ? "" : "s"} for “{query}”
            </p>
          )}
        </header>

        {results.length > 0 ? (
          <ul className="grid grid-cols-2 gap-1.5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {results.map((p) => (
              <li key={p.id} className="flex">
                <DealCard p={p} className="w-full" />
              </li>
            ))}
          </ul>
        ) : (
          <div className="rounded-2xl bg-white p-10 text-center shadow-card">
            <p className="text-sm font-semibold text-ink">
              {query ? "No products matched your search." : "Type a product name to search."}
            </p>
            <Link href="/" className="mt-3 inline-block text-xs font-semibold text-brand-700 hover:underline">
              Back to home
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}