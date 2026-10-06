"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { promoBanners } from "@/lib/data";

type BannerItem = { brand: string; text: string; tone: string; image?: string };

const AUTO_MS = 4000;
const HOLD_MS = 6000;

export function PromoBanners({ items }: { items?: BannerItem[] }) {
  const list: BannerItem[] = items && items.length > 0 ? items : promoBanners;
  const ref = useRef<HTMLUListElement>(null);
  const [active, setActive] = useState(0);
  const [hold, setHold] = useState(false);
  const [visible, setVisible] = useState(true);
  const holdTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // step = one banner + gap (gap-2 = 8px); max = furthest scrollable offset
  const measure = () => {
    const el = ref.current;
    const child = el?.children[0] as HTMLElement | undefined;
    if (!el || !child) return null;
    return { el, step: child.offsetWidth + 8, max: Math.max(0, el.scrollWidth - el.clientWidth) };
  };

  const sync = useCallback(() => {
    const m = measure();
    if (!m) return;
    setActive(Math.min(list.length - 1, Math.max(0, Math.round(m.el.scrollLeft / m.step))));
  }, [list.length]);

  useEffect(() => {
    sync();
    window.addEventListener("resize", sync);
    return () => window.removeEventListener("resize", sync);
  }, [sync]);

  // pause while the strip is off-screen
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold: 0.25 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // manual interaction -> hold autoplay for a while
  const holdFor = (ms = HOLD_MS) => {
    setHold(true);
    if (holdTimer.current) clearTimeout(holdTimer.current);
    holdTimer.current = setTimeout(() => setHold(false), ms);
  };

  useEffect(() => {
    return () => {
      if (holdTimer.current) clearTimeout(holdTimer.current);
    };
  }, []);

  // autoplay: one banner per tick, wrap back to start at the end
  useEffect(() => {
    if (hold || !visible) return;
    const id = setInterval(() => {
      if (document.hidden) return;
      const m = measure();
      if (!m || m.max <= 4 || !list.length) return;
      const next = m.el.scrollLeft + m.step;
      m.el.scrollTo({ left: next > m.max ? 0 : next, behavior: "smooth" });
    }, AUTO_MS);
    return () => clearInterval(id);
  }, [hold, visible, list.length]);

  const scrollTo = (i: number) => {
    const el = ref.current;
    const child = el?.children[i] as HTMLElement | undefined;
    if (!el || !child) return;
    holdFor();
    el.scrollTo({ left: Math.min(child.offsetLeft, el.scrollWidth - el.clientWidth), behavior: "smooth" });
  };

  return (
    <section aria-label="Brand promotions" className="py-8">
      <div className="container-page">
        <ul
          ref={ref}
          onScroll={sync}
          onTouchStart={() => holdFor()}
          onPointerDown={() => holdFor()}
          className="scrollbar-none flex snap-x snap-mandatory gap-2 overflow-x-auto pb-4"
        >
          {list.map((b) => (
            <li key={b.brand} className="w-[calc(50%-4px)] shrink-0 snap-start sm:w-[calc(33.333%-11px)]">
              <a href="#" className={`relative flex h-40 flex-col justify-between overflow-hidden rounded-xl p-5 shadow-card transition hover:-translate-y-0.5 ${b.tone}`}>
                {b.image && (
                  <Image
                    src={b.image}
                    alt={b.brand}
                    fill
                    sizes="(min-width:640px) 300px, 48vw"
                    className="object-cover opacity-30"
                  />
                )}
                <span className="relative text-2xl font-black tracking-tight">{b.brand}</span>
                <span className="relative text-sm font-bold">{b.text}</span>
              </a>
            </li>
          ))}
        </ul>
        <div className="mt-1 flex justify-center gap-0.5">
          {list.map((b, i) => (
            <button key={b.brand} onClick={() => scrollTo(i)} aria-label={`Show ${b.brand} banner`}
              className={`size-1.5 rounded-full ${i === active ? "bg-brand-600 ring-2 ring-brand-100" : "bg-brand-100"}`} />
          ))}
        </div>
      </div>
    </section>
  );
}
