"use client"

import * as React from "react"
import { HorizontalBarChart } from "./horizontal-bar-chart"
import type { BarChartData, ChartProps } from "./types"

interface LitterItemData {
  item: {
    id: number
    name: string
    shortName?: string
  }
  total: number
  avgPer100m: number
  presence: number
}

interface TopLitterItemsChartProps extends Omit<ChartProps, 'data'> {
  data: LitterItemData[]
  title?: string
  description?: string
  maxItems?: number
  showAvgPer100m?: boolean
}

export function TopLitterItemsChart({
  data,
  className,
  height = 200,
  title = "Top Litter Items",
  description = "Top litter items by average per 100m",
  maxItems = 5,
  showAvgPer100m = true,
  loading = false,
  error,
  onRetry,
  showPercentage = false,
  showCount = true,
}: TopLitterItemsChartProps) {
  const chartData = React.useMemo((): BarChartData[] => {
    if (!data || data.length === 0) return []
    
    return data
      .slice(0, maxItems)
      .map((item) => ({
        name: item.item.shortName || item.item.name,
        category: item.item.shortName || item.item.name,
        value: showAvgPer100m ? item.avgPer100m : item.total,
        percentage: item.presence,
      }))
  }, [data, maxItems, showAvgPer100m])

  return (
    <div className="space-y-3">
      {title && (
        <div className="space-y-1">
          <h3 className="text-sm font-medium text-muted-foreground">
            {title}
          </h3>
          {description && (
            <p className="text-xs text-muted-foreground">
              {description}
            </p>
          )}
        </div>
      )}
      
      <HorizontalBarChart
        data={chartData}
        className={className}
        height={height}
        maxItems={maxItems}
        showPercentage={showPercentage}
        showCount={showCount}
        loading={loading}
        error={error}
        onRetry={onRetry}
      />
    </div>
  )
}