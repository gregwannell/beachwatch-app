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

  // Custom styling using MCS brand colors
  const badgeClasses = isNeutral
    ? "bg-secondary text-secondary-foreground"
    : isImprovement
    ? "bg-mcs-green/10 text-mcs-green border-mcs-green/30"
    : "bg-mcs-red/10 text-mcs-red border-mcs-red/30"

  return (
    <Badge variant="outline" className={`text-xs font-semibold gap-0.5 px-1.5 rounded-full ${badgeClasses}`}>
      <Icon className="w-3 h-3 stroke-[2.5]" />
      {symbol}{change.toFixed(1)}%
    </Badge>
  )
}