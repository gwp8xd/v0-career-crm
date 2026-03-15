import { Priority, priorityLabels } from "@/lib/data"
import { cn } from "@/lib/utils"

interface PriorityBadgeProps {
  priority: Priority
}

export function PriorityBadge({ priority }: PriorityBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        {
          "bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/20":
            priority === "high",
          "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-600/20":
            priority === "medium",
          "bg-slate-50 text-slate-600 ring-1 ring-inset ring-slate-500/20":
            priority === "low",
        }
      )}
    >
      {priorityLabels[priority]}
    </span>
  )
}
