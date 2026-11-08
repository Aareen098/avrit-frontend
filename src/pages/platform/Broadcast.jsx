import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getBroadcasts, getCompanies, previewBroadcast, sendBroadcast } from "@/api/platform.api";
import Button from "@/components/ui/Button";
import Icon from "@/components/common/Icon";

const AUDIENCES = [
  { value: "USER", label: "One person (by email)" },
  { value: "COMPANY", label: "One company's team" },
  { value: "ALL_STAFF", label: "All company staff" },
  { value: "ALL_CANDIDATES", label: "All candidates" },
];

const field = "w-full rounded-lg border border-slate-200 bg-white px-3 text-sm focus:border-primary-container focus:outline-none focus:ring-2 focus:ring-primary-container/15";

export default function Broadcast() {
  const [audience, setAudience] = useState("ALL_STAFF");
  const [target, setTarget] = useState("");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [inApp, setInApp] = useState(true);
  const [email, setEmail] = useState(false);
  const [done, setDone] = useState("");
  const queryClient = useQueryClient();

  const { data: companies = [] } = useQuery({ queryKey: ["platform", "companies"], queryFn: getCompanies });
  const { data: history = [] } = useQuery({ queryKey: ["platform", "broadcasts"], queryFn: getBroadcasts });

  const body = { audience, target, title, message, inApp, email };
  const audienceReady = audience === "ALL_STAFF" || audience === "ALL_CANDIDATES" || target.trim() !== "";

  // Who would get it, shown before anything is sent.
  const preview = useMutation({ mutationFn: previewBroadcast });
  useEffect(() => {
    if (!audienceReady) return undefined;
    const timer = setTimeout(() => preview.mutate({ ...body, title: "x", message: "x" }), 400);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [audience, target, email]);

  const send = useMutation({
    mutationFn: () => sendBroadcast(body),
    onSuccess: (item) => {
      setDone(`Sent to ${item.audienceLabel}: ${item.inAppCount} in-app, ${item.emailCount} emails.`);
      setTitle("");
      setMessage("");
      queryClient.invalidateQueries({ queryKey: ["platform", "broadcasts"] });
      preview.mutate({ ...body, title: "x", message: "x" });
    },
  });

  const info = audienceReady && !preview.isError ? preview.data : null;
  const canSend = audienceReady && title.trim() && message.trim() && (inApp || email) && !send.isPending;
  const confirmText = info
    ? `Send "${title}" to ${info.audienceLabel}?\n\n${inApp ? `${info.inAppCount} in-app notification(s)\n` : ""}${email ? `${info.emailCount} email(s)\n` : ""}\nThis cannot be undone.`
    : "Send this message?";
  const previewError = preview.error?.response?.data?.message;
  const sendError = send.error?.response?.data?.message || (send.isError ? "Could not send the message." : "");

  const onSubmit = (e) => {
    e.preventDefault();
    setDone("");
    if (window.confirm(confirmText)) send.mutate();
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Broadcast</h1>
      <p className="mt-1 text-slate-500">Send a notification or an email to anyone on the platform.</p>

      <form onSubmit={onSubmit} className="mt-6 max-w-2xl space-y-4 rounded-xl border border-slate-200 bg-white p-5 shadow-card">
        <label className="block text-sm">
          <span className="mb-1 block text-slate-500">Send to</span>
          <select value={audience} onChange={(e) => { setAudience(e.target.value); setTarget(""); setDone(""); }} className={`${field} h-10`}>
            {AUDIENCES.map((a) => <option key={a.value} value={a.value}>{a.label}</option>)}
          </select>
        </label>

        {audience === "USER" && (
          <label className="block text-sm">
            <span className="mb-1 block text-slate-500">Email address</span>
            <input type="email" value={target} onChange={(e) => setTarget(e.target.value)} placeholder="name@example.com" className={`${field} h-10`} />
          </label>
        )}
        {audience === "COMPANY" && (
          <label className="block text-sm">
            <span className="mb-1 block text-slate-500">Company</span>
            <select value={target} onChange={(e) => setTarget(e.target.value)} className={`${field} h-10`}>
              <option value="">Choose a company</option>
              {companies.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </label>
        )}

        <label className="block text-sm">
          <span className="mb-1 block text-slate-500">Title</span>
          <input value={title} maxLength={100} onChange={(e) => setTitle(e.target.value)} placeholder="Short and clear" className={`${field} h-10`} />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block text-slate-500">Message</span>
          <textarea value={message} maxLength={2000} rows={5} onChange={(e) => setMessage(e.target.value)} className={`${field} py-2`} />
          <span className="mt-1 block text-right text-xs text-slate-400">{message.length} / 2000</span>
        </label>

        <div className="flex flex-wrap gap-6 text-sm">
          <label className="flex items-center gap-2"><input type="checkbox" checked={inApp} onChange={(e) => setInApp(e.target.checked)} /> In-app notification</label>
          <label className="flex items-center gap-2"><input type="checkbox" checked={email} onChange={(e) => setEmail(e.target.checked)} /> Email</label>
        </div>

        <div className="rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-600" aria-live="polite">
          {!audienceReady && "Choose who to send to."}
          {audienceReady && previewError && <span className="text-red-600">{previewError}</span>}
          {info && (
            <>
              Reaches <b>{info.audienceLabel}</b>: {info.inAppCount} account(s) in-app{email ? `, ${info.emailCount} email(s)` : ""}.
              {email && <span className="text-slate-500"> {info.emailsLeftToday} emails left today.</span>}
            </>
          )}
        </div>

        {sendError && <p role="alert" className="text-sm text-red-600">{sendError}</p>}
        {done && <p role="status" className="text-sm text-emerald-700">{done}</p>}

        <Button type="submit" loading={send.isPending} disabled={!canSend}>Send message</Button>
      </form>

      <h2 className="mt-8 text-sm font-semibold">Sent messages</h2>
      <div className="mt-3 divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white shadow-card">
        {history.length === 0 && <p className="p-4 text-sm text-slate-500">Nothing sent yet.</p>}
        {history.map((b) => (
          <div key={b.id} className="p-4 text-sm">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="font-medium">{b.title}</span>
              <span className="text-xs text-slate-500">{new Date(b.createdAt).toLocaleString()}</span>
            </div>
            <p className="mt-1 text-slate-600">{b.message}</p>
            <p className="mt-2 flex flex-wrap items-center gap-1 text-xs text-slate-500">
              <Icon name="campaign" className="text-sm" /> {b.audienceLabel} · {b.inApp ? `${b.inAppCount} in-app` : "no in-app"} · {b.email ? `${b.emailCount} emails` : "no email"}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}