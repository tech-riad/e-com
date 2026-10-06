"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { GoogleButton } from "./GoogleButton";

const inputCls =
  "w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm placeholder:text-muted/70 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20";

export function AuthLoginForm() {
  const { login, loginWithGoogle, user, loading } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<"email" | "google" | null>(null);

  if (!loading && user) {
    router.replace("/account");
    return null;
  }

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy("email");
    setError(null);
    const res = await login(email.trim(), password);
    setBusy(null);
    if (!res.ok) setError(res.error ?? "Something went wrong.");
    else router.replace("/account");
  };

  const onGoogle = async () => {
    setBusy("google");
    setError(null);
    const res = await loginWithGoogle();
    setBusy(null);
    if (!res.ok) setError(res.error ?? "Something went wrong.");
    else router.replace("/account");
  };

  return (
    <div className="rounded-2xl bg-white p-6 shadow-card sm:p-8">
      <h1 className="text-xl font-extrabold tracking-tight">Sign in</h1>
      <p className="mt-1 text-xs text-muted">Welcome back to Pickenby.</p>

      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <div>
          <label htmlFor="login-email" className="mb-1 block text-[11px] font-semibold text-muted">
            Email *
          </label>
          <input
            id="login-email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputCls}
            placeholder="you@example.com"
          />
        </div>
        <div>
          <label htmlFor="login-password" className="mb-1 block text-[11px] font-semibold text-muted">
            Password *
          </label>
          <input
            id="login-password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputCls}
            placeholder="••••••••"
          />
        </div>

        {error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-600">{error}</p>
        )}

        <button
          type="submit"
          disabled={busy !== null}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-700 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-brand-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {busy === "email" && <Loader2 className="size-4 animate-spin" />}
          Sign in
        </button>
      </form>

      <div className="my-4 flex items-center gap-3 text-[11px] text-muted">
        <span className="h-px flex-1 bg-slate-200" />
        or
        <span className="h-px flex-1 bg-slate-200" />
      </div>

      <GoogleButton onClick={onGoogle} busy={busy === "google"} />

      <div className="mt-6 flex flex-col gap-1 text-center text-xs text-muted">
        <span>
          New here?{" "}
          <Link href="/register" className="font-semibold text-brand-700 hover:underline">
            Create an account
          </Link>
        </span>
        <Link href="/forgot-password" className="font-semibold text-brand-700 hover:underline">
          Forgot your password?
        </Link>
      </div>
    </div>
  );
}