export function StatCard({ label, value, hint }: { label: string; value: string | number; hint: string }) {
  return (
    <div className="card p-4">
      <div className="label">{label}</div>
      <div className="mt-2 text-3xl font-bold text-white">{value}</div>
      <div className="mt-1 text-sm text-slate-400">{hint}</div>
    </div>
  );
}
