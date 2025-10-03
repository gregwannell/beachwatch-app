"use client"

import * as React from "react"
import { DonutPieChart } from "./donut-pie-chart"
import { chartColors } from "./chart-config"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface MaterialBreakdownItem {
  material: string
  avgPer100m: number
  percentage: number
  yearOverYearChange?: number
}

interface SourceBreakdownItem {
  source: string
  avgPer100m: number
  percentage: number
  yearOverYearChange?: number
}

interface LitterBreakdownChartProps {
  materialBreakdown: MaterialBreakdownItem[]
  sourceBreakdown: SourceBreakdownItem[]
  className?: string
  height?: number
  title?: string
  description?: string
}

export function LitterBreakdownChart({
  materialBreakdown,
  sourceBreakdown,
  className,
  height = 250,
  title = "Litter Breakdown",
  description = "Breakdown by material type and source",
}: LitterBreakdownChartProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        {description && (
          <CardDescription className="text-xs">
            {description}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="material" className="w-full">
          <TabsList>
            <TabsTrigger value="material">By Material</TabsTrigger>
            <TabsTrigger value="source">By Source</TabsTrigger>
          </TabsList>

          <TabsContent value="material" className="mt-4">
            {materialBreakdown.length > 0 ? (
              <DonutPieChart
                data={materialBreakdown.map((item, index) => ({
                  name: item.material,
                  value: item.avgPer100m,
                  percentage: item.percentage,
                  fill: Object.values(chartColors)[index % Object.values(chartColors).length],
                  yearOverYearChange: item.yearOverYearChange,
                }))}
                height={height}
                centerLabel="Avg/100m"
                className="w-full"
              />
            ) : (
              <div className="text-sm text-muted-foreground text-center py-8">
                No material breakdown data available
              </div>
            )}
          </TabsContent>

          <TabsContent value="source" className="mt-4">
            {sourceBreakdown.length > 0 ? (
              <DonutPieChart
                data={sourceBreakdown.map((item, index) => ({
                  name: item.source,
                  value: item.avgPer100m,
                  percentage: item.percentage,
                  fill: Object.values(chartColors)[index % Object.values(chartColors).length],
                  yearOverYearChange: item.yearOverYearChange,
                }))}
                height={height}
                centerLabel="Avg/100m"
                className="w-full"
              />
            ) : (
              <div className="text-sm text-muted-foreground text-center py-8">
                No source breakdown data available
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
