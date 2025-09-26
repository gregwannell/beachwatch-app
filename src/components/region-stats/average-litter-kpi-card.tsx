import { Card, CardAction, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"
import { YearOverYearBadge } from "./year-over-year-badge"
import type { RegionData } from '@/types/region-types'

interface AverageLitterKpiCardProps {
  regionData: RegionData
}

export function AverageLitterKpiCard({ regionData }: AverageLitterKpiCardProps) {
  if (!regionData.litterData) return null

  const { averageLitterPer100m, yearOverYearChange } = regionData.litterData

  // Determine trending context
  const getTrendingText = () => {
    if (yearOverYearChange === undefined) return "No trend data available"

    const isImprovement = yearOverYearChange < 0
    const isNeutral = Math.abs(yearOverYearChange) < 1

    if (isNeutral) {
      return (
        <div className="line-clamp-1 flex gap-2 font-medium">
          Stable levels this period <Minus className="size-4" />
        </div>
      )
    } else if (isImprovement) {
      return (
        <div className="line-clamp-1 flex gap-2 font-medium">
          Improving this period <TrendingDown className="size-4" />
        </div>
      )
    } else {
      return (
        <div className="line-clamp-1 flex gap-2 font-medium">
          Increasing this period <TrendingUp className="size-4" />
        </div>
      )
    }
  }

  return (
    <Card className="@container/card bg-gradient-to-t from-primary/5 to-card shadow-xs">
      <CardHeader>
        <CardDescription>Average Litter per 100m</CardDescription>
        <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
          {averageLitterPer100m.toFixed(1)}
        </CardTitle>
        <CardAction>
          <YearOverYearBadge change={yearOverYearChange} />
        </CardAction>
      </CardHeader>
      <CardFooter className="flex-col items-start gap-1.5 text-sm">
        {getTrendingText()}
        <div className="text-muted-foreground">
          Based on latest survey data
        </div>
      </CardFooter>
    </Card>
  )
}