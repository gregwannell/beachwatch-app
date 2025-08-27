"use client"

import * as React from "react"
import { Bar, BarChart, XAxis, YAxis } from "recharts"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { cn } from "@/lib/utils"
import { BarChartProps } from "./types"
import { sortTopItems } from "./utils"
import { createChartConfig } from "./chart-config"
import { ChartPatterns, generateChartAriaLabel, generateChartDescription } from "./accessibility"
import { ChartSkeleton } from "./chart-skeleton"
import { ChartError, ChartEmptyState } from "./chart-error"

export function HorizontalBarChart({
  data,
  className,
  height = 300,
  maxItems = 5,
  showPercentage = false,
  showCount = true,
  loading = false,
  error,
  onRetry,
}: BarChartProps) {
  const processedData = React.useMemo(() => {
    if (!data || data.length === 0) return []
    const sorted = sortTopItems(data, maxItems)
    // Don't calculate percentages here - use raw values for proper scaling
    return sorted
  }, [data, maxItems])

  const chartConfig = React.useMemo(() => {
    const itemNames = processedData.map(item => item.name)
    return createChartConfig(itemNames)
  }, [processedData])


  // Handle loading state
  if (loading) {
    return (
      <ChartSkeleton 
        className={className} 
        height={height} 
        type="bar" 
      />
    )
  }

  // Handle error state
  if (error) {
    return (
      <ChartError
        className={className}
        height={height}
        error={error}
        onRetry={onRetry}
        type="bar"
      />
    )
  }

  // Handle empty data
  if (!data || data.length === 0) {
    return (
      <ChartEmptyState
        className={className}
        height={height}
        message="No litter data available to display"
        type="bar"
      />
    )
  }

  const ariaLabel = generateChartAriaLabel(processedData, 'bar')
  const description = generateChartDescription(processedData, showPercentage)

  return (
    <div className={cn("w-full", className)}>
      <ChartPatterns />
      <div 
        role="img" 
        aria-label={ariaLabel}
        aria-describedby="chart-description"
        className="relative"
      >
        <ChartContainer
          config={chartConfig}
          className="min-h-[200px] w-full rounded-lg border bg-card shadow-sm"
          style={{ height }}
        >
        <BarChart
          data={processedData}
          layout="vertical"
          margin={{
            left: -20,
          }}
        >
          <XAxis
            type="number"
            dataKey="value"
            hide
          />
          <YAxis
            dataKey="name"
            type="category"
            tickLine={false}
            tickMargin={10}
            axisLine={false}
            className="text-xs"
          />
          <ChartTooltip
            cursor={false}
            content={<ChartTooltipContent hideLabel />}
          />
          <Bar
            dataKey="value"
            fill="hsl(var(--chart-1))"
            radius={[0, 4, 4, 0]}
          />
        </BarChart>
        </ChartContainer>
        <div 
          id="chart-description" 
          className="sr-only"
          aria-hidden="true"
        >
          {description}
        </div>
      </div>
    </div>
  )
}