import { useState } from "react";

// A simple bar chart built from plain HTML (no chart library needed).
// rows: [{ label: "Interview", value: 3 }]. One colour, value at the bar tip, table view for screen readers.
export default function BarChartCard({ title, subtitle, rows }) {
  const [table, setTable] = useState(false);
  const max = Math.max(1, ...rows.map((r) => r.value));

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-card">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="font-semibold">{title}</h2>
          <p className="text-sm text-slate-500">{subtitle}</p>
        </div>
        <button onClick={() => setTable(!table)} className="shrink-0 text-xs font-medium text-primary hover:underline">
          {table ? "View as chart" : "View as table"}
        </button>
      </div>

      {table ? (
        <table className="mt-4 w-full text-sm">
          <thead>
            <tr className="text-left text-slate-500">
              <th className="pb-2 font-medium">{title.split(" ")[0]}</th>
              <th className="pb-2 text-right font-medium">Count</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.label} className="border-t border-slate-100">
                <td className="py-2">{r.label}</td>
                <td className="py-2 text-right font-semibold">{r.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <ul className="mt-4 space-y-3">
          {rows.map((r) => (
            <li key={r.label} title={`${r.label}: ${r.value}`}>
              <div className="mb-1 truncate text-sm text-slate-600">{r.label}</div>
              <div className="flex items-center gap-2">
                <div className="h-5 flex-1">
                  <div
                    className="h-5 rounded-r-[4px] bg-primary-container transition-opacity hover:opacity-80"
                    style={{ width: `${(r.value / max) * 100}%` }}
                  />
                </div>
                <span className="w-6 text-right text-sm font-semibold">{r.value}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}