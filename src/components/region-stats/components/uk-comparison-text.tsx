import { ArrowUpRight, ArrowDownRight, Minus } from "lucide-react"

interface UkComparisonTextProps {
  ukAverageComparison?: {
    ukAverage: number
    percentDifference: number
    multiplier: number
  }
}

export function UkComparisonText({ ukAverageComparison }: UkComparisonTextProps) {
  if (!ukAverageComparison) return null

  const { percentDifference } = ukAverageComparison

  // Check if exactly the same (0% difference)
  const isSame = percentDifference === 0

  // Higher litter is worse, lower is better
  const isHigher = percentDifference > 0

  // Choose icon based on comparison
  const Icon = isSame ? Minus : isHigher ? ArrowUpRight : ArrowDownRight

  // Choose icon and text colors
  const iconColor = isSame
    ? "text-muted-foreground"
    : isHigher
    ? "text-destructive"
    : "text-green-600 dark:text-green-500"

  const textColor = isSame
    ? "text-muted-foreground"
    : isHigher
    ? "text-destructive"
    : "text-green-600 dark:text-green-500"

  // Format the comparison text
  const absPercent = Math.abs(percentDifference).toFixed(0)
  const comparisonText = isSame
    ? `This region's average litter/100m is the same as the UK average`
    : isHigher
    ? `This region's average litter/100m is ${absPercent}% higher than the UK average`
    : `This region's average litter/100m is ${absPercent}% lower than the UK average`

  return (
    <div className="flex items-start gap-2 text-sm">
      <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${iconColor}`} />
      <span className={`line-clamp-2 ${textColor}`}>
        {comparisonText}
      </span>
    </div>
  )
}
