import { Badge } from "@/components/ui/badge"
import { ChevronUp, ChevronDown, Minus } from "lucide-react"

interface YearOverYearBadgeProps {
  change?: number
  variant?: "default" | "glass"
}

export function YearOverYearBadge({ change, variant = "default" }: YearOverYearBadgeProps) {
  if (change === undefined) return null

  const isImprovement = change < 0 // Decrease in litter is improvement
  const isNeutral = Math.abs(change) < 1 // Less than 1% change is neutral

  const symbol = change > 0 ? "+" : ""
  const Icon = isNeutral ? Minus : isImprovement ? ChevronDown : ChevronUp

  // Glass variant for use on gradient backgrounds
  if (variant === "glass") {
    return (
      <Badge variant="outline" className="text-xs font-semibold gap-0.5 px-2 py-1 rounded-full bg-white/15 backdrop-blur-sm border-white/20 text-white">
        <Icon className="w-3 h-3 stroke-[2.5]" />
        {symbol}{change.toFixed(1)}%
      </Badge>
    )
  }

  // Custom styling using MCS brand colors
  const badgeClasses = isNeutral
    ? "bg-neutral text-neutral-foreground"
    : isImprovement
    ? "bg-mcs-green/15 text-mcs-green"
    : "bg-mcs-red/10 text-mcs-red"

  return (
    <Badge variant="outline" className={`text-xs font-semibold gap-0.5 px-1.5 rounded-full ${badgeClasses}`}>
      <Icon className="w-3 h-3 stroke-[2.5]" />
      {symbol}{change.toFixed(1)}%
    </Badge>
  )
}