import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Modal from "@/components/ui/Modal";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";

const REJECT_REASONS = [
  "Skills do not match",
  "Not enough experience",
  "Another candidate was chosen",
  "Salary expectations too high",
  "Candidate withdrew",
  "Other",
];
const schema = z.object({ reason: z.string().min(1, "Choose a reason"), note: z.string().optional() });

export default function RejectDialog({ candidate, onConfirm, onCancel }) {
  const { register, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(schema), defaultValues: { reason: "" } });

  return (
    <Modal title={`Reject ${candidate.name}?`} onClose={onCancel}>
      <form noValidate onSubmit={handleSubmit(onConfirm)} className="space-y-4">
        <p className="text-sm text-slate-500">The candidate will see a polite "not moving forward" message. They never see the reason below.</p>
        <Select label="Reason" placeholder="Choose a reason" options={REJECT_REASONS} {...register("reason")} error={errors.reason?.message} />
        <div>
          <label htmlFor="reject-note" className="mb-1.5 block text-sm font-medium">Internal note (optional)</label>
          <textarea id="reject-note" rows={3} className="w-full rounded-lg border border-slate-200 p-3 text-sm focus:border-primary-container focus:outline-none focus:ring-2 focus:ring-primary-container/15" {...register("note")} />
        </div>
        <div className="flex justify-end gap-3">
          <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
          <Button type="submit" variant="danger">Reject candidate</Button>
        </div>
      </form>
    </Modal>
  );
}