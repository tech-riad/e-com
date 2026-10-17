"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Zap } from "lucide-react";
import { useCart } from "@/lib/cart";
import type { Product, ProductColor } from "@/lib/data";
import { trackMetaAddToCart } from "@/components/MetaPixel";

export function BuyNowButton({
  product,
  color,
  onMissingColor,
  className = "",
}: {
  product: Product;
  color?: ProductColor;
  onMissingColor?: () => void;
  className?: string;
}) {
  const { addItem } = useCart();
  const router = useRouter();
  const [redirecting, setRedirecting] = useState(false);

  const onClick = () => {
    if (product.colors?.length && !color) {
      onMissingColor?.();
      return;
    }
    addItem(product, color);
    trackMetaAddToCart(product.slug ?? product.id, product.price);
    setRedirecting(true);
    router.push("/checkout");
  };

  return (
    <button
      onClick={onClick}
      disabled={product.outOfStock || redirecting}
      className={
        className ||
        "flex w-full items-center justify-center gap-1 rounded-xl bg-amber-700 py-2 text-sm font-bold text-white transition hover:bg-amber-800 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
      }
    >
      <Zap className="size-4" />
      {redirecting ? "Redirecting…" : "Buy Now"}
    </button>
  );
}
