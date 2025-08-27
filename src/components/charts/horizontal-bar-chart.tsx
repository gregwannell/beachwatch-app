"use client"

import * as React from "react"
import { Bar, BarChart, CartesianGrid, Cell, LabelList, XAxis, YAxis } from "recharts"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { cn } from "@/lib/utils"
import { BarChartProps } from "./types"
import { sortTopItems, formatChartValue } from "./utils"
import { chartColors } from "./chart-config"
import { ChartPatterns, generateChartAriaLabel, generateChartDescription } from "./accessibility"
import { ChartSkeleton } from "./chart-skeleton"
import { ChartError, ChartEmptyState } from "./chart-error"

// Utility function to truncate long item names for labels
function truncateLabel(label: string, maxLength: number = 20): string {
  return label.length > maxLength ? `${label.slice(0, maxLength)}...` : label
}

export function HorizontalBarChart({
  data,
  className,
  height = 250, // Increased slightly to accommodate full names
  maxItems = 5,
  showPercentage = false,
  loading = false,
  error,
  onRetry,
  barThickness = 32, // New prop to control bar thickness
}: BarChartProps) {
  const processedData = React.useMemo(() => {
    if (!data || data.length === 0) return []
    const sorted = sortTopItems(data, maxItems)
    const colors = Object.values(chartColors)
    
    // Add unique colors to each item (matching pie chart pattern)
    return sorted.map((item, index) => ({
      ...item,
      fill: colors[index % colors.length]
    }))
  }, [data, maxItems])

  const chartConfig = React.useMemo(() => {
    const config: ChartConfig = {
      label: {
        color: "hsl(var(--background))",
      },
    }
    
    // Add color configuration for each item (like pie chart)
    processedData.forEach((item) => {
      config[item.name] = {
        label: item.name,
        color: item.fill,
      }
    })
    
    return config
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
          accessibilityLayer
          data={processedData}
          layout="vertical"
          margin={{
            right: 16,
          }}
        >
          <CartesianGrid horizontal={false} />
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
            hide
          />
          <ChartTooltip
            content={<ChartTooltipContent />}
            cursor={false}
          />
          <Bar
            dataKey="value"
            nameKey="name"
            layout="vertical"
            radius={4}
            maxBarSize={barThickness}
          >
            {processedData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
            <LabelList
              dataKey="name"
              position="insideLeft"
              offset={8}
              fill="white"
              fontSize={12}
              fontWeight="500"
              style={{ textShadow: '0 0 3px rgba(0,0,0,0.3)' }}
              formatter={(value: string) => truncateLabel(value, 10)}
            />
            <LabelList
              dataKey="value"
              position="right"
              offset={8}
              className="fill-foreground"
              fontSize={12}
              formatter={(value: number) => formatChartValue(value, false)}
            />
          </Bar>
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