"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { CheckCircle2, Loader2 } from "lucide-react";
import { useAuth } from "@/lib/auth";

const inputCls =
  "w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm placeholder:text-muted/70 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20";

export function ForgotPasswordForm() {
  const { sendPasswordReset } = useAuth();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const res = await sendPasswordReset(email.trim());
    setBusy(false);
    if (!res.ok) setError(res.error ?? "Something went wrong.");
    else setSent(true);
  };

  return (
    <div className="rounded-2xl bg-white p-6 shadow-card sm:p-8">
      <h1 className="text-xl font-extrabold tracking-tight">Reset your password</h1>
      <p className="mt-1 text-xs text-muted">
        Enter your email and we&apos;ll send you a password reset link.
      </p>

      {sent ? (
        <div className="mt-6">
          <span className="mx-auto grid size-12 place-items-center rounded-full bg-emerald-100 text-emerald-600">
            <CheckCircle2 className="size-6" />
          </span>
          <p className="mt-3 text-center text-sm font-medium text-ink">
            Reset link sent to <span className="font-bold">{email}</span>.
          </p>
          <p className="mt-1 text-center text-xs text-muted">
            Check your inbox (and spam) and follow the link to set a new password.
          </p>
          <Link
            href="/login"
            className="mt-5 block text-center text-xs font-semibold text-brand-700 hover:underline"
          >
            Back to sign in
          </Link>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div>
            <label htmlFor="forgot-email" className="mb-1 block text-[11px] font-semibold text-muted">
              Email *
            </label>
            <input
              id="forgot-email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputCls}
              placeholder="you@example.com"
            />
          </div>

          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-600">{error}</p>
          )}

          <button
            type="submit"
            disabled={busy}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-700 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-brand-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {busy && <Loader2 className="size-4 animate-spin" />}
            Send reset link
          </button>
        </form>
      )}

      <p className="mt-6 text-center text-xs text-muted">
        Remembered it?{" "}
        <Link href="/login" className="font-semibold text-brand-700 hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}