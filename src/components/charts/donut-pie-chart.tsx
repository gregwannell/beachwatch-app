"use client"

import * as React from "react"
import { Label, Pie, PieChart } from "recharts"

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { YearOverYearBadge } from "@/components/region-stats/components/year-over-year-badge"

interface DonutPieChartData {
  name: string
  value: number
  percentage?: number
  fill: string
  yearOverYearChange?: number
}

interface DonutPieChartProps {
  data: DonutPieChartData[]
  title?: string
  description?: string
  className?: string
  height?: number
  centerLabel?: string
  animationDuration?: number
  animationEasing?: "linear" | "ease" | "ease-in" | "ease-out" | "ease-in-out"
}

export function DonutPieChart({
  data,
  title,
  description,
  className,
  height = 300,
  centerLabel = "Avg/100m",
  animationDuration = 800,
  animationEasing = "ease-out"
}: DonutPieChartProps) {
  const totalValue = React.useMemo(() => {
    return data.reduce((acc, curr) => acc + curr.value, 0)
  }, [data])

  // Create chart config from data
  const chartConfig = React.useMemo(() => {
    const config: ChartConfig = {}

    data.forEach((item) => {
      config[item.name] = {
        label: item.name,
        color: item.fill,
      }
    })

    return config
  }, [data])

  if (!data || data.length === 0) {
    return (
      <div className={className}>
        <div className="flex items-center justify-center h-[200px]">
          <div className="text-center text-muted-foreground">
            <p>No data available</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={className}>
      <div className="flex-1">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[250px]"
          style={{ height }}
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  indicator="line"
                  nameKey="name"
                  formatter={(value, name) => {
                    const itemData = data.find(item => item.name === name)
                    const percentage = itemData?.percentage !== undefined
                      ? itemData.percentage
                      : ((itemData?.value || 0) / totalValue) * 100
                    return `${name}: ${percentage.toFixed(1)}%`
                  }}
                />
              }
            />
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius={60}
              strokeWidth={5}
              animationDuration={animationDuration}
              animationEasing={animationEasing}
            />

          </PieChart>
        </ChartContainer>

        {/* Data Table */}
        <div className>
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
            <span>{title?.replace('Breakdown', '') || 'Item'}</span>
            <span>Avg/100m / Share</span>
          </div>
          <ul className="divide-y divide-border text-sm">
            {data.map((item) => {
              return (
                <li
                  key={item.name}
                  className="flex items-center justify-between space-x-6 py-2"
                >
                  <div className="flex items-center gap-2 truncate min-w-0">
                    <span
                      className="size-2.5 shrink-0 rounded-sm"
                      style={{ backgroundColor: item.fill }}
                      aria-hidden="true"
                    />
                    <span className="truncate">{item.name}</span>
                    {item.yearOverYearChange !== undefined && (
                      <div className="scale-75 origin-left">
                        <YearOverYearBadge change={item.yearOverYearChange} />
                      </div>
                    )}
                  </div>
                  <div className="flex items-center space-x-2 shrink-0">
                    <span className="font-medium tabular-nums">
                      {item.value % 1 === 0
                        ? item.value.toLocaleString()
                        : item.value.toFixed(1)}
                    </span>
                    <span className="rounded-md bg-muted px-1.5 py-0.5 text-xs font-medium tabular-nums">
                      {item.percentage !== undefined
                        ? `${item.percentage.toFixed(1)}%`
                        : `${((item.value / totalValue) * 100).toFixed(1)}%`}
                    </span>
                  </div>
                </li>
              )
            })}
          </ul>
        </div>
      </div>
    </div>
  )
}
