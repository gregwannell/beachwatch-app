"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { HorizontalBarChart } from "./horizontal-bar-chart"
import type { BarChartData, ChartProps } from "./types"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer"
import { Button } from "@/components/ui/button"
import { Info } from "lucide-react"

interface LitterItemData {
  item: {
    id: number
    name: string
    shortName?: string
  }
  total: number
  avgPer100m: number
  presence: number
}

interface TopLitterItemsChartProps extends Omit<ChartProps, 'data'> {
  data: LitterItemData[]
  title?: string
  description?: string
  maxItems?: number
  showAvgPer100m?: boolean
  barThickness?: number // Controls the thickness of individual bars
}

export function TopLitterItemsChart({
  data,
  className,
  height = 220,
  title = "Top 5 Litter Items",
  description = "Top litter items by average per 100m",
  maxItems = 5,
  showAvgPer100m = true,
  loading = false,
  error,
  onRetry,
  showPercentage = false,
  showCount = true,
  barThickness = 32, // Default bar thickness
}: TopLitterItemsChartProps) {
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

  const chartData = React.useMemo((): BarChartData[] => {
    if (!data || data.length === 0) return []

    return data
      .slice(0, maxItems)
      .map((item) => ({
        name: item.item.shortName || item.item.name,
        category: item.item.shortName || item.item.name,
        value: showAvgPer100m ? item.avgPer100m : item.total,
        percentage: item.presence,
      }))
  }, [data, maxItems, showAvgPer100m])

  // Shared content for both Drawer and Dialog
  const explanationContent = (
    <div className="text-sm text-muted-foreground space-y-3">
      <p className="font-semibold">How are top items ranked?</p>
      <p className="text-sm">
        Items are ranked by their average per 100 metres of beach. We calculate how often each item appears across all surveys in this region, then work out the typical amount found per 100m. The &ldquo;presence&rdquo; percentage shows how frequently this item appears in surveys - a higher presence means it&apos;s consistently found, while a lower presence might indicate it appears in large quantities but less frequently.
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
                  aria-label="View ranking information"
                >
                  <Info className="h-4 w-4 text-muted-foreground" />
                </Button>
              </DrawerTrigger>
              <DrawerContent>
                <DrawerHeader>
                  <DrawerTitle>Top Litter Items Ranking</DrawerTitle>
                  <DrawerDescription>Understanding how items are ranked</DrawerDescription>
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
                  aria-label="View ranking information"
                >
                  <Info className="h-4 w-4 text-muted-foreground" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Top Litter Items Ranking</DialogTitle>
                  <DialogDescription>Understanding how items are ranked</DialogDescription>
                </DialogHeader>
                {explanationContent}
              </DialogContent>
            </Dialog>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <HorizontalBarChart
          data={chartData}
          height={height}
          maxItems={maxItems}
          showPercentage={showPercentage}
          showCount={showCount}
          loading={loading}
          error={error}
          onRetry={onRetry}
          barThickness={barThickness}
        />
      </CardContent>
    </Card>
  )
}