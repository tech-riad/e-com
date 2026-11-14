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

  const visible = expanded ? brands : brands.slice(0, 10);
  const hiddenCount = Math.max(0, brands.length - 10);

  return (
    <section aria-labelledby="brands" className="py-3">
      <div className="container-page text-center">
        <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-brand-600">World-renowned · Hand-picked</p>
        <h2 id="brands" className="mt-1 text-xl font-extrabold">Pick Your Top Brands Shop</h2>
        <p className="mt-1 text-xs text-muted">100+ world-renowned brands — imported, stocked, and fully serviced by us.</p>

        <ul className="mx-auto mt-4 grid max-w-5xl grid-cols-2 gap-2 sm:grid-cols-4">
          {visible.map((b) => {
            const image = b.image && !failedImages[b.slug] ? b.image : undefined;
            return (
              <li key={b.slug} className="min-w-0">
                <Link
                  href={`/brands/${b.slug}`}
                  className="group relative block aspect-[1.6/1] overflow-hidden rounded-2xl bg-slate-200 shadow-card"
                >
                  {image ? (
                    <Image
                      src={image}
                      alt={`${b.name}`}
                      width={240}
                      height={120}
                      sizes="(max-width: 639px) 82vw, (max-width: 1023px) 46vw, 32vw"
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      onError={() => setFailedImages((failed) => ({ ...failed, [b.slug]: true }))}
                    />
                  ) : (
                    <span
                      aria-hidden="true"
                      className="absolute inset-0 grid place-items-center bg-gradient-to-br from-brand-800 via-brand-700 to-slate-700 text-6xl font-extrabold text-white/25"
                    >
                      {b.name.slice(0, 1).toUpperCase()}
                    </span>
                  )}
                  <span aria-hidden="true" className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  <span className="absolute bottom-0 left-0 line-clamp-2 max-w-full px-3 pb-3 text-left text-sm font-extrabold leading-tight text-white drop-shadow-sm">
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