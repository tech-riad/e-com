import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { Product } from "@/lib/data";
import { DealCard } from "./ProductCard";

type Props = {
  eyebrow: string;
  title: string;
  icon: LucideIcon;
  products: Product[];
  /** "grid" wraps into 5 columns with a "see all" tile, "row" is a single horizontal scroller */
  layout?: "grid" | "row";
  moreLabel?: string;
  moreTitle?: string;
  moreText?: string;
  moreHref?: string;
};

export function ProductRail({
  eyebrow, title, icon: Icon, products, layout = "grid",
  moreLabel, moreTitle, moreText, moreHref = "/products",
}: Props) {
  const showMore = layout === "grid" && moreTitle;

  return (
    <section aria-label={title} className="py-8">
      <div className="container-page">
        <div className="mb-5 flex items-center gap-1.5">
          <span className="grid size-9 place-items-center rounded-full bg-gold-soft text-gold">
            <Icon aria-hidden className="size-4" />
          </span>
          <div>
            <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-gold">{eyebrow}</p>
            <h2 className="text-lg font-extrabold tracking-tight">{title}</h2>
          </div>
        </div>

        {layout === "grid" ? (
          <ul className="grid grid-cols-2 gap-1.5 sm:grid-cols-3 lg:grid-cols-5">
            {products.map((p) => (
              <li key={p.id} className="flex"><DealCard p={p} className="w-full" /></li>
            ))}
            {showMore && (
              <li className="flex">
                <Link href={moreHref} className="flex w-full flex-col rounded-xl bg-white p-5 shadow-card transition hover:shadow-float">
                  <span className="grid size-9 place-items-center rounded-full bg-gold-soft text-gold">
                    <Icon aria-hidden className="size-4" />
                  </span>
                  <span className="mt-4 text-[9px] font-bold uppercase tracking-widest text-muted">{moreLabel}</span>
                  <span className="mt-1 text-sm font-extrabold">{moreTitle}</span>
                  <span className="mt-2 text-[11px] leading-relaxed text-muted">{moreText}</span>
                  <span className="mt-auto flex items-center gap-0.5 pt-6 text-xs font-bold text-brand-700">
                    View all <ArrowRight aria-hidden className="size-3.5" />
                  </span>
                </Link>
              </li>
            )}
          </ul>
        ) : (
          <ul className="scrollbar-none -mx-4 flex snap-x gap-1.5 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0">
            {products.map((p) => (
              <li key={p.id} className="flex w-[46%] shrink-0 snap-start sm:w-[calc(20%-10px)]">
                <DealCard p={p} className="w-full" />
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
