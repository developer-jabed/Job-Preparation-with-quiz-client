interface StatCardProps {
  label: string;
  value: number | string;
  tone?: "ink" | "amber" | "emerald" | "violet" | "rose";
  icon?: React.ReactNode;
}

const toneMap = {
  ink: {
    bg: "bg-slate-900 dark:bg-slate-800",
    text: "text-white",
    label: "text-slate-300",
    border: "border-slate-700 dark:border-slate-600",
    iconBg: "bg-slate-800 dark:bg-slate-700",
  },
  amber: {
    bg: "bg-amber-50 dark:bg-amber-950/40",
    text: "text-amber-700 dark:text-amber-300",
    label: "text-amber-600/80 dark:text-amber-400/80",
    border: "border-amber-200 dark:border-amber-800/60",
    iconBg: "bg-amber-100 dark:bg-amber-900/50",
  },
  emerald: {
    bg: "bg-emerald-50 dark:bg-emerald-950/40",
    text: "text-emerald-700 dark:text-emerald-300",
    label: "text-emerald-600/80 dark:text-emerald-400/80",
    border: "border-emerald-200 dark:border-emerald-800/60",
    iconBg: "bg-emerald-100 dark:bg-emerald-900/50",
  },
  violet: {
    bg: "bg-violet-50 dark:bg-violet-950/40",
    text: "text-violet-700 dark:text-violet-300",
    label: "text-violet-600/80 dark:text-violet-400/80",
    border: "border-violet-200 dark:border-violet-800/60",
    iconBg: "bg-violet-100 dark:bg-violet-900/50",
  },
  rose: {
    bg: "bg-rose-50 dark:bg-rose-950/40",
    text: "text-rose-700 dark:text-rose-300",
    label: "text-rose-600/80 dark:text-rose-400/80",
    border: "border-rose-200 dark:border-rose-800/60",
    iconBg: "bg-rose-100 dark:bg-rose-900/50",
  },
};

export function StatCard({ label, value, tone = "ink", icon }: StatCardProps) {
  const t = toneMap[tone];

  return (
    <div
      className={`relative flex min-w-[140px] flex-col gap-3 rounded-2xl border ${t.border} ${t.bg} p-5 shadow-sm transition hover:shadow-md`}
    >
      <div className="flex items-start justify-between">
        <div className={`rounded-xl p-2.5 ${t.iconBg}`}>{icon}</div>
      </div>
      <div>
        <p className={`font-display text-3xl font-semibold tracking-tight ${t.text}`}>
          {value}
        </p>
        <p className={`mt-1 text-xs font-medium ${t.label}`}>{label}</p>
      </div>
    </div>
  );
}