"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { useCart } from "@/lib/cart";
import { taka } from "@/lib/data";

const DIVISIONS = [
  "Dhaka",
  "Chattogram",
  "Rajshahi",
  "Khulna",
  "Barishal",
  "Sylhet",
  "Rangpur",
  "Mymensingh",
];

const PAYMENT_METHODS = ["Cash on Delivery", "bKash", "Nagad", "Card"];

type FormState = {
  customerName: string;
  phone: string;
  address: string;
  city: string;
  division: string;
  paymentMethod: string;
  note: string;
};

const initial: FormState = {
  customerName: "",
  phone: "",
  address: "",
  city: "",
  division: "Dhaka",
  paymentMethod: "Cash on Delivery",
  note: "",
};

export function CheckoutForm() {
  const { items, subtotal, clear } = useCart();
  const router = useRouter();
  const [form, setForm] = useState<FormState>(initial);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const itemsPayload = useMemo(
    () =>
      items.map((i) => ({
        slug: i.slug ?? i.id,
        title: i.title,
        price: i.price,
        qty: i.qty,
      })),
    [items]
  );

  const set = (key: keyof FormState, value: string) =>
    setForm((f) => ({ ...f, [key]: value }));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: form.customerName.trim(),
          phone: form.phone.trim(),
          address: form.address.trim(),
          city: form.city.trim(),
          division: form.division,
          paymentMethod: form.paymentMethod,
          note: form.note.trim(),
          items: itemsPayload,
          total: subtotal,
        }),
      });

      if (!res.ok) {
        const json = (await res.json().catch(() => null)) as { error?: string } | null;
        setError(json?.error ?? "Something went wrong. Please try again.");
        setSubmitting(false);
        return;
      }

      const json = (await res.json()) as { data?: { documentId?: string; total?: number } };
      const ref = json?.data?.documentId ?? "";
      clear();
      router.push(`/order-confirmation?ref=${encodeURIComponent(ref)}&total=${subtotal}`);
    } catch {
      setError("Unable to reach the server. Please try again.");
      setSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="rounded-2xl bg-white p-10 text-center shadow-card">
        <p className="text-sm font-semibold text-ink">Your cart is empty.</p>
        <Link
          href="/products"
          className="mt-3 inline-block text-xs font-semibold text-brand-700 hover:underline"
        >
          Browse products
        </Link>
      </div>
    );
  }

  const inputCls =
    "w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm placeholder:text-muted/70 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20";

  return (
    <form onSubmit={onSubmit} className="grid gap-3 lg:grid-cols-[1fr_320px]">
      <div className="space-y-4 rounded-2xl bg-white p-5 shadow-card">
        <h2 className="text-sm font-extrabold tracking-tight">Delivery details</h2>

        <div>
          <label htmlFor="name" className="mb-1 block text-[11px] font-semibold text-muted">
            Full name *
          </label>
          <input
            id="name"
            value={form.customerName}
            onChange={(e) => set("customerName", e.target.value)}
            required
            className={inputCls}
            placeholder="Your full name"
          />
        </div>

        <div>
          <label htmlFor="phone" className="mb-1 block text-[11px] font-semibold text-muted">
            Phone number *
          </label>
          <input
            id="phone"
            value={form.phone}
            onChange={(e) => set("phone", e.target.value)}
            required
            inputMode="tel"
            className={inputCls}
            placeholder="01XXXXXXXXX"
          />
        </div>

        <div>
          <label htmlFor="address" className="mb-1 block text-[11px] font-semibold text-muted">
            Address *
          </label>
          <textarea
            id="address"
            value={form.address}
            onChange={(e) => set("address", e.target.value)}
            required
            rows={3}
            className={inputCls}
            placeholder="House, road, area"
          />
        </div>

        <div className="grid gap-2 sm:grid-cols-2">
          <div>
            <label htmlFor="city" className="mb-1 block text-[11px] font-semibold text-muted">
              City / Town
            </label>
            <input
              id="city"
              value={form.city}
              onChange={(e) => set("city", e.target.value)}
              className={inputCls}
            />
          </div>
          <div>
            <label htmlFor="division" className="mb-1 block text-[11px] font-semibold text-muted">
              Division
            </label>
            <select
              id="division"
              value={form.division}
              onChange={(e) => set("division", e.target.value)}
              className={inputCls}
            >
              {DIVISIONS.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="note" className="mb-1 block text-[11px] font-semibold text-muted">
            Order note (optional)
          </label>
          <textarea
            id="note"
            value={form.note}
            onChange={(e) => set("note", e.target.value)}
            rows={2}
            className={inputCls}
          />
        </div>
      </div>

      <div className="space-y-4">
        <div className="rounded-2xl bg-white p-5 shadow-card">
          <h2 className="text-sm font-extrabold tracking-tight">Payment method</h2>
          <div className="mt-3 space-y-2">
            {PAYMENT_METHODS.map((m) => (
              <label
                key={m}
                className="flex cursor-pointer items-center gap-1 rounded-lg border border-slate-200 px-3 py-2.5 text-sm hover:border-brand-500"
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value={m}
                  checked={form.paymentMethod === m}
                  onChange={() => set("paymentMethod", m)}
                  className="accent-brand-700"
                />
                {m}
              </label>
            ))}
          </div>
        </div>

        <aside className="h-fit rounded-2xl bg-white p-5 shadow-card">
          <h2 className="text-sm font-extrabold tracking-tight">Order Summary</h2>
          <dl className="mt-4 space-y-2 text-xs text-muted">
            <div className="flex justify-between">
              <dt>Items ({items.reduce((s, i) => s + i.qty, 0)})</dt>
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

          {error && (
            <p className="mt-3 rounded-lg bg-sale/10 px-3 py-2 text-[11px] font-semibold text-sale">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="mt-5 flex w-full items-center justify-center gap-1 rounded-xl bg-brand-700 py-3 text-sm font-bold text-white transition hover:bg-brand-800 disabled:opacity-60"
          >
            {submitting && <Loader2 className="size-4 animate-spin" />}
            {submitting ? "Placing order…" : "Place order"}
          </button>
        </aside>
      </div>
    </form>
  );
}