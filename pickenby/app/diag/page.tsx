"use client";

import { useEffect, useState } from "react";

export default function DiagPage() {
  const [out, setOut] = useState("measuring...");

  useEffect(() => {
    const vw = window.innerWidth;
    const doc = document.documentElement;
    const overflowing: string[] = [];
    document.querySelectorAll<HTMLElement>("body *").forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.width === 0) return;
      if (r.right > vw + 1 || r.left < -1) {
        const scrollParent = (() => {
          let p: HTMLElement | null = el.parentElement;
          while (p) {
            const ox = getComputedStyle(p).overflowX;
            if (ox === "auto" || ox === "scroll" || ox === "hidden") return p.tagName + "." + p.className.slice(0, 40);
            p = p.parentElement;
          }
          return null;
        })();
        if (!scrollParent) {
          overflowing.push(
            `${el.tagName}.${String(el.className).slice(0, 60)} L=${Math.round(r.left)} R=${Math.round(r.right)}`
          );
        }
      }
    });

    const clip: string[] = [];
    document.querySelectorAll<HTMLElement>("section, div, ul, li").forEach((el) => {
      if (el.scrollHeight > el.clientHeight + 2) {
        const cs = getComputedStyle(el);
        if (cs.overflowY === "hidden" || cs.overflow === "hidden") {
          const r = el.getBoundingClientRect();
          if (r.width > 150 && r.height > 60) {
            clip.push(
              `${el.tagName}.${String(el.className).slice(0, 70)} client=${el.clientHeight} scroll=${el.scrollHeight}`
            );
          }
        }
      }
    });

    const hero = document.querySelector<HTMLElement>('section[aria-label="Featured offers"]');
    const heroInfo = hero
      ? (() => {
          const card = hero.querySelector<HTMLElement>("div.relative.overflow-hidden");
          const inner = card?.firstElementChild as HTMLElement | null;
          return JSON.stringify({
            sectionH: Math.round(hero.getBoundingClientRect().height),
            cardH: card ? Math.round(card.getBoundingClientRect().height) : null,
            cardScrollH: card ? card.scrollHeight : null,
            innerH: inner ? Math.round(inner.getBoundingClientRect().height) : null,
            innerScrollH: inner ? inner.scrollHeight : null,
          });
        })()
      : "none";

    setOut(
      JSON.stringify(
        { vw, scrollWidth: doc.scrollWidth, bodyScrollWidth: document.body.scrollWidth, hero: heroInfo, overflowing, clip },
        null,
        1
      )
    );
  }, []);

  return <pre style={{ fontSize: 12, padding: 12, whiteSpace: "pre-wrap" }}>{out}</pre>;
}
