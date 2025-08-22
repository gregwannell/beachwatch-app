"use client"

import * as React from "react"
import { Pie, PieChart as RechartsPieChart, Cell } from "recharts"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart"
import { cn } from "@/lib/utils"
import { PieChartProps } from "./types"
import { calculatePercentages, formatChartValue } from "./utils"
import { createChartConfig, chartColors } from "./chart-config"
import { ChartPatterns, generateChartAriaLabel, generateChartDescription } from "./accessibility"
import { ChartSkeleton } from "./chart-skeleton"
import { ChartError, ChartEmptyState } from "./chart-error"

export function PieChart({
  data,
  className,
  height = 300,
  showLegend = true,
  showPercentage = true,
  loading = false,
  error,
  onRetry,
}: PieChartProps) {
  const processedData = React.useMemo(() => {
    if (!data || data.length === 0) return []
    return calculatePercentages(data)
  }, [data])

  const chartConfig = React.useMemo(() => {
    const itemNames = processedData.map(item => item.name)
    return createChartConfig(itemNames)
  }, [processedData])

  const colors = Object.values(chartColors)

  const dataWithColors = React.useMemo(() => {
    return processedData.map((item, index) => ({
      ...item,
      fill: colors[index % colors.length],
    }))
  }, [processedData, colors])

  const formatTooltip = React.useCallback(
    (value: number, name: string, props: { payload?: { name: string } }) => {
      const item = processedData.find(d => d.name === props.payload?.name)
      if (!item) return null

      const count = formatChartValue(item.value)
      const percentage = formatChartValue(item.percentage || 0, true)
      
      if (showPercentage && item.percentage !== undefined) {
        return [`${count} (${percentage})`, item.name]
      }
      
      return [count, item.name]
    },
    [processedData, showPercentage]
  )

  // Handle loading state
  if (loading) {
    return (
      <ChartSkeleton 
        className={className} 
        height={height} 
        type="pie" 
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
        type="pie"
      />
    )
  }

  // Handle empty data
  if (!data || data.length === 0) {
    return (
      <ChartEmptyState
        className={className}
        height={height}
        message="No data available for breakdown"
        type="pie"
      />
    )
  }

  const ariaLabel = generateChartAriaLabel(processedData, 'pie')
  const description = generateChartDescription(processedData, showPercentage)

  return (
    <div className={cn("w-full", className)}>
      <ChartPatterns />
      <div 
        role="img" 
        aria-label={ariaLabel}
        aria-describedby="pie-chart-description"
        className="relative"
      >
        <ChartContainer
          config={chartConfig}
          className="min-h-[200px] w-full"
          style={{ height }}
        >
        <RechartsPieChart
          margin={{
            top: 20,
            right: 20,
            bottom: 20,
            left: 20,
          }}
        >
          <Pie
            data={dataWithColors}
            cx="50%"
            cy="50%"
            outerRadius={showLegend ? 80 : 100}
            innerRadius={30}
            paddingAngle={2}
            dataKey="value"
            nameKey="name"
          >
            {dataWithColors.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={entry.fill}
                stroke="hsl(var(--background))"
                strokeWidth={2}
              />
            ))}
          </Pie>
          <ChartTooltip
            content={
              <ChartTooltipContent
                formatter={formatTooltip}
                hideLabel={true}
                indicator="dot"
              />
            }
          />
          {showLegend && (
            <ChartLegend
              content={<ChartLegendContent />}
              verticalAlign="bottom"
              height={36}
            />
          )}
        </RechartsPieChart>
        </ChartContainer>
        <div 
          id="pie-chart-description" 
          className="sr-only"
          aria-hidden="true"
        >
          {description}
        </div>
      </div>
    </div>
  )
}