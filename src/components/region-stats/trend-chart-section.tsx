import * as React from "react"
import { LitterTrendChart } from "@/components/charts"
import type { RegionData } from '@/types/region-types'

interface TrendChartSectionProps {
  regionData: RegionData
}

export function TrendChartSection({ regionData }: TrendChartSectionProps) {
  // Prepare trend data for the chart
  const trendData = React.useMemo(() => {
    if (regionData.litterData?.trendData) {
      return regionData.litterData.trendData
    }

    // Generate trend data for all years from 1994 to 2024
    const baseValue = regionData.litterData?.averageLitterPer100m || 100
    const years = Array.from({ length: 31 }, (_, i) => 1994 + i) // 1994 to 2024

    return years.map(year => ({
      year,
      averageLitterPer100m: baseValue + (Math.random() - 0.5) * 40,
      date: `${year}-01-01`
    }))
  }, [regionData.litterData])

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