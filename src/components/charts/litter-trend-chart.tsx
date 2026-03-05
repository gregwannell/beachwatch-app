"use client"

import * as React from "react"
import { Area, AreaChart, XAxis, YAxis } from "recharts"
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChartSkeleton } from "./chart-skeleton"
import { ChartError } from "./chart-error"
import type { ChartProps } from "./types"

interface DotProps {
  cx?: number
  cy?: number
  payload?: TrendDataPoint
}

export interface TrendDataPoint {
  year: number
  averageLitterPer100m: number | null
  surveyCount?: number
  date: string
}

type YearRange = "all" | "20y" | "10y"

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
  selectedYear,
  className,
  height = 180,
  loading = false,
  error,
  onRetry,
}: LitterTrendChartProps) {
  const [yearRange, setYearRange] = React.useState<YearRange>("all")

  // Chart configuration
  const chartConfig = {
    averageLitterPer100m: {
      label: "Avg/100m",
      color: "var(--mcs-clear-blue)",
    },
  } satisfies ChartConfig

  // Process and filter data based on year range; use null for years with no surveys
  const chartData = React.useMemo(() => {
    if (!data || data.length === 0) return []

    const sorted = [...data]
      .sort((a, b) => a.year - b.year)
      .map(d => ({
        ...d,
        averageLitterPer100m: d.surveyCount === 0 ? null : d.averageLitterPer100m,
      }))

    if (yearRange === "all") return sorted

    const maxYear = sorted[sorted.length - 1].year
    const cutoff = yearRange === "20y" ? maxYear - 20 : maxYear - 10
    return sorted.filter((d) => d.year >= cutoff)
  }, [data, yearRange])

  // Loading state
  if (loading) {
    return (
      <div className={className}>
        <ChartSkeleton height={height} type="bar" />
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className={className}>
        <ChartError error={error} onRetry={onRetry} type="bar" />
      </div>
    )
  }

  // Empty state
  if (!chartData || chartData.length === 0) {
    return (
      <div className={`flex items-center justify-center ${className}`} style={{ height: `${height / 16}rem` }}>
        <div className="text-center text-muted-foreground">
          <p className="text-sm">No trend data available</p>
        </div>
      </div>
    )
  }

  return (
    <div className={className}>
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="min-w-0">
          <h3 className="text-sm font-medium leading-none">Average litter/100m</h3>
          <p className="text-xs text-muted-foreground mt-1">
            Average number of litter items per 100 metres of beach surveyed each year. Gaps indicate years with no survey data.
          </p>
        </div>
        <Select value={yearRange} onValueChange={(v: YearRange) => setYearRange(v)}>
          <SelectTrigger
            className="w-[130px] shrink-0 rounded-lg text-xs h-8"
            aria-label="Select year range"
          >
            <SelectValue placeholder="All years" />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            <SelectItem value="all" className="rounded-lg text-xs">All years</SelectItem>
            <SelectItem value="20y" className="rounded-lg text-xs">Last 20 years</SelectItem>
            <SelectItem value="10y" className="rounded-lg text-xs">Last 10 years</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <ChartContainer
          config={chartConfig}
          className="w-full"
          style={{ height: `${height / 14}rem` }}
        >
          <AreaChart
            data={chartData}
            margin={{ top: 20, right: 10, left: 10, bottom: 30 }}>
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
              tickLine={false}
              axisLine={false}
              tickMargin={4}
              style={{ fontSize: '0.6875rem' }}
              angle={-45}
              textAnchor="end"
              tickFormatter={(value) => `${value}`}
            />
            <YAxis
              hide={true}
              domain={[0, 'auto']}
            />
            <ChartTooltip
              content={<ChartTooltipContent labelFormatter={(value, payload) => {
                const dataPoint = payload?.[0]?.payload as TrendDataPoint | undefined
                if (!dataPoint?.year) return value
                if (dataPoint.surveyCount === 0) return `${dataPoint.year} — No surveys recorded`
                return `${dataPoint.year}`
              }} />}
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
              connectNulls={false}
              dot={(props: DotProps) => {
                const { cx, cy, payload } = props
                // Only show dot for the selected year
                if (selectedYear && payload?.year === selectedYear) {
                  return (
                    <circle
                      key={`dot-${payload.year}`}
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
