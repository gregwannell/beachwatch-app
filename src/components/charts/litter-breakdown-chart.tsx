"use client"

import * as React from "react"
import { useState, useEffect } from "react"
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
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer"
import { Button } from "@/components/ui/button"
import { Info } from "lucide-react"

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
  const [isOpen, setIsOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  // Detect screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768) // md breakpoint
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Shared content for both Drawer and Dialog
  const explanationContent = (
    <div className="text-sm text-muted-foreground space-y-3">
      <p className="font-semibold">How is litter categorized?</p>
      <p className="text-sm">
        <strong>Material Type:</strong> Litter is grouped by what it&apos;s made from - such as plastic, glass, metal, cloth, or rubber. This helps us understand which materials contribute most to beach pollution.
      </p>
      <p className="text-sm">
        <strong>Source:</strong> Litter is categorized by where it likely came from - such as public littering, fishing activities, shipping, sewage-related debris, or fly-tipped items. Identifying sources helps target prevention efforts.
      </p>
      <p className="text-sm">
        Both breakdowns show the average amount per 100m and the share (percentage) that category represents of all litter found in this region.
      </p>
    </div>
  )

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <div className="flex-1">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {title}
            </CardTitle>
            {description && (
              <CardDescription className="text-xs">
                {description}
              </CardDescription>
            )}
          </div>

          {/* Conditionally render Drawer (mobile) or Dialog (desktop) */}
          {isMobile ? (
            <Drawer open={isOpen} onOpenChange={setIsOpen}>
              <DrawerTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto w-auto p-1 hover:bg-primary/10"
                  aria-label="View breakdown information"
                >
                  <Info className="h-4 w-4 text-muted-foreground" />
                </Button>
              </DrawerTrigger>
              <DrawerContent>
                <DrawerHeader>
                  <DrawerTitle>Litter Breakdown Categories</DrawerTitle>
                  <DrawerDescription>Understanding material types and sources</DrawerDescription>
                </DrawerHeader>
                <div className="px-4 pb-6">
                  {explanationContent}
                </div>
              </DrawerContent>
            </Drawer>
          ) : (
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto w-auto p-1 hover:bg-primary/10"
                  aria-label="View breakdown information"
                >
                  <Info className="h-4 w-4 text-muted-foreground" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Litter Breakdown Categories</DialogTitle>
                  <DialogDescription>Understanding material types and sources</DialogDescription>
                </DialogHeader>
                {explanationContent}
              </DialogContent>
            </Dialog>
          )}
        </div>
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
