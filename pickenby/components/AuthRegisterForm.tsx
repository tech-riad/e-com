"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { GoogleButton } from "./GoogleButton";

const inputCls =
  "w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm placeholder:text-muted/70 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20";

export function AuthRegisterForm() {
  const { signUp, loginWithGoogle, user, loading } = useAuth();
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState<"email" | "google" | null>(null);

  if (!loading && user) {
    router.replace("/account");
    return null;
  }

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    setBusy("email");
    setError(null);
    setNotice(null);
    const res = await signUp(name.trim(), email.trim(), password);
    setBusy(null);
    if (!res.ok) setError(res.error ?? "Something went wrong.");
    else {
      setNotice("Account created. We sent you a verification email — please confirm it.");
      router.replace("/account");
    }
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
      <h1 className="text-xl font-extrabold tracking-tight">Create an account</h1>
      <p className="mt-1 text-xs text-muted">Join Pickenby to track your orders.</p>

      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <div>
          <label htmlFor="register-name" className="mb-1 block text-[11px] font-semibold text-muted">
            Full name *
          </label>
          <input
            id="register-name"
            autoComplete="name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={inputCls}
            placeholder="Your name"
          />
        </div>
        <div>
          <label htmlFor="register-email" className="mb-1 block text-[11px] font-semibold text-muted">
            Email *
          </label>
          <input
            id="register-email"
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
          <label htmlFor="register-password" className="mb-1 block text-[11px] font-semibold text-muted">
            Password *
          </label>
          <input
            id="register-password"
            type="password"
            autoComplete="new-password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputCls}
            placeholder="At least 6 characters"
          />
        </div>
        <div>
          <label htmlFor="register-confirm" className="mb-1 block text-[11px] font-semibold text-muted">
            Confirm password *
          </label>
          <input
            id="register-confirm"
            type="password"
            autoComplete="new-password"
            required
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className={inputCls}
            placeholder="Repeat your password"
          />
        </div>

        {error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-600">{error}</p>
        )}
        {notice && (
          <p className="rounded-lg bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-700">
            {notice}
          </p>
        )}

        <button
          type="submit"
          disabled={busy !== null}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-700 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-brand-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {busy === "email" && <Loader2 className="size-4 animate-spin" />}
          Create account
        </button>
      </form>

      <div className="my-4 flex items-center gap-3 text-[11px] text-muted">
        <span className="h-px flex-1 bg-slate-200" />
        or
        <span className="h-px flex-1 bg-slate-200" />
      </div>

      <GoogleButton onClick={onGoogle} busy={busy === "google"} />

      <p className="mt-6 text-center text-xs text-muted">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-brand-700 hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}