import { useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { generateInvoices, getInvoices, setInvoiceStatus } from "@/api/platform.api";
import Button from "@/components/ui/Button";
import { formatInr } from "@/utils/format";
import { cn } from "@/utils/cn";

const STYLE = {
  ISSUED: "border-amber-200 bg-amber-50 text-amber-700",
  PAID: "border-emerald-200 bg-emerald-50 text-emerald-700",
  VOID: "border-slate-200 bg-slate-100 text-slate-500",
};

export function InvoiceStatus({ status }) {
  const label = { ISSUED: "Unpaid", PAID: "Paid", VOID: "Void" }[status] || status;
  return <span className={cn("rounded-full border px-2.5 py-0.5 text-xs font-medium", STYLE[status])}>{label}</span>;
}

// No payment gateway: you generate the month's invoices and mark each one paid yourself.
export default function Billing() {
  const [period, setPeriod] = useState(new Date().toISOString().slice(0, 7));
  const [message, setMessage] = useState("");
  const queryClient = useQueryClient();
  const { data: invoices = [], isLoading, isError } = useQuery({
    queryKey: ["platform", "invoices", period],
    queryFn: () => getInvoices(period),
    enabled: /^\d{4}-\d{2}$/.test(period),
  });

  const refresh = () => queryClient.invalidateQueries({ queryKey: ["platform"] });
  const generate = useMutation({
    mutationFn: () => generateInvoices(period),
    onSuccess: ({ created }) => {
      setMessage(created === 0 ? "Nothing new to invoice for this month." : `${created} invoice${created === 1 ? "" : "s"} created.`);
      refresh();
    },
    onError: (err) => setMessage(err?.response?.data?.message || "Could not generate invoices."),
  });
  const mark = useMutation({
    mutationFn: ({ id, status }) => setInvoiceStatus(id, status),
    onSuccess: refresh,
    onError: (err) => setMessage(err?.response?.data?.message || "Could not update the invoice."),
  });

  const live = invoices.filter((i) => i.status !== "VOID");
  const total = live.reduce((sum, i) => sum + i.totalAmount, 0);
  const paid = live.filter((i) => i.status === "PAID").reduce((sum, i) => sum + i.totalAmount, 0);

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Billing</h1>
      <p className="mt-1 text-slate-500">Invoices are made from each company's plan and measured usage. Extra use above a plan's allowance is added on top.</p>

      <div className="mt-6 flex flex-wrap items-end gap-3">
        <label className="text-sm">
          <span className="mb-1 block text-slate-500">Month</span>
          <input
            type="month"
            value={period}
            max={new Date().toISOString().slice(0, 7)}
            onChange={(e) => { setPeriod(e.target.value); setMessage(""); }}
            className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm"
          />
        </label>
        <Button loading={generate.isPending} onClick={() => generate.mutate()}>Generate invoices for {period}</Button>
        {message && <span role="status" className="text-sm text-slate-600">{message}</span>}
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-card"><p className="text-xs text-slate-500">Invoiced</p><p className="mt-1 text-2xl font-semibold">{formatInr(total)}</p></div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-card"><p className="text-xs text-slate-500">Paid</p><p className="mt-1 text-2xl font-semibold">{formatInr(paid)}</p></div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-card"><p className="text-xs text-slate-500">Still to collect</p><p className="mt-1 text-2xl font-semibold">{formatInr(total - paid)}</p></div>
      </div>

      {isLoading && <p className="mt-6 text-slate-500">Loading...</p>}
      {isError && <p className="mt-6 text-slate-600">Could not load invoices.</p>}

      {!isLoading && !isError && (
        <div className="mt-4 overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-card">
          <table className="w-full min-w-[860px] text-left text-sm">
            <thead className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">Invoice</th>
                <th className="px-4 py-3 font-medium">Company</th>
                <th className="px-4 py-3 font-medium">Plan</th>
                <th className="px-4 py-3 text-right font-medium">AI calls</th>
                <th className="px-4 py-3 text-right font-medium">Applications</th>
                <th className="px-4 py-3 text-right font-medium">Base</th>
                <th className="px-4 py-3 text-right font-medium">Extra use</th>
                <th className="px-4 py-3 text-right font-medium">Total</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {invoices.length === 0 && <tr><td colSpan={10} className="px-4 py-8 text-center text-slate-500">No invoices for {period}. Click "Generate invoices".</td></tr>}
              {invoices.map((i) => (
                <tr key={i.id} className={i.status === "VOID" ? "text-slate-400" : ""}>
                  <td className="px-4 py-3 font-medium">{i.number}</td>
                  <td className="px-4 py-3"><Link to={`/platform/companies/${i.companyId}`} className="hover:underline">{i.companyName}</Link></td>
                  <td className="px-4 py-3">{i.planCode}</td>
                  <td className="px-4 py-3 text-right">{i.aiCalls} / {i.aiCallsIncluded}</td>
                  <td className="px-4 py-3 text-right">{i.applications} / {i.applicationsIncluded}</td>
                  <td className="px-4 py-3 text-right">{formatInr(i.baseAmount)}</td>
                  <td className="px-4 py-3 text-right">{formatInr(i.overageAmount)}</td>
                  <td className="px-4 py-3 text-right font-medium">{formatInr(i.totalAmount)}</td>
                  <td className="px-4 py-3"><InvoiceStatus status={i.status} /></td>
                  <td className="whitespace-nowrap px-4 py-3 text-right">
                    {i.status === "ISSUED" && (
                      <>
                        <button onClick={() => mark.mutate({ id: i.id, status: "PAID" })} className="font-medium text-primary-container hover:underline">Mark paid</button>
                        <button
                          onClick={() => window.confirm(`Void invoice ${i.number}?`) && mark.mutate({ id: i.id, status: "VOID" })}
                          className="ml-3 text-slate-500 hover:underline"
                        >
                          Void
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}