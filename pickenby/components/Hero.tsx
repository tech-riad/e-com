"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Truck } from "lucide-react";
import { heroSlides, taka } from "@/lib/data";
import { CategoryIcon } from "./CategoryIcon";

export type HeroSlide = {
  seller: string;
  headline: string;
  sub: string;
  mrp: number;
  price: number;
  product: string;
  perks: string[];
  image?: string;
};

export type SidebarCategory = {
  label: string;
  icon: string;
  slug: string;
  productCount?: number;
  children?: { label: string; slug: string }[];
};

export function Hero({
  slides,
  sidebar,
}: {
  slides?: HeroSlide[];
  sidebar?: SidebarCategory[];
}) {
  const list: HeroSlide[] = slides && slides.length > 0 ? slides : heroSlides;
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const count = list.length;

  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % count), 5000);
    return () => clearInterval(id);
  }, [paused, count]);

  const slide = list[index];
  const go = (dir: 1 | -1) => setIndex((i) => (i + dir + count) % count);

  return (
    <section aria-label="Featured offers" className="container-page grid gap-2 py-5 lg:grid-cols-[250px_1fr]">
      {/* Category sidebar */}
      {sidebar && sidebar.length > 0 && (
        <aside className="hidden rounded-2xl bg-white p-3 shadow-card lg:block">
          <ul className="flex flex-col gap-0.5">
            {sidebar.map(({ label, icon, slug, productCount, children }) => {
              const hasChildren = children && children.length > 0;
              return (
                <li key={label} className="relative group/flyout">
                  <Link
                    href={`/category/${slug}`}
                    className="group flex items-center gap-1.5 rounded-lg px-3 py-2.5 transition hover:bg-brand-50"
                  >
                    <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-brand-50 text-brand-600 group-hover:bg-brand-100">
                      <CategoryIcon name={icon} className="size-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[11px] font-semibold text-ink group-hover:text-brand-700">
                        {label}
                      </span>
                      {productCount !== undefined && (
                        <span className="block text-[10px] text-muted">
                          {productCount} items
                        </span>
                      )}
                    </span>
                  </Link>
                  {hasChildren && (
                    <div className="invisible absolute left-full top-0 z-50 ml-1 w-56 rounded-xl border border-slate-200 bg-white py-2 shadow-float transition visibility-none group-hover/flyout:visible">
                      <p className="px-4 pb-2 text-[10px] font-bold uppercase tracking-wider text-muted">
                        {label}
                      </p>
                      <ul>
                        {children.map((child) => (
                          <li key={child.slug}>
                            <Link
                              href={`/category/${child.slug}`}
                              className="block px-4 py-2 text-xs font-medium text-ink transition hover:bg-brand-50 hover:text-brand-700"
                            >
                              {child.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </aside>
      )}

      {/* Carousel */}
      <div
        className="relative min-h-[340px] overflow-hidden rounded-2xl bg-[#f6efe6] shadow-card"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        <div key={index} className="animate-slide-in h-full">
          {slide.image ? (
            <div className="absolute inset-0">
              <Image
                src={slide.image}
                alt={slide.headline || "Promo banner"}
                fill
                sizes="100vw"
                className="object-cover"
                priority={index === 0}
              />
            </div>
          ) : (
            <div className="grid h-full grid-cols-[1.1fr_1fr] items-center gap-2 p-10">
              <div>
                <p className="mb-4 inline-block rounded border border-slate-200 bg-white px-2 py-1 text-[10px] font-bold text-ink">
                  {slide.seller}
                </p>
                <h2 className="break-words text-[clamp(17px,4.7vw,36px)] font-extrabold uppercase leading-tight tracking-tight text-brand-900 sm:text-4xl">
                  {slide.headline}
                </h2>
                <p className="mt-1 text-xs font-medium uppercase tracking-wide text-muted">{slide.sub}</p>

                <div className="mt-5 flex flex-wrap items-center gap-2">
                  <span className="text-xs text-muted">
                    MRP <s className="text-sm font-semibold">{taka(slide.mrp)}</s>
                  </span>
                  <span className="rounded-md bg-brand-800 px-4 py-2 text-white">
                    <span className="block text-[10px] leading-none opacity-80">Offer Price</span>
                    <span className="text-2xl font-extrabold leading-tight">{taka(slide.price)}</span>
                  </span>
                </div>

                <ul className="mt-5 flex flex-wrap gap-1 text-[11px] font-bold text-brand-800">
                  {slide.perks.map((p, i) => (
                    <li key={p} className="flex items-center gap-0.5 rounded-full bg-white/70 px-3 py-1.5">
                      {i === 0 && <Truck aria-hidden className="size-3.5" />}
                      {p}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Product art */}
              <div className="relative flex h-full min-h-[220px] items-center justify-center">
                <div className="grid aspect-square w-full max-w-52 place-items-center rounded-3xl bg-gradient-to-br from-zinc-700 to-zinc-900 text-center text-xs font-semibold text-white shadow-float">
                  {slide.product}
                </div>
              </div>
            </div>
          )}
        </div>

        <button onClick={() => go(-1)} aria-label="Previous slide" className="absolute left-2 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-full bg-white/90 shadow-card hover:bg-white sm:left-3">
          <ChevronLeft className="size-4" />
        </button>
        <button onClick={() => go(1)} aria-label="Next slide" className="absolute right-2 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-full bg-white/90 shadow-card hover:bg-white sm:right-3">
          <ChevronRight className="size-4" />
        </button>

        <div className="absolute inset-x-0 bottom-3 flex justify-center gap-0.5">
          {list.map((_, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              aria-label={`Go to slide ${i + 1}`}
              aria-current={i === index}
              className={`h-1.5 rounded-full transition-all ${i === index ? "w-5 bg-brand-700" : "w-1.5 bg-brand-700/30"}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
