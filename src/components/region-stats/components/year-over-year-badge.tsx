import { Badge } from "@/components/ui/badge"
import { ChevronUp, ChevronDown, Minus } from "lucide-react"
import { cn } from "@/lib/utils"

interface YearOverYearBadgeProps {
  change?: number
  /** Whether an increase in value is a positive outcome.
   *  Default: false (increase = bad, e.g., more litter).
   *  Set to true for engagement metrics (more surveys = good). */
  increaseIsGood?: boolean
  /** Visual style: "badge" (default) shows pill with background, "plain" shows coloured text only, "vivid" shows solid filled pill */
  variant?: "badge" | "plain" | "vivid"
  className?: string
}

export function YearOverYearBadge({ change, increaseIsGood = false, variant = "badge", className }: YearOverYearBadgeProps) {
  if (change === undefined) return null

  const isNeutral = Math.abs(change) < 1
  const isIncrease = change > 0

  const symbol = change > 0 ? "+" : ""
  const Icon = isNeutral ? Minus : isIncrease ? ChevronUp : ChevronDown

  const base = isNeutral
    ? "neutral"
    : (isIncrease === increaseIsGood) ? "positive" : "negative"

  if (variant === "plain") {
    const textColour = base === "positive"
      ? "text-mcs-green"
      : base === "negative"
        ? "text-mcs-red"
        : "text-muted-foreground"

    return (
      <span className={cn("inline-flex items-center gap-0.5 text-xs font-semibold tabular-nums", textColour, className)}>
        <Icon className="w-3 h-3 stroke-[2.5]" />
        {symbol}{change.toFixed(0)}%
      </span>
    )
  }

  const badgeVariant = variant === "vivid" ? `${base}-vivid` as const : base

  return (
    <Badge variant={badgeVariant} className={cn("text-xs font-semibold gap-0.5 px-1.5 rounded-full", className)}>
      <Icon className="w-3 h-3 stroke-[2.5]" />
      {symbol}{change.toFixed(0)}%
    </Badge>
  )
}
