"use client"

import { useState, useEffect } from "react"
import { animate, motion, useMotionValue, useTransform } from "framer-motion"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Button } from "@/components/ui/button"
import { Info, ChevronRight } from "lucide-react"
import { YearOverYearBadge } from "../components"
import { AverageLitterChart } from "../charts"
import { getBreadcrumbHierarchy } from "../utils/breadcrumb-helpers"
import type { RegionData } from '@/types/region-types'

interface GradientHeroHeaderProps {
  regionData: RegionData
  selectedYear?: number
  hideHeader?: boolean
}

export function GradientHeroHeader({ regionData, selectedYear, hideHeader = false }: GradientHeroHeaderProps) {
  const [isInfoOpen, setIsInfoOpen] = useState(false)
  const [isTrendOpen, setIsTrendOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  // Animation setup for count-up effect
  const count = useMotionValue(0)
  const rounded = useTransform(count, (latest) => latest.toFixed(1))

  const litterData = regionData.litterData
  const averageLitterPer100m = litterData?.averageLitterPer100m ?? 0
  const yearOverYearChange = litterData?.yearOverYearChange
  const ukAverageComparison = litterData?.ukAverageComparison

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => {
    const controls = animate(count, averageLitterPer100m, {
      duration: 1.5,
      ease: "easeOut"
    })
    return () => controls.stop()
  }, [averageLitterPer100m, count])

  const breadcrumbs = getBreadcrumbHierarchy(regionData)

  if (!litterData) return null

  // Generate description from UK comparison data
  const descriptionText = ukAverageComparison
    ? ukAverageComparison.percentDifference === 0
      ? "Overall coastline cleanliness matches the UK average. Explore the detailed metrics below to understand regional variations."
      : ukAverageComparison.percentDifference > 0
        ? "Overall coastline cleanliness has seen a slight shift this year. Explore the detailed metrics below to understand regional variations."
        : "Overall coastline cleanliness is improving. Explore the detailed metrics below to understand regional variations."
    : "Explore the detailed metrics below to understand regional variations."

  // Shared content for info modal
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

  const infoButton = (
    <Button
      id="average-litter-info-button"
      variant="ghost"
      size="sm"
      className="h-auto w-auto p-1.5 hover:bg-white/20 text-white/80 hover:text-white rounded-full"
      aria-label="View calculation information"
    >
      <Info className="h-4 w-4" />
    </Button>
  )

  return (
    <div>
      {/* Gradient Hero Section */}
      <div className="relative overflow-hidden">
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-mcs-clear-blue to-mcs-teal" />

        {/* Decorative blurred circles */}
        <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-10 -left-10 w-48 h-48 rounded-full bg-mcs-teal/20 blur-2xl" />

        {/* Content */}
        <div className="relative z-10 px-6 pt-10 pb-20 text-white text-center">
          {!hideHeader && (
            <div className="mb-4">
              <h3 className="text-lg md:text-xl font-extrabold tracking-widest uppercase opacity-90 drop-shadow-sm">
                {regionData.name}
                <span className="text-mcs-teal mx-2">•</span>
                {selectedYear || new Date().getFullYear()}
              </h3>
              {breadcrumbs.length > 1 && (
                <div className="flex items-center justify-center gap-1 mt-2 text-[11px] text-white/60">
                  {breadcrumbs.map((crumb, i) => (
                    <span key={crumb.level + crumb.name} className="flex items-center gap-1">
                      {i > 0 && <ChevronRight className="h-3 w-3" />}
                      <span className={i === breadcrumbs.length - 1 ? "text-white/90 font-medium" : ""}>
                        {crumb.name}
                      </span>
                    </span>
                  ))}
                </div>
              )}
              <div className="w-16 h-0.5 bg-white/40 mx-auto mt-3 rounded-full" />
            </div>
          )}

          <div className="flex items-center justify-center gap-1 mb-1 mt-4">
            <p className="text-white/80 font-medium text-sm">Average Litter/100m</p>
            {/* Info button */}
            {isMobile ? (
              <Drawer open={isInfoOpen} onOpenChange={setIsInfoOpen}>
                <DrawerTrigger asChild>
                  {infoButton}
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
              <Dialog open={isInfoOpen} onOpenChange={setIsInfoOpen}>
                <DialogTrigger asChild>
                  {infoButton}
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

          <motion.span className="text-5xl md:text-6xl font-extrabold tracking-tighter tabular-nums">
            {rounded}
          </motion.span>

          {/* YoY badge + vs prev year */}
          <div className="flex items-center justify-center gap-2 mt-2">
            <YearOverYearBadge change={yearOverYearChange} vivid />
            {yearOverYearChange !== undefined && (
              <span className="text-[10px] text-white/60 font-semibold tracking-widest">
                vs prev year
              </span>
            )}
          </div>

          {/* <p className="mt-4 text-white/70 max-w-sm mx-auto text-sm leading-relaxed">
            {descriptionText}
          </p>*/}

          {/* Trend button - sits on the curve */}
          <Collapsible open={isTrendOpen} onOpenChange={setIsTrendOpen}>
            <CollapsibleTrigger asChild>
              <Button
                variant="plain"
                size="sm"
                className="mt-6 rounded-full px-4 h-8 shadow-md z-20 relative"
              >
                <span className="text-xs font-medium">{isTrendOpen ? 'Hide Trend' : 'View Trend'}</span>
                <ChevronRight
                  className={`h-3 w-3 ml-1 transition-transform duration-200 ${isTrendOpen ? 'rotate-90' : ''}`}
                />
              </Button>
            </CollapsibleTrigger>
          </Collapsible>
        </div>

        {/* Curved bottom edge */}
        <div
          className="absolute bottom-0 left-0 right-0 h-12 bg-background"
          style={{ clipPath: "ellipse(60% 100% at 50% 100%)" }}
        />
      </div>

      {/* Collapsible Trend Chart - below gradient */}
      <Collapsible open={isTrendOpen} onOpenChange={setIsTrendOpen}>
        <CollapsibleContent className="bg-background px-4 pb-2">
          <AverageLitterChart regionData={regionData} selectedYear={selectedYear} />
        </CollapsibleContent>
      </Collapsible>
    </div>
  )
}
