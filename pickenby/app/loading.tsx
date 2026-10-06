export default function Loading() {
  return (
    <div className="container-page animate-pulse py-10">
      <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="rounded-xl bg-white p-2 shadow-card">
            <div className="aspect-square rounded-lg bg-slate-200" />
            <div className="mt-3 h-3 w-1/2 rounded bg-slate-200" />
            <div className="mt-1.5 h-3 w-3/4 rounded bg-slate-200" />
            <div className="mt-3 h-8 rounded-lg bg-slate-100" />
          </div>
        ))}
      </div>
    </div>
  );
}