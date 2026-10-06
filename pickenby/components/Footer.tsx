import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import { payments } from "@/lib/data";
import type { SiteSetting } from "@/lib/cms";

const lists: { title: string; items: { label: string; href: string }[] }[] = [
  {
    title: "Shop",
    items: [
      { label: "All Products", href: "/products" },
      { label: "New Arrivals", href: "/products?sort=newest" },
      { label: "Top Picks", href: "/products" },
      { label: "Search", href: "/search" },
    ],
  },
  {
    title: "Help",
    items: [
      { label: "Payment", href: "#" },
      { label: "Shipping", href: "#" },
      { label: "Returns & Replacement", href: "#" },
      { label: "Contact", href: "#" },
    ],
  },
];

const socialLabels = ["f", "in", "li", "X", "▶"];

export function Footer({ settings }: { settings?: SiteSetting }) {
  const siteName = settings?.siteName || "pickenby";
  const tagline = settings?.tagline || "Electronics & home appliances in Bangladesh";
  const content = settings?.footerContent || tagline;
  const address = settings?.address || "Dhaka, Bangladesh";
  const phone = settings?.contactPhone || "09647274752";
  const email = settings?.contactEmail || "support@pickenby.com";
  const socials =
    settings?.socials && settings.socials.length > 0
      ? settings.socials.map((s) => ({
          label: s.icon || s.label || socialLabels[0],
          url: s.url || "#",
        }))
      : socialLabels.map((s) => ({ label: s, url: "#" }));

  return (
    <footer className="mt-12">
      <div className="bg-footer text-white">
        <div className="container-page grid gap-6 py-12 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <p className="text-2xl font-bold tracking-tight">{siteName}</p>
            <p className="mt-4 text-sm">{content}</p>
            <ul className="mt-5 space-y-3 text-xs text-white/85">
              <li className="flex gap-1.5"><MapPin aria-hidden className="mt-0.5 size-4 shrink-0" />{address}</li>
              <li className="flex gap-1.5"><Phone aria-hidden className="size-4 shrink-0" />{phone}</li>
              <li className="flex gap-1.5"><Mail aria-hidden className="size-4 shrink-0" />{email}</li>
            </ul>
            <ul className="mt-6 flex gap-1">
              {socials.map((s) => (
                <li key={`${s.label}-${s.url}`}>
                  <a href={s.url} aria-label={`Social link ${s.label}`} className="grid size-7 place-items-center rounded-full bg-white text-[10px] font-extrabold text-footer transition hover:bg-brand-100">{s.label}</a>
                </li>
              ))}
            </ul>
          </div>

          {lists.map((l) => (
            <div key={l.title}>
              <h3 className="text-sm font-bold">{l.title}</h3>
              <ul className="mt-4 space-y-3 text-xs text-white/85">
                {l.items.map((i) => (
                  <li key={i.label}>
                    <Link href={i.href} className="transition hover:text-white hover:underline">{i.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div>
            <h3 className="text-sm font-bold text-white">We accept</h3>
            <ul className="mt-4 grid grid-cols-3 gap-1">
              {payments.map((p) => (
                <li key={p} className="grid h-8 place-items-center rounded bg-white px-1 text-[9px] font-bold text-slate-600">{p}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}