"use client";

import Link from "next/link";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { useCart } from "@/lib/cart";
import { taka } from "@/lib/data";
import { ProductImage } from "@/components/ProductImage";

export default function CartPage() {
  const { items, subtotal, setQty, removeItem, clear } = useCart();

  if (items.length === 0) {
    return (
      <main className="pb-16">
        <div className="container-page">
          <div className="mx-auto mt-10 max-w-md rounded-2xl bg-white p-10 text-center shadow-card">
            <span className="mx-auto grid size-14 place-items-center rounded-full bg-lavender text-muted">
              <ShoppingBag className="size-6" />
            </span>
            <h1 className="mt-4 text-xl font-extrabold tracking-tight">Your cart is empty</h1>
            <p className="mt-1 text-xs text-muted">Browse our catalog and add items you love.</p>
            <Link
              href="/products"
              className="mt-5 inline-block rounded-xl bg-brand-700 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-brand-800"
            >
              Start shopping
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="pb-16">
      <div className="container-page">
        <h1 className="py-6 text-2xl font-extrabold tracking-tight">Shopping Cart</h1>

        <div className="grid gap-3 lg:grid-cols-[1fr_320px]">
          <ul className="space-y-3">
            {items.map((item) => (
              <li
                key={item.id}
                className="flex gap-2 rounded-2xl bg-white p-3 shadow-card"
              >
                <Link
                  href={`/products/${item.slug ?? item.id}`}
                  className="shrink-0"
                >
                  <ProductImage
                    src={item.image}
                    alt={item.title}
                    className="aspect-square w-24 rounded-lg bg-lavender"
                  />
                </Link>

                <div className="flex min-w-0 flex-1 flex-col">
                  <div className="flex items-start justify-between gap-1">
                    <div className="min-w-0">
                      {item.brand && (
                        <p className="text-[9px] font-semibold uppercase tracking-wide text-muted">
                          {item.brand}
                        </p>
                      )}
                      <Link
                        href={`/products/${item.slug ?? item.id}`}
                        className="mt-0.5 line-clamp-2 text-xs font-bold leading-snug hover:underline"
                      >
                        {item.title}
                      </Link>
                    </div>
                    <button
                      onClick={() => removeItem(item.id)}
                      aria-label={`Remove ${item.title}`}
                      className="grid size-7 shrink-0 place-items-center rounded-full text-muted transition hover:bg-slate-100 hover:text-sale"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>

                  <div className="mt-auto flex items-center justify-between pt-3">
                    <div className="flex items-center gap-0.5 rounded-lg border border-slate-200 p-1">
                      <button
                        onClick={() => setQty(item.id, item.qty - 1)}
                        aria-label="Decrease quantity"
                        className="grid size-6 place-items-center rounded text-muted hover:bg-slate-100"
                      >
                        <Minus className="size-3" />
                      </button>
                      <span className="w-6 text-center text-xs font-bold">{item.qty}</span>
                      <button
                        onClick={() => setQty(item.id, item.qty + 1)}
                        aria-label="Increase quantity"
                        className="grid size-6 place-items-center rounded text-muted hover:bg-slate-100"
                      >
                        <Plus className="size-3" />
                      </button>
                    </div>
                    <div className="text-right">
                      <span className="block text-sm font-extrabold text-brand-800">
                        {taka(item.price * item.qty)}
                      </span>
                      {item.mrp > item.price && (
                        <s className="text-[10px] text-muted">{taka(item.mrp * item.qty)}</s>
                      )}
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          <aside className="h-fit rounded-2xl bg-white p-5 shadow-card">
            <h2 className="text-sm font-extrabold tracking-tight">Order Summary</h2>
            <dl className="mt-4 space-y-2 text-xs text-muted">
              <div className="flex justify-between">
                <dt>Subtotal</dt>
                <dd className="font-semibold text-ink">{taka(subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt>Delivery</dt>
                <dd className="font-semibold text-ink">Free</dd>
              </div>
            </dl>
            <div className="mt-4 flex justify-between border-t border-slate-100 pt-3 text-sm">
              <span className="font-bold">Total</span>
              <span className="font-extrabold text-brand-800">{taka(subtotal)}</span>
            </div>
            <Link
              href="/checkout"
              className="mt-5 block w-full rounded-xl bg-brand-700 py-3 text-center text-sm font-bold text-white transition hover:bg-brand-800"
            >
              Proceed to Checkout
            </Link>
            <button
              onClick={clear}
              className="mt-2 w-full rounded-xl py-2 text-xs font-semibold text-muted transition hover:text-sale"
            >
              Clear cart
            </button>
          </aside>
        </div>
      </div>
    </main>
  );
}