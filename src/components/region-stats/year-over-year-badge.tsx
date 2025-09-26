import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"

interface YearOverYearBadgeProps {
  change?: number
}

export function YearOverYearBadge({ change }: YearOverYearBadgeProps) {
  if (change === undefined) return null

  const isImprovement = change < 0 // Decrease in litter is improvement
  const isNeutral = Math.abs(change) < 1 // Less than 1% change is neutral

  const variant = isNeutral ? "secondary" : isImprovement ? "default" : "destructive"
  const symbol = change > 0 ? "+" : ""
  const Icon = isNeutral ? Minus : isImprovement ? TrendingDown : TrendingUp

  return (
    <Badge variant={variant} className="text-xs">
      <Icon className="w-3 h-3 mr-1" />
      {symbol}{change.toFixed(1)}%
    </Badge>
  )
}