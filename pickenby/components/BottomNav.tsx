"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { House, LayoutGrid, ShoppingBag, User } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { CartCount } from "./CartCount";

export function BottomNav() {
  const pathname = usePathname();
  const { user } = useAuth();

  const tabs = [
    { label: "Home", href: "/", Icon: House, active: pathname === "/" },
    {
      label: "Categories",
      href: "/products",
      Icon: LayoutGrid,
      active: pathname.startsWith("/products") || pathname.startsWith("/category"),
    },
    { label: "Cart", href: "/cart", Icon: ShoppingBag, active: pathname.startsWith("/cart"), badge: true },
    {
      label: "Account",
      href: user ? "/account" : "/login",
      Icon: User,
      active:
        pathname.startsWith("/account") ||
        pathname.startsWith("/login") ||
        pathname.startsWith("/register") ||
        pathname.startsWith("/forgot-password"),
    },
  ];

  return (
    <>
      {/* In-flow spacer so page content is never covered by the fixed bar */}
      <div aria-hidden className="h-16 lg:hidden" />
      <nav
        aria-label="Mobile"
        className="fixed bottom-0 left-0 right-0 z-30 block w-full border-t border-slate-200 bg-white pb-[env(safe-area-inset-bottom)] shadow-float lg:hidden"
      >
        <ul className="grid h-16 grid-cols-4">
          {tabs.map(({ label, href, Icon, active, badge }) => (
            <li key={label} className="min-w-0">
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={`flex h-full flex-col items-center justify-center gap-0.5 text-[10px] font-bold transition ${
                  active ? "text-brand-700" : "text-muted hover:text-ink"
                }`}
              >
                <span className="relative grid size-6 place-items-center">
                  <Icon className="size-5" aria-hidden />
                  {badge && <CartCount />}
                </span>
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </>
  );
}
