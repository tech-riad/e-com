"use client";

import Link from "next/link";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { categoryCircles } from "@/lib/data";

type CircleItem = { label: string; tone: string; slug?: string; image?: string };

const AUTO_MS = 3200;
const HOLD_MS = 6000;

export function CategoryCircles({ items }: { items?: CircleItem[] }) {
  const list: CircleItem[] = items && items.length > 0 ? items : categoryCircles;
  const ref = useRef<HTMLUListElement>(null);
  const [active, setActive] = useState(0);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);
  const [hover, setHover] = useState(false);
  const [hold, setHold] = useState(false);
  const [visible, setVisible] = useState(true);
  const holdTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const href = (c: CircleItem) => (c.slug ? `/category/${c.slug}` : "/search?q=" + encodeURIComponent(c.label));

  // step = one circle + gap (gap-2 = 8px); max = furthest scrollable offset
  const measure = () => {
    const el = ref.current;
    if (!el) return null;
    const child = el.children[0] as HTMLElement | undefined;
    if (!child) return null;
    return { el, step: child.offsetWidth + 8, max: Math.max(0, el.scrollWidth - el.clientWidth) };
  };

  const sync = useCallback(() => {
    const m = measure();
    if (!m) return;
    setAtStart(m.el.scrollLeft <= 4);
    setAtEnd(m.el.scrollLeft >= m.max - 4);
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

  // autoplay: one circle per tick, wrap back to start at the end
  useEffect(() => {
    if (hover || hold || !visible) return;
    const id = setInterval(() => {
      if (document.hidden) return;
      const el = ref.current;
      const child = el?.children[0] as HTMLElement | undefined;
      if (!el || !child || !list.length) return;
      const step = child.offsetWidth + 8;
      const max = Math.max(0, el.scrollWidth - el.clientWidth);
      if (max <= 4) return;
      const next = el.scrollLeft + step;
      el.scrollTo({ left: next > max ? 0 : next, behavior: "smooth" });
    }, AUTO_MS);
    return () => clearInterval(id);
  }, [hover, hold, visible, list.length]);

  const scrollByPage = (dir: 1 | -1) => {
    const m = measure();
    if (!m) return;
    holdFor();
    m.el.scrollBy({ left: dir * Math.max(0, m.el.clientWidth - 16), behavior: "smooth" });
  };

  const scrollTo = (i: number) => {
    const el = ref.current;
    const child = el?.children[i] as HTMLElement | undefined;
    if (!el || !child) return;
    holdFor();
    el.scrollTo({ left: Math.min(child.offsetLeft, el.scrollWidth - el.clientWidth), behavior: "smooth" });
  };

  const overflows = !(atStart && atEnd);

  return (
    <section
      aria-labelledby="cat-circle"
      className="bg-white/60 py-8"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <div className="container-page">
        <div className="mb-5 flex items-center justify-between gap-2">
          <h2 id="cat-circle" className="text-sm font-bold">
            Categories <span className="text-sale">Circle</span>
          </h2>

          {overflows && (
            <div className="hidden items-center gap-1 sm:flex">
              <button
                onClick={() => scrollByPage(-1)}
                disabled={atStart}
                aria-label="Previous categories"
                className="grid size-7 place-items-center rounded-full bg-white text-ink shadow-card transition hover:bg-brand-50 disabled:pointer-events-none disabled:opacity-40"
              >
                <ChevronLeft className="size-4" />
              </button>
              <button
                onClick={() => scrollByPage(1)}
                disabled={atEnd}
                aria-label="Next categories"
                className="grid size-7 place-items-center rounded-full bg-white text-ink shadow-card transition hover:bg-brand-50 disabled:pointer-events-none disabled:opacity-40"
              >
                <ChevronRight className="size-4" />
              </button>
            </div>
          )}
        </div>

        <ul
          ref={ref}
          onScroll={sync}
          onTouchStart={() => holdFor()}
          onPointerDown={() => holdFor()}
          onWheel={() => holdFor()}
          className="scrollbar-none -mx-4 flex snap-x snap-mandatory gap-2 overflow-x-auto px-4 pb-2 lg:justify-between lg:overflow-visible lg:px-0"
        >
          {list.map((c) => (
            <li key={c.label} className="w-[92px] shrink-0 snap-start text-center">
              <Link href={href(c)} className="group block">
                <span className="mx-auto grid size-[70px] place-items-center rounded-full border-2 border-brand-100 p-1 transition group-hover:border-brand-500">
                  {c.image ? (
                    <span className="size-full overflow-hidden rounded-full">
                      <Image
                        src={c.image}
                        alt={c.label}
                        width={70}
                        height={70}
                        className="size-full object-cover"
                      />
                    </span>
                  ) : (
                    <span className={`size-full rounded-full bg-gradient-to-br ${c.tone}`} />
                  )}
                </span>
                <span className="mt-2 line-clamp-1 block text-[10px] font-medium text-ink">{c.label}</span>
              </Link>
            </li>
          ))}
        </ul>

        {overflows && (
          <div className="mt-3 flex justify-center gap-1 lg:hidden">
            {list.map((c, i) => (
              <button
                key={c.label}
                onClick={() => scrollTo(i)}
                aria-label={`Show ${c.label}`}
                aria-current={i === active}
                className={`h-1.5 rounded-full transition-all ${i === active ? "w-4 bg-brand-600" : "w-1.5 bg-brand-200"}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}