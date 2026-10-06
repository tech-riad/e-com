import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Hind_Siliguri } from "next/font/google";
import { CartProvider } from "@/lib/cart";
import { AuthProvider } from "@/lib/auth";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { BottomNav } from "@/components/BottomNav";
import { getCategories, getNavLabels, getSiteSettings } from "@/lib/cms";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
});

const bangla = Hind_Siliguri({
  subsets: ["bengali"],
  weight: ["400", "500", "600"],
  variable: "--font-bangla",
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

const DEFAULT_DESCRIPTION =
  "Shop air conditioners, refrigerators, washing machines, TVs and more from 100+ brands with free delivery and 0% EMI.";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings().catch(() => null);
  const siteName = settings?.siteName ?? "Pickenby";
  const title = `${siteName} — Electronics & Home Appliances in Bangladesh`;

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: title,
      template: "%s",
    },
    description: settings?.tagline || DEFAULT_DESCRIPTION,
    icons: settings?.favicon
      ? { icon: settings.favicon, apple: settings.logo }
      : undefined,
    openGraph: {
      title,
      description: settings?.tagline || DEFAULT_DESCRIPTION,
      type: "website",
      locale: "en_US",
      siteName,
    },
    robots: { index: true, follow: true },
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const [nav, cmsCategories, settings] = await Promise.all([
    getNavLabels().catch(() => [] as string[]),
    getCategories().catch(() => []),
    getSiteSettings().catch(() => null),
  ]);

  const navItems =
    cmsCategories.length > 0
      ? cmsCategories
          .filter((c) => !c.parentSlug)
          .map((c) => ({
            label: c.label,
            href: `/category/${c.slug}`,
            icon: c.icon,
            children:
              c.children && c.children.length > 0
                ? c.children.map((ch) => ({ label: ch.label, href: `/category/${ch.slug}` }))
                : undefined,
          }))
      : undefined;

  return (
    <html lang="en" className={`${jakarta.variable} ${bangla.variable}`}>
      <body className="font-sans">
          <AuthProvider>
            <CartProvider>
              <Header nav={nav} navItems={navItems} settings={settings ?? undefined} />
              {children}
              <Footer settings={settings ?? undefined} />
              <BottomNav />
            </CartProvider>
          </AuthProvider>
        </body>
    </html>
  );
}
