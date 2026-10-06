import Link from "next/link";

export default function NotFound() {
  return (
    <main className="container-page grid min-h-[50vh] place-items-center text-center">
      <div>
        <p className="text-6xl font-black text-brand-200">404</p>
        <h1 className="mt-2 text-xl font-extrabold tracking-tight">Page not found</h1>
        <p className="mt-1 text-xs text-muted">The page you&apos;re looking for doesn&apos;t exist or has moved.</p>
        <Link
          href="/"
          className="mt-5 inline-block rounded-xl bg-brand-700 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-brand-800"
        >
          Back to home
        </Link>
      </div>
    </main>
  );
}