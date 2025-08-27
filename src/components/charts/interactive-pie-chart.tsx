"use client"

import * as React from "react"
import { Label, Pie, PieChart, Sector } from "recharts"
import { PieSectorDataItem } from "recharts/types/polar/Pie"

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
  ChartStyle,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface InteractivePieChartData {
  name: string
  value: number
  percentage?: number
  fill: string
}

interface InteractivePieChartProps {
  data: InteractivePieChartData[]
  title: string
  description?: string
  className?: string
  height?: number
}

export function InteractivePieChart({
  data,
  title,
  description,
  className,
  height = 300
}: InteractivePieChartProps) {
  const id = React.useId()
  const [activeItem, setActiveItem] = React.useState(data[0]?.name || "")

  // Update activeItem when data changes
  React.useEffect(() => {
    if (data && data.length > 0 && (!activeItem || !data.find(item => item.name === activeItem))) {
      setActiveItem(data[0].name)
    }
  }, [data, activeItem])

  const activeIndex = React.useMemo(
    () => data.findIndex((item) => item.name === activeItem),
    [data, activeItem]
  )

  // Create chart config with simple name-based keys
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

  const items = React.useMemo(() => data.map((item) => item.name), [data])

  if (!data || data.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[200px]">
          <div className="text-center text-muted-foreground">
            <p>No data available</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const activeData = data[activeIndex] || data[0]

  return (
    <Card data-chart={id} className={`flex flex-col ${className}`}>
      <ChartStyle id={id} config={chartConfig} />
      <CardHeader className="flex-row items-start space-y-0 pb-0">
        <div className="grid gap-1">
          <CardTitle className="text-base">{title}</CardTitle>
          {description && <CardDescription className="text-sm">{description}</CardDescription>}
        </div>
        <Select value={activeItem} onValueChange={setActiveItem}>
          <SelectTrigger
            className="ml-auto h-7 w-[170px] rounded-lg pl-2.5"
            aria-label="Select a value"
          >
            <SelectValue placeholder="Select item" />
          </SelectTrigger>
          <SelectContent align="end" className="rounded-xl">
            {items.map((itemName) => {
              const config = chartConfig[itemName as keyof typeof chartConfig]

              if (!config) {
                return null
              }

              return (
                <SelectItem
                  key={itemName}
                  value={itemName}
                  className="rounded-lg [&_span]:flex"
                >
                  <div className="flex items-center gap-2 text-xs">
                    <span
                      className="flex h-3 w-3 shrink-0 rounded-xs"
                      style={{
                        backgroundColor: config.color,
                      }}
                    />
                    {config?.label}
                  </div>
                </SelectItem>
              )
            })}
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="flex flex-1 justify-center pb-0">
        <ChartContainer
          id={id}
          config={chartConfig}
          className="mx-auto aspect-square w-full max-w-[220px]"
        >
          <PieChart>
            <ChartTooltip
              content={<ChartTooltipContent />}
              cursor={false}
            />
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius={60}
              strokeWidth={5}
              activeIndex={activeIndex}
              activeShape={({
                outerRadius = 0,
                ...props
              }: PieSectorDataItem) => (
                <g>
                  <Sector {...props} outerRadius={outerRadius + 10} />
                  <Sector
                    {...props}
                    outerRadius={outerRadius + 25}
                    innerRadius={outerRadius + 12}
                  />
                </g>
              )}
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
                          {activeData.value.toLocaleString()}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 24}
                          className="fill-muted-foreground"
                        >
                          {activeData.percentage !== undefined 
                            ? `${activeData.percentage.toFixed(1)}%`
                            : "Items"
                          }
                        </tspan>
                      </text>
                    )
                  }
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}