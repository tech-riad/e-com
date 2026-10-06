"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { LogOut, Mail, User } from "lucide-react";
import { useAuth } from "@/lib/auth";

export function AccountPanel() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [loading, user, router]);

  if (loading) {
    return (
      <div className="rounded-2xl bg-white p-10 text-center shadow-card">
        <p className="text-sm font-semibold text-muted">Loading your account…</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="rounded-2xl bg-white p-10 text-center shadow-card">
        <p className="text-sm font-semibold text-muted">Redirecting to sign in…</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-white p-6 shadow-card sm:p-8">
      <div className="flex items-center gap-4">
        {user.photoURL ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={user.photoURL}
            alt={user.displayName ?? "Account"}
            width={48}
            height={48}
            className="size-12 rounded-full object-cover"
          />
        ) : (
          <span className="grid size-12 place-items-center rounded-full bg-brand-100 text-brand-700">
            <User className="size-6" />
          </span>
        )}
        <div>
          <h1 className="text-xl font-extrabold tracking-tight">
            {user.displayName || "My account"}
          </h1>
          <p className="mt-0.5 flex items-center gap-1 text-xs text-muted">
            <Mail className="size-3.5" />
            {user.email}
          </p>
        </div>
      </div>

      <dl className="mt-6 space-y-2 rounded-xl bg-slate-50 p-4 text-xs text-muted">
        <div className="flex justify-between">
          <dt>Sign-in method</dt>
          <dd className="font-semibold text-ink">Firebase</dd>
        </div>
        <div className="flex justify-between">
          <dt>User ID</dt>
          <dd className="max-w-[200px] truncate font-mono font-semibold text-ink">{user.uid}</dd>
        </div>
      </dl>

      <button
        type="button"
        onClick={async () => {
          await logout();
          router.replace("/");
        }}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-ink transition hover:border-red-300 hover:text-red-600"
      >
        <LogOut className="size-4" />
        Log out
      </button>
    </div>
  );
}