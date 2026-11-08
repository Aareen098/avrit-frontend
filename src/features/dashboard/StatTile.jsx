import Icon from "@/components/common/Icon";

export default function StatTile({ label, value, icon, loading, hint }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-card">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">{label}</p>
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-surface-container text-primary-container">
          <Icon name={icon} className="text-xl" />
        </div>
      </div>
      <p className="mt-3 text-3xl font-semibold tracking-tight">{loading ? "–" : value}</p>
      {hint && !loading && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
    </div>
  );
}