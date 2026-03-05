"use client"

import * as React from "react"
import { Pie, PieChart } from "recharts"

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { YearOverYearBadge } from "@/components/region-stats/components/year-over-year-badge"

interface DonutPieChartData {
  name: string
  value: number
  total?: number
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
  className,
  height = 300,
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
        <div className="flex items-center justify-center h-[12.5rem]">
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
          className="mx-auto aspect-square"
          style={{ height: `${height / 16}rem`, maxHeight: `${height / 16}rem` }}
        >
          <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  indicator="line"
                  nameKey="name"
                  formatter={(_value, name) => {
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
        <div className="rounded-lg border overflow-auto mt-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="text-xs text-muted-foreground/50 h-8 px-3">Item</TableHead>
                <TableHead className="text-xs text-muted-foreground/50 h-8 px-3">Total</TableHead>
                <TableHead className="text-xs text-muted-foreground/50 h-8 px-3">Avg/100m</TableHead>
                <TableHead className="text-xs text-muted-foreground/50 h-8 px-3">Share</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((item) => (
                <TableRow key={item.name} className="text-xs">
                  <TableCell className="px-3 py-2 font-medium">
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className="size-2.5 shrink-0 rounded-sm"
                        style={{ backgroundColor: item.fill }}
                        aria-hidden="true"
                      />
                      <span className="truncate">{item.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="px-3 py-2 tabular-nums">
                    {item.total != null ? item.total.toLocaleString() : '—'}
                  </TableCell>
                  <TableCell className="px-3 py-2">
                    <div className="flex items-center gap-1.5">
                      <span className="tabular-nums">
                        {item.value % 1 === 0 ? item.value.toLocaleString() : item.value.toFixed(1)}
                      </span>
                      <YearOverYearBadge change={item.yearOverYearChange} variant="plain" className="text-[11px]" />
                    </div>
                  </TableCell>
                  <TableCell className="px-3 py-2 tabular-nums">
                    {item.percentage !== undefined
                      ? `${item.percentage.toFixed(1)}%`
                      : `${((item.value / totalValue) * 100).toFixed(1)}%`}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}
