"use client";

import { useState } from "react";
import { Check, ShoppingBag } from "lucide-react";
import { useCart } from "@/lib/cart";
import type { Product } from "@/lib/data";

export function AddToCartButton({
  product,
  className = "",
}: {
  product: Product;
  className?: string;
}) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  const onClick = () => {
    addItem(product);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1500);
  };

  return (
    <button
      onClick={onClick}
      disabled={product.outOfStock}
      className={
        className ||
        "flex w-full items-center justify-center gap-1 rounded-xl bg-brand-700 py-3 text-sm font-bold text-white transition hover:bg-brand-800 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
      }
    >
      {added ? (
        <>
          <Check className="size-4" /> Added to cart
        </>
      ) : product.outOfStock ? (
        "Out of Stock"
      ) : (
        <>
          <ShoppingBag className="size-4" /> Add to Cart
        </>
      )}
    </button>
  );
}