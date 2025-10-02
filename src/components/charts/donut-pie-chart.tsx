"use client"

import * as React from "react"
import { Label, Pie, PieChart } from "recharts"
import { ArrowUp, ArrowDown, Minus } from "lucide-react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { Badge } from "@/components/ui/badge"

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
}

export function DonutPieChart({
  data,
  title,
  description,
  className,
  height = 300,
  centerLabel = "Avg/100m"
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
      <Card className={className}>

        <CardContent className="flex items-center justify-center h-[200px]">
          <div className="text-center text-muted-foreground">
            <p>No data available</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={`flex flex-col pt-0 ${className}`}>
      <CardContent className="flex-1">
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
                />
              }
            />
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius={60}
              strokeWidth={5}
            >
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className="fill-foreground text-3xl font-bold"
                        >
                          {totalValue % 1 === 0
                            ? totalValue.toLocaleString()
                            : totalValue.toFixed(1)
                          }
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 24}
                          className="fill-muted-foreground"
                        >
                          {centerLabel}
                        </tspan>
                      </text>
                    )
                  }
                }}
              />
            </Pie>
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
              const isImprovement = item.yearOverYearChange !== undefined && item.yearOverYearChange < 0
              const isNeutral = item.yearOverYearChange !== undefined && Math.abs(item.yearOverYearChange) < 1
              const Icon = isNeutral ? Minus : isImprovement ? ArrowDown : ArrowUp

              const badgeClasses = isNeutral
                ? "bg-secondary text-secondary-foreground"
                : isImprovement
                ? "bg-green-50 text-green-600 border-green-200/60 dark:bg-green-950/60 dark:text-green-400 dark:border-green-900"
                : "bg-red-50 text-red-600 border-red-200/60 dark:bg-red-950/60 dark:text-red-400 dark:border-red-900"

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
                      <Badge variant="outline" className={`text-[10px] font-semibold gap-0.5 px-1 py-0 rounded-full ${badgeClasses}`}>
                        <Icon className="w-2.5 h-2.5 stroke-[2.5]" />
                        {item.yearOverYearChange > 0 ? '+' : ''}{item.yearOverYearChange.toFixed(1)}%
                      </Badge>
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
      </CardContent>
    </Card>
  )
}
