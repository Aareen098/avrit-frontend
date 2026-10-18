import { useState } from "react";
import { DndContext, KeyboardSensor, PointerSensor, useDraggable, useDroppable, useSensor, useSensors } from "@dnd-kit/core";
import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getCandidates, updateCandidateStage } from "@/api/candidates.api";
import ScoreBadge from "@/components/common/ScoreBadge";
import RejectDialog from "@/features/pipeline/RejectDialog";
import { STAGES } from "@/utils/candidate";
import { getInitials } from "@/utils/format";
import { cn } from "@/utils/cn";

function Card({ c, onMove }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: c.id });
  const style = transform ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` } : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      data-testid={`card-${c.id}`}
      className={cn(
        "rounded-lg border border-slate-200 bg-white p-3 shadow-card",
        isDragging && "relative z-50 cursor-grabbing shadow-lg ring-2 ring-primary-container/30"
      )}
    >
      <div {...attributes} {...listeners} aria-label={`Drag ${c.name}`} className="cursor-grab touch-none">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-container text-xs font-semibold text-white">
            {getInitials(c.name)}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{c.name}</p>
            <p className="truncate text-xs text-slate-500">{c.job}</p>
          </div>
        </div>
        <div className="mt-3 flex items-center justify-between">
          <span className="text-xs text-slate-500">{c.experience} yrs</span>
          <ScoreBadge score={c.aiScore} />
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between gap-2 border-t border-slate-100 pt-2">
        <Link to={`/candidates/${c.id}`} className="text-xs font-medium text-primary hover:underline">View</Link>
        <select
          aria-label={`Move ${c.name}`}
          value=""
          onChange={(e) => onMove(c.id, e.target.value)}
          className="h-7 rounded border border-slate-200 bg-white px-1 text-xs text-slate-600"
        >
          <option value="" disabled>Move to...</option>
          {Object.entries(STAGES).filter(([k]) => k !== c.stage).map(([k, v]) => (
            <option key={k} value={k}>{v.label}</option>
          ))}
        </select>
      </div>
    </div>
  );
}

function Column({ stage, items, onMove }) {
  const { setNodeRef, isOver } = useDroppable({ id: stage });
  return (
    <section
      ref={setNodeRef}
      aria-label={STAGES[stage].label}
      className={cn("w-72 shrink-0 rounded-xl bg-slate-100/70 p-3", isOver && "bg-primary-fixed/50 ring-2 ring-primary-container/30")}
    >
      <div className="mb-3 flex items-center justify-between px-1">
        <h2 className="text-sm font-semibold">{STAGES[stage].label}</h2>
        <span className="rounded-full bg-white px-2 py-0.5 text-xs font-semibold text-slate-500">{items.length}</span>
      </div>
      <div className="min-h-24 space-y-3">
        {items.map((c) => <Card key={c.id} c={c} onMove={onMove} />)}
        {items.length === 0 && <p className="py-6 text-center text-xs text-slate-400">Drop candidates here</p>}
      </div>
    </section>
  );
}

export default function Pipeline() {
  const queryClient = useQueryClient();
  const [rejecting, setRejecting] = useState(null);
  const { data = [], isLoading, isError } = useQuery({ queryKey: ["candidates"], queryFn: getCandidates });
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor)
  );

  const mutation = useMutation({
    mutationFn: updateCandidateStage,
    // Move the card right away, undo if the server says no.
    onMutate: async ({ id, stage, reason }) => {
      await queryClient.cancelQueries({ queryKey: ["candidates"] });
      const previous = queryClient.getQueryData(["candidates"]);
      queryClient.setQueryData(["candidates"], (old = []) => old.map((c) => (c.id === id ? { ...c, stage, rejectionReason: reason } : c)));
      return { previous };
    },
    onError: (_err, _vars, ctx) => queryClient.setQueryData(["candidates"], ctx.previous),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["candidates"] });
      queryClient.invalidateQueries({ queryKey: ["candidate"] });
    },
  });

  const move = (id, stage) => {
    const c = data.find((x) => x.id === id);
    if (!c || c.stage === stage) return;
    if (stage === "REJECTED") setRejecting(c); // ask for a reason first
    else mutation.mutate({ id, stage });
  };

  const confirmReject = ({ reason, note }) => {
    mutation.mutate({ id: rejecting.id, stage: "REJECTED", reason, note });
    setRejecting(null);
  };

  if (isLoading) return <p className="text-slate-500">Loading pipeline...</p>;
  if (isError) return <p className="text-red-600">Could not load the pipeline.</p>;

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Pipeline</h1>
      <p className="mt-1 text-slate-500">Drag a candidate to a new stage, or use "Move to...".</p>

      <DndContext sensors={sensors} onDragEnd={({ active, over }) => over && move(active.id, over.id)}>
        <div className="mt-6 flex gap-4 overflow-x-auto pb-4">
          {Object.keys(STAGES).map((stage) => (
            <Column key={stage} stage={stage} items={data.filter((c) => c.stage === stage)} onMove={move} />
          ))}
        </div>
      </DndContext>

      {rejecting && <RejectDialog candidate={rejecting} onConfirm={confirmReject} onCancel={() => setRejecting(null)} />}
    </div>
  );
}