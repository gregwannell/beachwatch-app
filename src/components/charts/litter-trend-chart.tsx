"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
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
}

export function LitterTrendChart({
  data,
  title = "Average Litter Trend",
  description = "Average litter per 100m over time (1994-2024)",
  averageLitterValue,
  yearOverYearChange: _yearOverYearChange,
  className,
  height = 180,
  loading = false,
  error,
  onRetry,
}: LitterTrendChartProps) {
  // Chart configuration
  const chartConfig = {
    averageLitterPer100m: {
      label: "Average Litter",
      color: "var(--chart-1)",
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
      <Card className={className}>
        <CardHeader>
          <CardTitle className="text-base">{title}</CardTitle>
          {description && <CardDescription className="text-sm">{description}</CardDescription>}
        </CardHeader>
        <CardContent>
          <ChartSkeleton height={height} />
        </CardContent>
      </Card>
    )
  }

  // Error state
  if (error) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="text-base">{title}</CardTitle>
          {description && <CardDescription className="text-sm">{description}</CardDescription>}
        </CardHeader>
        <CardContent>
          <ChartError message={error} onRetry={onRetry} />
        </CardContent>
      </Card>
    )
  }

  // Empty state
  if (!chartData || chartData.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="text-base">{title}</CardTitle>
          {description && <CardDescription className="text-sm">{description}</CardDescription>}
        </CardHeader>
        <CardContent className="flex items-center justify-center" style={{ height }}>
          <div className="text-center text-muted-foreground">
            <p>No trend data available</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={`@container/chart ${className}`}>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
        {description && <CardDescription className="text-sm">{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <div className="bg-background/50 rounded-lg p-4 shadow-sm">
          <ChartContainer
            config={chartConfig}
            className="aspect-auto w-full @[640px]/chart:h-[180px] @[480px]/chart:h-[160px] @max-[480px]/chart:h-[140px]"
            style={{ height }}
          >
            <AreaChart
              data={chartData}
              margin={{ top: 10, right: 10, left: 10, bottom: 10 }}
            >
              <defs>
                <linearGradient id="fillLitter" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="var(--color-averageLitterPer100m)"
                    stopOpacity={0.3}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--color-averageLitterPer100m)"
                    stopOpacity={0.05}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid
                vertical={false}
                strokeDasharray="3 3"
                stroke="var(--muted-foreground)"
                strokeOpacity={0.2}
              />
              <XAxis
                dataKey="year"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={32}
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => value.toString()}
              />
              <ChartTooltip
                content={<ChartTooltipContent />}
                cursor={false}
              />
              <Area
                dataKey="averageLitterPer100m"
                type="monotone"
                fill="url(#fillLitter)"
                stroke="var(--color-averageLitterPer100m)"
                strokeWidth={2}
                dot={false}
              />
            </AreaChart>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  )
}