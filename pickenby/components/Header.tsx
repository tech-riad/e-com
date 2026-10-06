"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Cloud, LogOut, MessageCircle, Phone, Search, ShoppingBag, User, ChevronDown, Menu, X } from "lucide-react";
import { useState, useEffect, useRef, type FormEvent } from "react";
import { navLinks } from "@/lib/data";
import type { SiteSetting } from "@/lib/cms";
import { useAuth } from "@/lib/auth";
import { CartCount } from "./CartCount";
import { CategoryIcon } from "./CategoryIcon";

export type NavItem = {
  label: string;
  href: string;
  icon?: string;
  children?: { label: string; href: string }[];
};

function fallbackNav(labels: string[]): NavItem[] {
  return labels.map((label, i) =>
    i === 0
      ? { label, href: "/", icon: "house" }
      : { label, href: `/search?q=${encodeURIComponent(label)}` }
  );
}

export function Header({ nav, navItems, settings }: { nav?: string[]; navItems?: NavItem[]; settings?: SiteSetting }) {
  const links: NavItem[] =
    navItems && navItems.length > 0
      ? navItems
      : fallbackNav(nav && nav.length > 0 ? nav : navLinks);

  const router = useRouter();
  const siteName = settings?.siteName || "pickenby";
  const phone = settings?.contactPhone || "09647274752";
  const whatsapp = settings?.whatsapp || "8809647274752";
  const { user, logout } = useAuth();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const mobileSearchRef = useRef<HTMLInputElement>(null);

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const query = String(new FormData(event.currentTarget).get("q") ?? "").trim();
    setSearchOpen(false);
    router.push(query ? `/search?q=${encodeURIComponent(query)}` : "/search");
  };

  // prevent body scroll when drawer open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  // focus the mobile search field as soon as it opens
  useEffect(() => {
    if (searchOpen) {
      mobileSearchRef.current?.focus();
    }
  }, [searchOpen]);

  // close mobile-only controls on resize to desktop
  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 1024) setMobileOpen(false);
      if (window.innerWidth >= 768) setSearchOpen(false);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const avatar = user?.photoURL ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={user.photoURL} alt={user.displayName ?? "Account"} width={28} height={28} className="size-9 rounded-full object-cover lg:size-7" />
  ) : (
    <span className="grid size-9 place-items-center rounded-full bg-slate-100 text-muted lg:size-7">
      <User className="size-4" />
    </span>
  );

  return (
    <header className="sticky top-0 z-40 bg-white shadow-card">
      {/* Top bar */}
      <div className="container-page flex items-center gap-2 py-3 sm:gap-3 lg:gap-5">
        {/* Hamburger - mobile only */}
        <button
          type="button"
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileOpen}
          onClick={() => {
            setSearchOpen(false);
            setMobileOpen((v) => !v);
          }}
          className="grid size-9 shrink-0 place-items-center rounded-lg border border-slate-200 text-ink hover:border-brand-500 hover:text-brand-600 lg:hidden"
        >
          {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>

        <Link href="/" className="flex min-w-0 shrink items-center gap-1.5 text-xl font-bold tracking-tight text-brand-600">
          {settings?.logo ? (
            <Image src={settings.logo} alt={settings.siteName} width={28} height={28} className="h-7 w-auto shrink-0 object-contain" />
          ) : (
            <Cloud aria-hidden className="size-6 shrink-0 fill-brand-100 text-brand-500" />
          )}
          <span className="truncate">{siteName}</span>
        </Link>

        <form role="search" action="/search" method="get" onSubmit={handleSearch} className="relative hidden min-w-0 flex-1 md:flex">
          <label htmlFor="site-search" className="sr-only">Search products</label>
          <input
            id="site-search"
            name="q"
            type="search"
            placeholder="পণ্য খুঁজুন.."
            className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-4 pr-10 text-sm placeholder:text-muted/70 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          />
          <button type="submit" aria-label="Search" className="absolute inset-y-0 right-0 grid w-10 place-items-center text-muted hover:text-brand-600">
            <Search className="size-4" />
          </button>
        </form>

        {/* Mobile search toggle */}
        <button
          type="button"
          aria-label={searchOpen ? "Close search" : "Open search"}
          aria-expanded={searchOpen}
          aria-controls="mobile-search-panel"
          onClick={() => setSearchOpen((v) => !v)}
          className="grid size-9 shrink-0 place-items-center rounded-lg border border-slate-200 text-ink hover:border-brand-500 hover:text-brand-600 md:hidden"
        >
          {searchOpen ? <X className="size-5" /> : <Search className="size-5" />}
        </button>

        <div className="flex shrink-0 items-center gap-2 sm:gap-4">
          <a href={`https://wa.me/${whatsapp}`} aria-label="Chat on WhatsApp" className="grid size-8 place-items-center rounded-full bg-emerald-500 text-white transition hover:bg-emerald-600">
            <MessageCircle className="size-4" />
          </a>
          <a href={`tel:${phone}`} className="hidden items-center gap-2 sm:flex">
            <span className="grid size-8 place-items-center rounded-full bg-emerald-600 text-white">
              <Phone className="size-4" />
            </span>
            <span className="leading-tight">
              <span className="block text-[10px] text-muted">অর্ডার করুন</span>
              <span className="block text-xs font-bold text-brand-600">{phone}</span>
            </span>
          </a>
          {user ? (
            <Link href="/account" aria-label="My account" className="flex items-center gap-2 text-xs font-medium">
              {avatar}
              <span className="hidden max-w-[90px] truncate font-semibold text-brand-600 lg:block">
                {user.displayName ?? "Account"}
              </span>
            </Link>
          ) : (
            <Link href="/login" className="flex items-center gap-2 text-xs font-medium">
              <span className="grid size-9 place-items-center rounded-full bg-slate-100 text-muted lg:size-7">
                <User className="size-4" />
              </span>
              <span className="hidden lg:inline">লগইন</span>
            </Link>
          )}
          <Link href="/cart" aria-label="Cart" className="relative grid size-9 place-items-center rounded-lg border border-slate-200 hover:border-brand-500 hover:text-brand-600">
            <ShoppingBag className="size-4" />
            <CartCount />
          </Link>
        </div>
      </div>

      {/* Mobile search field */}
      {searchOpen && (
        <div id="mobile-search-panel" className="border-t border-slate-100 bg-white md:hidden">
          <form
            role="search"
            action="/search"
            method="get"
            onSubmit={handleSearch}
            className="container-page relative py-3"
          >
            <label htmlFor="mobile-site-search" className="sr-only">Search products</label>
            <input
              ref={mobileSearchRef}
              id="mobile-site-search"
              name="q"
              type="search"
              autoComplete="off"
              enterKeyHint="search"
              placeholder="পণ্য খুঁজুন.."
              className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-4 pr-11 text-sm placeholder:text-muted/70 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
            <button
              type="submit"
              aria-label="Search"
              className="absolute inset-y-3 right-4 grid w-10 place-items-center text-muted hover:text-brand-600"
            >
              <Search className="size-4" />
            </button>
          </form>
        </div>
      )}

      {/* Category nav - Desktop */}
      <nav aria-label="Main" className="hidden bg-brand-700 lg:block">
        <ul className="container-page flex flex-wrap gap-x-6 gap-y-2 py-3 text-xs font-medium text-white">
          {links.map(({ label, href, children }, i) => (
            <li key={label} className="relative shrink-0 group/dropdown">
              <Link href={href} className="flex items-center gap-1.5 whitespace-nowrap opacity-90 transition hover:opacity-100">
                {i === 0 ? (
                  <span aria-hidden>⌂</span>
                ) : (
                  <span aria-hidden className="size-2.5 rounded-full border border-white/70" />
                )}
                {label}
                {children && children.length > 0 && (
                  <ChevronDown aria-hidden className="size-3 opacity-60" />
                )}
              </Link>
              {children && children.length > 0 && (
                <ul className="invisible absolute left-0 top-full z-50 mt-0.5 min-w-[200px] rounded-lg border border-slate-200 bg-white py-1.5 shadow-float transition group-hover/dropdown:visible">
                  {children.map((child) => (
                    <li key={child.href}>
                      <Link
                        href={child.href}
                        className="block px-4 py-2 text-xs font-medium text-ink hover:bg-brand-50 hover:text-brand-700"
                      >
                        {child.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      </nav>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="lg:hidden">
          {/* Overlay */}
          <button
            aria-label="Close menu"
            onClick={() => setMobileOpen(false)}
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[1px]"
          />
          {/* Panel */}
          <div className="fixed inset-y-0 left-0 z-50 flex w-[86%] max-w-[340px] flex-col bg-white shadow-float">
            {/* Drawer header */}
            <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
              <Link href="/" onClick={() => setMobileOpen(false)} className="flex items-center gap-1.5 text-lg font-bold tracking-tight text-brand-600">
                {settings?.logo ? (
                  <Image src={settings.logo} alt={settings.siteName} width={24} height={24} className="h-6 w-auto object-contain" />
                ) : (
                  <Cloud aria-hidden className="size-6 fill-brand-100 text-brand-500" />
                )}
                {siteName}
              </Link>
              <button
                type="button"
                aria-label="Close menu"
                onClick={() => setMobileOpen(false)}
                className="grid size-8 place-items-center rounded-full bg-slate-100 text-muted hover:bg-slate-200 hover:text-ink"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* Nav links */}
            <nav aria-label="Mobile" className="flex-1 overflow-y-auto">
              <ul className="divide-y divide-slate-100">
                {links.map(({ label, href, children, icon }) => {
                  const isOpen = openDropdown === label;
                  const hasChildren = !!(children && children.length > 0);
                  return (
                    <li key={label} className="bg-white">
                      <div className="flex items-center">
                        <Link
                          href={href}
                          onClick={() => setMobileOpen(false)}
                          className="flex flex-1 items-center gap-2 px-4 py-3.5 text-sm font-medium text-ink hover:bg-slate-50 hover:text-brand-700"
                        >
                          <span aria-hidden className="grid size-7 shrink-0 place-items-center rounded-lg bg-brand-50 text-brand-700">
                            <CategoryIcon name={icon ?? (href === "/" ? "house" : undefined)} />
                          </span>
                          {label}
                        </Link>
                        {hasChildren && (
                          <button
                            type="button"
                            aria-label={isOpen ? `Collapse ${label}` : `Expand ${label}`}
                            aria-expanded={isOpen}
                            onClick={() => setOpenDropdown(isOpen ? null : label)}
                            className="grid size-10 shrink-0 place-items-center text-muted hover:text-ink"
                          >
                            <ChevronDown className={`size-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                          </button>
                        )}
                      </div>
                      {hasChildren && isOpen && (
                        <ul className="border-t border-slate-100 bg-slate-50/70 pb-2">
                          {children!.map((child) => (
                            <li key={child.href}>
                              <Link
                                href={child.href}
                                onClick={() => setMobileOpen(false)}
                                className="block py-2.5 pl-12 pr-4 text-sm text-muted hover:text-brand-700"
                              >
                                {child.label}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      )}
                    </li>
                  );
                })}
              </ul>
            </nav>

            {/* Drawer footer - actions hidden on desktop topbar */}
            <div className="border-t border-slate-100 p-4">
              <div className="grid grid-cols-2 gap-3">
                <a href={`tel:${phone}`} className="flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-3 py-2.5 text-xs font-bold text-white hover:bg-emerald-700">
                  <Phone className="size-3.5" />
                  {phone}
                </a>
                {user ? (
                  <Link href="/account" onClick={() => setMobileOpen(false)} className="flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-xs font-bold text-ink hover:border-brand-500 hover:text-brand-600">
                    {avatar}
                    {user.displayName ?? "Account"}
                  </Link>
                ) : (
                  <Link href="/login" onClick={() => setMobileOpen(false)} className="flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-xs font-bold text-ink hover:border-brand-500 hover:text-brand-600">
                    <User className="size-3.5" />
                    লগইন
                  </Link>
                )}
              </div>
              {user && (
                <button
                  type="button"
                  onClick={async () => {
                    await logout();
                    setMobileOpen(false);
                  }}
                  className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-xs font-bold text-ink hover:border-red-300 hover:text-red-600"
                >
                  <LogOut className="size-3.5" />
                  লগআউট
                </button>
              )}
              <a href={`https://wa.me/${whatsapp}`} className="mt-3 flex items-center justify-center gap-2 rounded-lg bg-emerald-500 px-3 py-2.5 text-xs font-bold text-white hover:bg-emerald-600">
                <MessageCircle className="size-3.5" />
                WhatsApp এ চ্যাট করুন
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
