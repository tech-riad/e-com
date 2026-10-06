import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { taka } from "@/lib/data";

export const metadata: Metadata = { title: "Order confirmed — Pickenby" };

type Props = { searchParams?: Promise<{ ref?: string; total?: string }> };

export default function OrderConfirmationPage({ searchParams }: Props) {
  return (
    <main className="pb-16">
      <div className="container-page">
        {/* Resolve searchParams so we can show the reference + total */}
        <ConfirmationInner searchParams={searchParams} />
      </div>
    </main>
  );
}

async function ConfirmationInner({ searchParams }: { searchParams?: Promise<{ ref?: string; total?: string }> }) {
  const { ref, total } = (await searchParams) ?? {};
  const totalNum = parseInt(total ?? "0", 10);

  return (
    <div className="mx-auto mt-10 max-w-md rounded-2xl bg-white p-10 text-center shadow-card">
      <span className="mx-auto grid size-14 place-items-center rounded-full bg-emerald-100 text-emerald-600">
        <CheckCircle2 className="size-7" />
      </span>
      <h1 className="mt-4 text-xl font-extrabold tracking-tight">Order placed!</h1>
      <p className="mt-1 text-xs text-muted">
        Thank you for shopping with Pickenby. We&apos;ll contact you shortly to confirm your order.
      </p>

      <dl className="mt-6 space-y-2 rounded-xl bg-lavender/60 p-4 text-left text-xs text-muted">
        <div className="flex justify-between">
          <dt>Order reference</dt>
          <dd className="max-w-[180px] truncate font-mono font-semibold text-ink">{ref || "—"}</dd>
        </div>
        <div className="flex justify-between">
          <dt>Total</dt>
          <dd className="font-bold text-brand-800">{taka(totalNum)}</dd>
        </div>
      </dl>

      <div className="mt-6 flex gap-1">
        <Link
          href="/products"
          className="flex-1 rounded-xl bg-brand-700 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-brand-800"
        >
          Continue shopping
        </Link>
        <Link
          href="/"
          className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold transition hover:border-brand-500"
        >
          Back home
        </Link>
      </div>
    </div>
  );
}