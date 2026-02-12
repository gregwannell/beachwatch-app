import { Badge } from "@/components/ui/badge"
import { ChevronUp, ChevronDown, Minus } from "lucide-react"
import { cn } from "@/lib/utils"

interface YearOverYearBadgeProps {
  change?: number
  /** Whether an increase in value is a positive outcome.
   *  Default: false (increase = bad, e.g., more litter).
   *  Set to true for engagement metrics (more surveys = good). */
  increaseIsGood?: boolean
  /** Use vivid (solid) variant for coloured/gradient backgrounds */
  vivid?: boolean
  className?: string
}

export function YearOverYearBadge({ change, increaseIsGood = false, vivid = false, className }: YearOverYearBadgeProps) {
  if (change === undefined) return null

  const isNeutral = Math.abs(change) < 1
  const isIncrease = change > 0

  const symbol = change > 0 ? "+" : ""
  const Icon = isNeutral ? Minus : isIncrease ? ChevronUp : ChevronDown

  // Determine semantic outcome based on context
  const base = isNeutral
    ? "neutral"
    : (isIncrease === increaseIsGood) ? "positive" : "negative"

  const badgeVariant = vivid ? `${base}-vivid` as const : base

  return (
    <Badge variant={badgeVariant} className={cn("text-xs font-semibold gap-0.5 px-1.5 rounded-full", className)}>
      <Icon className="w-3 h-3 stroke-[2.5]" />
      {symbol}{change.toFixed(1)}%
    </Badge>
  )
}