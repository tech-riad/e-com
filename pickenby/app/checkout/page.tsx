import type { Metadata } from "next";
import { CheckoutForm } from "@/components/CheckoutForm";

export const metadata: Metadata = { title: "Checkout — Pickenby" };

export default function CheckoutPage() {
  return (
    <main className="pb-16">
      <div className="container-page">
        <h1 className="py-6 text-2xl font-extrabold tracking-tight">Checkout</h1>
        <CheckoutForm />
      </div>
    </main>
  );
}