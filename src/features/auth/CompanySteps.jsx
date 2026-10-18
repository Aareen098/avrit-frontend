import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import PasswordInput from "@/components/ui/PasswordInput";
import Select from "@/components/ui/Select";
import PasswordStrength from "@/features/auth/PasswordStrength";
import { companyAccountSchema, companyDetailsSchema } from "@/features/auth/authSchemas";

const SIZES = ["1-10 employees", "11-50 employees", "51-200 employees", "201-1000 employees", "1000+ employees"];
const INDUSTRIES = ["Software & SaaS", "Finance & Banking", "Healthcare", "Education", "E-commerce", "Manufacturing", "Consulting", "Other"];
const ROLES = ["Recruiter", "HR Manager", "Founder"];

export function AccountStep({ defaultValues, onNext }) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(companyAccountSchema),
    defaultValues,
    mode: "onTouched",
  });
  const passwordValue = useWatch({ control, name: "password" });

  return (
    <form onSubmit={handleSubmit(onNext)} className="space-y-4" noValidate>
      <Input label="Full name" icon="person" placeholder="Sarah Jenkins" {...register("fullName")} error={errors.fullName?.message} />
      <Input label="Work email" icon="mail" type="email" placeholder="you@company.com" {...register("email")} error={errors.email?.message} />
      <div>
        <PasswordInput label="Create password" placeholder="At least 8 characters" {...register("password")} error={errors.password?.message} />
        <PasswordStrength value={passwordValue} />
      </div>
      <PasswordInput label="Confirm password" placeholder="Repeat your password" {...register("confirmPassword")} error={errors.confirmPassword?.message} />
      <Button type="submit" size="lg" fullWidth>
        Next: Company details
      </Button>
    </form>
  );
}

export function DetailsStep({ onBack, onSubmit }) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(companyDetailsSchema),
    defaultValues: { role: "Recruiter" },
    mode: "onTouched",
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <Input label="Company name" icon="apartment" placeholder="Acme Corp" {...register("companyName")} error={errors.companyName?.message} />
        <Input label="Company website" icon="language" placeholder="acme.com" {...register("website")} error={errors.website?.message} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Select label="Company size" options={SIZES} {...register("size")} error={errors.size?.message} />
        <Select label="Industry" options={INDUSTRIES} {...register("industry")} error={errors.industry?.message} />
      </div>

      <div>
        <p className="mb-1.5 text-sm font-medium text-on-surface">Your role</p>
        <div className="grid grid-cols-3 gap-3">
          {ROLES.map((r) => (
            <label key={r} className="cursor-pointer">
              <input type="radio" value={r} {...register("role")} className="peer sr-only" />
              <div className="rounded-lg border border-slate-200 bg-white p-3 text-center text-sm font-medium text-slate-600 transition-colors peer-checked:border-primary-container peer-checked:bg-primary-fixed/60 peer-checked:text-primary peer-focus-visible:ring-2 peer-focus-visible:ring-primary-container/30">
                {r}
              </div>
            </label>
          ))}
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <Button type="button" variant="secondary" size="lg" onClick={onBack}>
          Back
        </Button>
        <Button type="submit" size="lg" fullWidth loading={isSubmitting}>
          Create workspace
        </Button>
      </div>
    </form>
  );
}