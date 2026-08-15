import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

export function StatCard({
  label,
  value,
  icon: Icon,
  accent = false
}: {
  label: string;
  value: string | number;
  icon: LucideIcon;
  accent?: boolean;
}) {
  return (
    <div className={cn("rounded-2xl border p-5", accent ? "border-violet/30 bg-violet/[0.06]" : "border-border bg-surface")}>
      <div className="mb-3 flex items-center justify-between">
        <p className="text-xs font-medium uppercase tracking-wider text-text-faint">{label}</p>
        <Icon className={cn("h-4 w-4", accent ? "text-violet-light" : "text-text-faint")} />
      </div>
      <p className="font-display text-2xl font-extrabold text-text">{value}</p>
    </div>
  );
}
