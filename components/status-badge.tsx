import { Status, statusLabels } from "@/lib/data"
import { cn } from "@/lib/utils"

interface StatusBadgeProps {
  status: Status
}

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        {
          "bg-sky-50 text-sky-700 ring-1 ring-inset ring-sky-600/20":
            status === "to-reach-out",
          "bg-indigo-50 text-indigo-700 ring-1 ring-inset ring-indigo-600/20":
            status === "reached-out",
          "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-600/20":
            status === "waiting",
          "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20":
            status === "scheduled",
          "bg-slate-100 text-slate-600 ring-1 ring-inset ring-slate-500/20":
            status === "done",
        }
      )}
    >
      {statusLabels[status]}
    </span>
  )
}
