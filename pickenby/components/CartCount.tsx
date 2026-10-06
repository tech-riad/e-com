"use client";

import { useCart } from "@/lib/cart";

export function CartCount() {
  const { count } = useCart();
  if (count === 0) return null;
  return (
    <span className="absolute -right-1.5 -top-1.5 grid size-4 place-items-center rounded-full bg-sale text-[9px] font-bold text-white">
      {count > 99 ? "99+" : count}
    </span>
  );
}