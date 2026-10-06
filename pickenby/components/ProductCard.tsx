import Link from "next/link";
import { Tag, Truck, Trophy, Sparkles } from "lucide-react";
import { Product, taka } from "@/lib/data";
import { productUrl } from "@/lib/cms";
import { ProductImage } from "./ProductImage";

/** Compact "sold count" card used in Top Selling Products */
export function SoldCard({ p }: { p: Product }) {
  return (
    <Link href={productUrl(p)} className="group block">
      <div className="relative">
        <span className="absolute left-0 top-2 z-10 flex items-center gap-0.5 rounded-r bg-sold px-2 py-0.5 text-[10px] font-bold text-white shadow">
          <Tag aria-hidden className="size-2.5" /> ৳ {p.sold?.toLocaleString("en-IN")}
        </span>
        <ProductImage src={p.image} alt={p.title} className="aspect-[4/5] rounded-lg bg-tile transition group-hover:bg-lavender" />
      </div>
      <p className="mt-3 text-[11px] text-muted">{p.seller}</p>
      <h3 className="mt-0.5 line-clamp-2 text-xs font-bold leading-snug">{p.title}</h3>
      {p.outOfStock ? (
        <p className="mt-2 text-xs font-medium text-muted">Out of Stock</p>
      ) : (
        <p className="mt-2 flex items-baseline gap-1">
          <span className="text-sm font-bold text-sale">{taka(p.price)}</span>
          <s className="text-[11px] text-muted">{taka(p.mrp)}</s>
        </p>
      )}
    </Link>
  );
}

const badgeIcon = { Bestseller: Trophy, "Free delivery": Truck, New: Sparkles } as const;
const badgeTone = {
  Bestseller: "bg-orange-50 text-orange-700 border-orange-200",
  "Free delivery": "bg-teal-50 text-teal-700 border-teal-200",
  New: "bg-indigo-50 text-indigo-700 border-indigo-200",
} as const;

/** Rich card with badges, discount pill and price band — used in rails */
export function DealCard({ p, className = "" }: { p: Product; className?: string }) {
  return (
    <Link
      href={productUrl(p)}
      className={`group flex flex-col overflow-hidden rounded-xl bg-white p-2 shadow-card transition hover:shadow-float ${className}`}
    >
      <div className="relative">
        {p.badges?.[0] && (() => {
          const b = p.badges![0];
          const Icon = badgeIcon[b];
          return (
            <span className={`absolute left-1.5 top-1.5 z-10 flex items-center gap-0.5 rounded-full border px-2 py-0.5 text-[9px] font-semibold ${badgeTone[b]}`}>
              <Icon aria-hidden className="size-2.5" /> {b}
            </span>
          );
        })()}
        {p.discount ? (
          <span className="absolute right-1.5 top-1.5 z-10 rounded-md bg-gold px-1.5 py-0.5 text-[9px] font-bold text-white">
            −{p.discount}%
          </span>
        ) : null}
        <ProductImage src={p.image} alt={p.title} className="aspect-square rounded-lg bg-lavender" />
      </div>

      <div className="flex-1 px-1.5 pb-2 pt-3">
        <p className="text-[9px] font-semibold uppercase tracking-wide text-muted">{p.brand}</p>
        <h3 className="mt-1 line-clamp-2 text-xs font-bold leading-snug">{p.title}</h3>
      </div>

      <div className="rounded-lg bg-lavender/60 px-2.5 py-2">
        <p className="flex items-baseline gap-1">
          <span className="text-sm font-extrabold text-brand-800">{taka(p.price)}</span>
          <s className="text-[10px] text-muted">{taka(p.mrp)}</s>
        </p>
        {p.emi && (
          <span className="mt-1 inline-block rounded bg-emerald-100 px-1.5 py-0.5 text-[9px] font-bold text-emerald-700">
            0% EMI
          </span>
        )}
      </div>
    </Link>
  );
}
