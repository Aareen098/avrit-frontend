import Icon from "@/components/common/Icon";

// Right-hand indigo panel. Hidden on phones and tablets.
export default function AuthPanel({ title, text, features = [] }) {
  return (
    <aside className="relative hidden overflow-hidden bg-gradient-to-br from-[#1e1b4b] via-[#312e81] to-[#4338ca] p-12 text-white lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-col lg:justify-center">
      <div className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-indigo-400/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -left-16 h-96 w-96 rounded-full bg-violet-500/20 blur-3xl" />

      <div className="relative mx-auto w-full max-w-xl">
        <h2 className="text-4xl font-semibold tracking-tight">{title}</h2>
        <p className="mt-4 text-lg leading-relaxed text-indigo-100">{text}</p>

        <div className="mt-10 space-y-3">
          {features.map((f) => (
            <div
              key={f.title}
              className="flex gap-4 rounded-xl border border-white/10 bg-white/10 p-5 backdrop-blur-sm"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/15 text-emerald-300">
                <Icon name={f.icon} />
              </div>
              <div>
                <h3 className="font-semibold">{f.title}</h3>
                <p className="mt-0.5 text-sm text-indigo-100">{f.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}