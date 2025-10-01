import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { YearOverYearBadge } from "./year-over-year-badge"
import { UkComparisonText } from "./uk-comparison-text"
import type { RegionData } from '@/types/region-types'

interface AverageLitterKpiCardProps {
  regionData: RegionData
  selectedYear?: number
}

export function AverageLitterKpiCard({ regionData, selectedYear }: AverageLitterKpiCardProps) {
  if (!regionData.litterData) return null

  const { averageLitterPer100m, yearOverYearChange, ukAverageComparison } = regionData.litterData

  return (
    <Card className="@container/card bg-gradient-to-t from-primary/5 to-card shadow-xs">
      <CardHeader>
        <CardDescription>Average Litter per 100m</CardDescription>
        <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
          {averageLitterPer100m.toFixed(1)}
        </CardTitle>
        <YearOverYearBadge change={yearOverYearChange} />
      </CardHeader>
      <CardFooter className="flex-col items-start gap-1.5 text-sm">
        <UkComparisonText ukAverageComparison={ukAverageComparison} />
      </CardFooter>
    </Card>
  )
}
