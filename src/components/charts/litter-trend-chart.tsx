"use client"

import * as React from "react"
import { Area, AreaChart, XAxis, YAxis } from "recharts"
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { ChartSkeleton } from "./chart-skeleton"
import { ChartError } from "./chart-error"
import type { ChartProps } from "./types"

export interface TrendDataPoint {
  year: number
  averageLitterPer100m: number
  date: string
}

export interface LitterTrendChartProps extends Omit<ChartProps, 'data'> {
  data: TrendDataPoint[]
  title?: string
  description?: string
  averageLitterValue?: number // Current average value to display
  yearOverYearChange?: number // Year-over-year change percentage
  selectedYear?: number // Highlight this year on the chart
}

export function LitterTrendChart({
  data,
  yearOverYearChange: _yearOverYearChange,
  selectedYear,
  className,
  height = 180,
  loading = false,
  error,
  onRetry,
}: LitterTrendChartProps) {
  // Chart configuration
  const chartConfig = {
    averageLitterPer100m: {
      label: "Litter per 100m",
      color: "var(--mcs-clear-blue)",
    },
  } satisfies ChartConfig

  // Process data if available
  const chartData = React.useMemo(() => {
    if (data && data.length > 0) {
      return data.sort((a, b) => a.year - b.year)
    }
    return []
  }, [data])

  // Loading state
  if (loading) {
    return (
      <div className={className}>
        <ChartSkeleton height={height} />
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className={className}>
        <ChartError message={error} onRetry={onRetry} />
      </div>
    )
  }

  // Empty state
  if (!chartData || chartData.length === 0) {
    return (
      <div className={`flex items-center justify-center ${className}`} style={{ height }}>
        <div className="text-center text-muted-foreground">
          <p className="text-sm">No trend data available</p>
        </div>
      </div>
    )
  }

  return (
    <div className={className}>
      <ChartContainer
        config={chartConfig}
        className="w-full"
        style={{ height }}
      >
        <AreaChart
          data={chartData}
          margin={{ top: 0, right: 10, left: 10, bottom: 0 }}
        >
          <defs>
            <linearGradient id="fillLitter" x1="0" y1="0" x2="0" y2="1">
              <stop
                key="stop-1"
                offset="5%"
                stopColor="var(--color-averageLitterPer100m)"
                stopOpacity={0.8}
              />
              <stop
                key="stop-2"
                offset="95%"
                stopColor="var(--color-averageLitterPer100m)"
                stopOpacity={0.1}
              />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="year"
            hide={true}
          />
          <YAxis
            hide={true}
          />
          <ChartTooltip
            content={<ChartTooltipContent />}
            cursor={{
              stroke: "var(--color-averageLitterPer100m)",
              strokeWidth: 1,
              strokeDasharray: "4 4",
            }}
          />
          <Area
            dataKey="averageLitterPer100m"
            type="natural"
            fill="url(#fillLitter)"
            stroke="var(--color-averageLitterPer100m)"
            dot={(props: any) => {
              const { cx, cy, payload } = props
              // Only show dot for the selected year
              if (selectedYear && payload.year === selectedYear) {
                return (
                  <circle
                    cx={cx}
                    cy={cy}
                    r={6}
                    fill="var(--color-averageLitterPer100m)"
                    stroke="white"
                    strokeWidth={2}
                    className="animate-pulse"
                  />
                )
              }
              return null
            }}
          />
        </AreaChart>
      </ChartContainer>
    </div>
  )
}