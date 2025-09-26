import * as React from "react"
import { LitterTrendChart } from "@/components/charts"
import type { RegionData } from '@/types/region-types'

interface AverageLitterChartProps {
  regionData: RegionData
}

export function AverageLitterChart({ regionData }: AverageLitterChartProps) {
  // Get trend data from the API (no dummy data needed)
  const trendData = regionData.litterData?.trendData || []

  if (!regionData.litterData) return null

  return (
    <LitterTrendChart
      data={trendData}
      title="Average Litter Trend (1994-2024)"
      description="Historical trend of average litter per 100m over time"
      averageLitterValue={regionData.litterData.averageLitterPer100m}
      yearOverYearChange={regionData.litterData.yearOverYearChange}
      height={240}
      className="w-full"
    />
  )
}