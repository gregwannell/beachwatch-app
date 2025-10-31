"use client"

import { useState, useEffect } from "react"
import { animate, motion, useMotionValue, useTransform } from "framer-motion"
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Info, ChevronRight } from "lucide-react"
import { YearOverYearBadge, UkComparisonText } from "../components"
import { AverageLitterChart } from "../charts"
import type { RegionData } from '@/types/region-types'

interface AverageLitterKpiCardProps {
  regionData: RegionData
  selectedYear?: number
}

export function AverageLitterKpiCard({ regionData, selectedYear }: AverageLitterKpiCardProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isTrendOpen, setIsTrendOpen] = useState(true)
  const [isMobile, setIsMobile] = useState(false)

  // Animation setup for count-up effect
  const count = useMotionValue(0)
  const rounded = useTransform(count, (latest) => latest.toFixed(1))

  // Detect screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768) // md breakpoint
    }

    // Check on mount
    checkMobile()

    // Add resize listener
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  if (!regionData.litterData) return null

  const { averageLitterPer100m, yearOverYearChange, ukAverageComparison } = regionData.litterData

  // Animate count-up when value changes
  useEffect(() => {
    const controls = animate(count, averageLitterPer100m, {
      duration: 1.5,
      ease: "easeOut"
    })
    return () => controls.stop()
  }, [averageLitterPer100m, count])

  // Shared content for both Drawer and Dialog
  const calculationContent = (
    <div className="text-sm text-muted-foreground space-y-3">
      <p className="font-semibold">How is this calculated?</p>
      <p className="text-sm">
        First, we work out how much litter is found per 100 metres of beach, so every
        stretch is measured in the same way. For each beach stretch, we then find the
        middle result (median) from all its surveys, which gives a fair &ldquo;typical&rdquo; value.
        Finally, we take the middle of those typical values across all beaches, so no single
        beach or unusual survey dominates the result.
      </p>
    </div>
  )

  return (
    <Card className="@container/card bg-gradient-to-t from-primary/5 to-card shadow-xs pb-3 gap-2">
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <CardDescription>Average Litter per 100m</CardDescription>

          {/* Conditionally render Drawer (mobile) or Dialog (desktop) */}
          {isMobile ? (
            <Drawer open={isOpen} onOpenChange={setIsOpen}>
              <DrawerTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto w-auto p-1 hover:bg-primary/10"
                  aria-label="View calculation information"
                >
                  <Info className="h-4 w-4 text-muted-foreground" />
                </Button>
              </DrawerTrigger>
              <DrawerContent>
                <DrawerHeader>
                  <DrawerTitle>Average Litter Calculation</DrawerTitle>
                  <DrawerDescription>Understanding how we calculate this metric</DrawerDescription>
                </DrawerHeader>
                <div className="px-4 pb-6">
                  {calculationContent}
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
                  aria-label="View calculation information"
                >
                  <Info className="h-4 w-4 text-muted-foreground" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Average Litter Calculation</DialogTitle>
                  <DialogDescription>Understanding how we calculate this metric</DialogDescription>
                </DialogHeader>
                {calculationContent}
              </DialogContent>
            </Dialog>
          )}
        </div>

        <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
          <motion.span>{rounded}</motion.span>
        </CardTitle>
        <div className="flex items-center gap-1.5">
          <YearOverYearBadge change={yearOverYearChange} />
          {yearOverYearChange !== undefined && (
            <span className="text-xs text-muted-foreground">vs previous year</span>
          )}
        </div>
      </CardHeader>
      <CardFooter className="flex-col items-start gap-1.5 text-sm">
        <UkComparisonText ukAverageComparison={ukAverageComparison} />
      </CardFooter>

      <Separator />

      <Collapsible open={isTrendOpen} onOpenChange={setIsTrendOpen}>
        <CollapsibleTrigger asChild>
          <Button
            variant="ghost"
            className="w-full flex items-center justify-between px-6 py-1 hover:bg-muted/50"
          >
            <span className="text-xs font-medium">{isTrendOpen ? 'Hide Trend' : 'View Trend'}</span>
            <ChevronRight
              className={`h-4 w-4 transition-transform duration-200 ${
                isTrendOpen ? 'rotate-90' : ''
              }`}
            />
          </Button>
        </CollapsibleTrigger>

        <CollapsibleContent className="px-0 pb-0">
          <AverageLitterChart regionData={regionData} selectedYear={selectedYear} />
        </CollapsibleContent>
      </Collapsible>
    </Card>
  )
}
