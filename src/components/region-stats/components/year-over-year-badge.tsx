import { Badge } from "@/components/ui/badge"
import { ChevronUp, ChevronDown, Minus } from "lucide-react"

interface YearOverYearBadgeProps {
  change?: number
}

export function YearOverYearBadge({ change }: YearOverYearBadgeProps) {
  if (change === undefined) return null

  const isImprovement = change < 0 // Decrease in litter is improvement
  const isNeutral = Math.abs(change) < 1 // Less than 1% change is neutral

  const symbol = change > 0 ? "+" : ""
  const Icon = isNeutral ? Minus : isImprovement ? ChevronDown : ChevronUp

  // Custom styling for light pastel backgrounds
  const badgeClasses = isNeutral
    ? "bg-secondary text-secondary-foreground"
    : isImprovement
    ? "bg-green-50 text-green-600 border-green-200/60 dark:bg-green-950/60 dark:text-green-400 dark:border-green-900"
    : "bg-red-50 text-red-600 border-red-200/60 dark:bg-red-950/60 dark:text-red-400 dark:border-red-900"

  return (
    <div className="flex items-center gap-1.5">
      <Badge variant="outline" className={`text-xs font-semibold gap-0.5 px-1.5 rounded-full ${badgeClasses}`}>
        <Icon className="w-3 h-3 stroke-[2.5]" />
        {symbol}{change.toFixed(1)}%
      </Badge>
      <span className="text-xs text-muted-foreground">vs previous year</span>
    </div>
  )
}