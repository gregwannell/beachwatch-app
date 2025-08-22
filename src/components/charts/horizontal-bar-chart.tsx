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
import { calculatePercentages, sortTopItems, formatChartValue } from "./utils"
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
    return calculatePercentages(sorted)
  }, [data, maxItems])

  const chartConfig = React.useMemo(() => {
    const itemNames = processedData.map(item => item.name)
    return createChartConfig(itemNames)
  }, [processedData])

  const formatTooltip = React.useCallback(
    (value: number, name: string, props: { payload?: { name: string } }) => {
      const item = processedData.find(d => d.name === props.payload?.name)
      if (!item) return null

      const displayValue = showPercentage ? item.percentage : value
      const formattedValue = formatChartValue(displayValue || 0, showPercentage)
      
      return [formattedValue, item.name]
    },
    [processedData, showPercentage]
  )

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
          layout="horizontal"
          margin={{
            top: 20,
            right: 30,
            left: 40,
            bottom: 5,
          }}
        >
          <XAxis
            type="number"
            axisLine={false}
            tickLine={false}
            tickFormatter={(value) => formatChartValue(value, showPercentage)}
          />
          <YAxis
            type="category"
            dataKey="name"
            axisLine={false}
            tickLine={false}
            width={100}
            className="text-xs"
          />
          <ChartTooltip
            cursor={{ fill: "hsl(var(--primary))", opacity: 0.1 }}
            content={
              <ChartTooltipContent
                formatter={formatTooltip}
                hideLabel={false}
                indicator="line"
                className="rounded-lg border shadow-lg bg-card"
              />
            }
          />
          <Bar
            dataKey={showPercentage ? "percentage" : "value"}
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