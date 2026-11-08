import { useState } from "react";

// A card with a title, a "Table" switch (the same numbers as text, for screen readers and exact values),
// and the chart. `table` = { head: ["Month", "Tokens"], rows: [["2026-11", "1.2K"], ...] }.
export default function ChartCard({ title, table, actions, children }) {
  const [asTable, setAsTable] = useState(false);
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-card">
      <div className="flex items-start justify-between gap-3">
        <h2 className="text-sm font-semibold">{title}</h2>
        <div className="flex items-center gap-2">
          {actions}
          {table && (
            <button
              type="button"
              onClick={() => setAsTable((v) => !v)}
              aria-pressed={asTable}
              className="rounded-md px-2 py-1 text-xs font-medium text-slate-500 hover:bg-slate-100"
            >
              {asTable ? "Chart" : "Table"}
            </button>
          )}
        </div>
      </div>
      {asTable && table ? (
        <table className="mt-3 w-full text-left text-sm">
          <thead className="text-xs uppercase tracking-wide text-slate-500">
            <tr>{table.head.map((h, i) => <th key={h} className={`py-2 font-medium ${i ? "text-right" : ""}`}>{h}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {table.rows.map((r) => (
              <tr key={r[0]}>{r.map((c, i) => <td key={i} className={`py-2 ${i ? "text-right" : ""}`}>{c}</td>)}</tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="mt-3">{children}</div>
      )}
    </div>
  );
}