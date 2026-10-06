import Link from "next/link";
import Image from "next/image";
import { trending } from "@/lib/data";

type TileData = { label: string; tone: string; slug?: string; image?: string };

function Tile({ label, tone, slug, image, size }: TileData & { size: "lg" | "sm" }) {
  return (
    <Link
      href={slug ? `/category/${slug}` : "/search?q=" + encodeURIComponent(label)}
      className={`group relative isolate flex items-end overflow-hidden rounded-2xl bg-gradient-to-br ${tone} ${
        size === "lg" ? "aspect-[16/10] p-5" : "aspect-[16/10] p-3"
      }`}
    >
      {image && (
        <Image
          src={image}
          alt={label}
          fill
          sizes="(min-width:768px) 50vw, 100vw"
          className="absolute inset-0 -z-20 object-cover"
        />
      )}
      <span aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-t from-black/55 via-black/5 to-transparent" />
      <span>
        <span className={`block font-extrabold text-white ${size === "lg" ? "text-xl" : "text-[11px] leading-tight"}`}>{label}</span>
        {size === "lg" && <span className="mt-1 block text-[10px] text-white/70">Explore collection</span>}
      </span>
    </Link>
  );
}

export function TrendingCategories({
  data,
}: {
  data?: { large: TileData[]; small: TileData[] };
}) {
  const d =
    data && (data.large.length > 0 || data.small.length > 0) ? data : trending;
  return (
    <section aria-labelledby="trending" className="py-10">
      <div className="container-page">
        <div className="mb-5 flex items-end justify-between">
          <div>
            <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-gold">What customers love this week</p>
            <h2 id="trending" className="mt-1 text-2xl font-extrabold tracking-tight">Trending categories</h2>
          </div>
          <a href="#" className="text-[11px] font-semibold text-muted hover:text-brand-700">View all</a>
        </div>

        <div className="grid gap-1.5 md:grid-cols-2">
          {d.large.map((t) => <Tile key={t.label} size="lg" {...t} />)}
        </div>
        <div className="mt-3 grid grid-cols-2 gap-1.5 md:grid-cols-4">
          {d.small.map((t) => <Tile key={t.label} size="sm" {...t} />)}
        </div>
      </div>
    </section>
  );
}