"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { featuredBrands } from "@/lib/data";

type BrandItem = { name: string; slug: string; image?: string };

export function Brands({ items }: { items?: BrandItem[] }) {
  const [expanded, setExpanded] = useState(false);
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});

  const cms: BrandItem[] = items ?? [];
  const brands: BrandItem[] = cms.length > 0
    ? cms
    : featuredBrands.map((name) => ({ name, slug: name.toLowerCase() }));
  console.log("Total brands:", brands.length);

  const visible = expanded ? brands : brands.slice(0, 10);
  const hiddenCount = Math.max(0, brands.length - 10);

  return (
    <section aria-labelledby="brands" className="py-3">
      <div className="container-page text-center">
        <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-brand-600">World-renowned · Hand-picked</p>
        <h2 id="brands" className="mt-1 text-xl font-extrabold">Pick Your Top Brands Shop</h2>
        <p className="mt-1 text-xs text-muted">100+ world-renowned brands — imported, stocked, and fully serviced by us.</p>

        <ul className="mx-auto mt-3 grid max-w-5xl grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {visible.map((b) => {
            const image = b.image && !failedImages[b.slug] ? b.image : undefined;
            return (
              <li key={b.slug}>
                <Link href={`/brands/${b.slug}`} className="flex h-28 flex-col items-center justify-center gap-1 rounded-2xl bg-white p-2 shadow-card transition hover:shadow-float">
                  {image ? (
                    <Image
                      src={image}
                      alt={`${b.name} logo`}
                      width={240}
                      height={120}
                      className="h-16 w-full object-contain"
                      onError={() => setFailedImages((failed) => ({ ...failed, [b.slug]: true }))}
                    />
                  ) : (
                    <span aria-hidden="true" className="flex h-16 w-full shrink-0 items-center justify-center rounded-lg bg-slate-50 text-2xl font-extrabold text-brand-200">
                      {b.name.slice(0, 1).toUpperCase()}
                    </span>
                  )}
                  <span className="line-clamp-2 max-w-full text-[10px] font-bold leading-tight text-ink">
                    {b.name}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>

        {hiddenCount > 0 && (
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            aria-expanded={expanded}
            className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-brand-700 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-brand-800"
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