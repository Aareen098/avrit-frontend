import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getInterviews } from "@/api/interviews.api";
import ScheduleInterviewDialog from "@/features/interviews/ScheduleInterviewDialog";
import Button from "@/components/ui/Button";
import Icon from "@/components/common/Icon";
import { useAuthStore } from "@/store/authStore";
import { ROLES } from "@/utils/constants";
import { cn } from "@/utils/cn";

const TYPE_ICON = { "Video call": "videocam", "Phone call": "call", "On-site": "location_on" };
const when = (i) => new Date(`${i.date}T${i.time}`);
const pretty = (i) => when(i).toLocaleString("en-IN", { weekday: "short", day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });

export default function Interviews() {
  const role = useAuthStore((s) => s.user?.role);
  const canSchedule = role === ROLES.ADMIN || role === ROLES.RECRUITER;
  const [tab, setTab] = useState("upcoming");
  const [open, setOpen] = useState(false);
  const [now] = useState(() => Date.now());
  const { data = [], isLoading, isError } = useQuery({ queryKey: ["interviews"], queryFn: getInterviews });

  const upcoming = data.filter((i) => when(i) >= now).sort((a, b) => when(a) - when(b));
  const past = data.filter((i) => when(i) < now).sort((a, b) => when(b) - when(a));
  const shown = tab === "upcoming" ? upcoming : past;

  return (
    <div className="mx-auto max-w-3xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Interviews</h1>
          <p className="mt-1 text-slate-500">Everything scheduled with candidates.</p>
        </div>
        {canSchedule && <Button onClick={() => setOpen(true)}><Icon name="add" className="text-xl" /> Schedule interview</Button>}
      </div>

      <div className="mt-6 inline-flex gap-1 rounded-lg bg-slate-100 p-1" role="tablist">
        {[["upcoming", `Upcoming (${upcoming.length})`], ["past", `Past (${past.length})`]].map(([k, label]) => (
          <button key={k} role="tab" aria-selected={tab === k} onClick={() => setTab(k)}
            className={cn("rounded-md px-3 py-1.5 text-sm font-medium", tab === k ? "bg-white shadow-card" : "text-slate-500 hover:text-on-surface")}>
            {label}
          </button>
        ))}
      </div>

      <div className="mt-4 space-y-3">
        {isLoading ? <p className="text-slate-500">Loading...</p> : isError ? <p className="text-red-600">Could not load interviews.</p> : shown.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500">
            {tab === "upcoming" ? "No upcoming interviews." : "No past interviews."}
          </div>
        ) : (
          shown.map((i) => (
            <article key={i.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-card">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-surface-container text-primary-container">
                  <Icon name={TYPE_ICON[i.type] || "event"} />
                </div>
                <div>
                  <Link to={`/candidates/${i.candidateId}`} className="font-semibold hover:text-primary">{i.candidateName}</Link>
                  <p className="text-sm text-slate-500">{i.job} · with {i.interviewer}</p>
                  {i.notes && <p className="mt-1 text-xs text-slate-500">{i.notes}</p>}
                </div>
              </div>
              <div className="text-right text-sm">
                <p className="font-semibold">{pretty(i)}</p>
                <p className="text-slate-500">{i.type}</p>
              </div>
            </article>
          ))
        )}
      </div>

      {open && <ScheduleInterviewDialog onClose={() => setOpen(false)} />}
    </div>
  );
}