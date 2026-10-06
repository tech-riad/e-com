"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { featuredBrands } from "@/lib/data";

type BrandItem = { name: string; slug: string; image?: string };

export function Brands({ items }: { items?: BrandItem[] }) {
  const [expanded, setExpanded] = useState(false);

  // 10 manual brands always come first; the rest come from the CMS.
  const cms: BrandItem[] = items ?? [];
  const logoOf = (slug: string) => cms.find((b) => b.slug === slug)?.image;

  const manual: BrandItem[] = featuredBrands.map((name) => ({
    name,
    slug: name.toLowerCase(),
    image: logoOf(name.toLowerCase()),
  }));
  const manualSlugs = new Set(manual.map((b) => b.slug));
  const rest = cms.filter((b) => !manualSlugs.has(b.slug));

  const visible = expanded ? [...manual, ...rest] : manual;
  const hiddenCount = rest.length;

  return (
    <section aria-labelledby="brands" className="py-10">
      <div className="container-page text-center">
        <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-brand-600">World-renowned · Hand-picked</p>
        <h2 id="brands" className="mt-1 text-xl font-extrabold">Pick Your Top Brands Shop</h2>
        <p className="mt-1 text-xs text-muted">100+ world-renowned brands — imported, stocked, and fully serviced by us.</p>

        <ul className="mx-auto mt-8 grid max-w-5xl grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {visible.map((b) => (
            <li key={b.slug}>
              <Link href={`/brands/${b.slug}`} className="grid h-24 place-items-center rounded-2xl bg-white shadow-card transition hover:shadow-float">
                {b.image ? (
                  <Image
                    src={b.image}
                    alt={b.name}
                    width={120}
                    height={40}
                    className="max-h-12 w-auto object-contain p-2"
                  />
                ) : (
                  <span className="text-[10px] font-bold tracking-wider text-slate-400 transition hover:text-brand-700">
                    {b.name}
                  </span>
                )}
              </Link>
            </li>
          ))}
        </ul>

        {hiddenCount > 0 && (
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            aria-expanded={expanded}
            className="mt-6 inline-flex items-center gap-1.5 rounded-xl bg-brand-700 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-brand-800"
          >
            {expanded ? (
              <>
                Show Less
                <ChevronUp aria-hidden className="size-4" />
              </>
            ) : (
              <>
                Explore All
                <ChevronDown aria-hidden className="size-4" />
              </>
            )}
          </button>
        )}
      </div>
    </section>
  );
}