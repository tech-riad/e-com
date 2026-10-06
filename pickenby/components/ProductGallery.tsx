"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ProductImage } from "./ProductImage";

/** Product-page gallery: large main image with thumbnails and prev/next arrows. */
export function ProductGallery({ images, alt }: { images: string[]; alt: string }) {
  const [active, setActive] = useState(0);
  const count = images.length;
  const current = images[Math.min(active, Math.max(count - 1, 0))];
  const go = (delta: number) => setActive((i) => (i + delta + count) % count);

  return (
    <div className="min-w-0">
      <div className="relative">
        <ProductImage
          src={current}
          alt={count > 1 ? `${alt} — image ${active + 1} of ${count}` : alt}
          sizes="(min-width:1024px) 50vw, 100vw"
          className="aspect-square rounded-2xl bg-lavender shadow-card"
        />
        {count > 1 && (
          <>
            <button
              type="button"
              onClick={() => go(-1)}
              aria-label="Previous image"
              className="absolute left-2 top-1/2 grid size-9 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-ink shadow-card hover:bg-white"
            >
              <ChevronLeft className="size-5" />
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              aria-label="Next image"
              className="absolute right-2 top-1/2 grid size-9 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-ink shadow-card hover:bg-white"
            >
              <ChevronRight className="size-5" />
            </button>
          </>
        )}
      </div>

      {count > 1 && (
        <ul className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {images.map((src, i) => (
            <li key={src} className="shrink-0">
              <button
                type="button"
                onClick={() => setActive(i)}
                aria-label={`Show image ${i + 1}`}
                aria-current={i === active ? "true" : undefined}
                className={`relative block size-16 overflow-hidden rounded-lg bg-lavender sm:size-20 ${
                  i === active ? "ring-2 ring-brand-600" : "ring-1 ring-slate-200 hover:ring-brand-500"
                }`}
              >
                <Image src={src} alt="" fill sizes="80px" className="object-contain p-1" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
