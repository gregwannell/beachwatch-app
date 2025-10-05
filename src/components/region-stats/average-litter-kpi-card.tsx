"use client"

import { useState } from "react"
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Info, ChevronDown, ChevronRight } from "lucide-react"
import { YearOverYearBadge } from "./year-over-year-badge"
import { UkComparisonText } from "./uk-comparison-text"
import { AverageLitterChart } from "./average-litter-chart"
import type { RegionData } from '@/types/region-types'

interface AverageLitterKpiCardProps {
  regionData: RegionData
  selectedYear?: number
}

export function AverageLitterKpiCard({ regionData, selectedYear }: AverageLitterKpiCardProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isTrendOpen, setIsTrendOpen] = useState(true)

  if (!regionData.litterData) return null

  const { averageLitterPer100m, yearOverYearChange, ukAverageComparison } = regionData.litterData

  return (
    <Card className="@container/card bg-gradient-to-t from-primary/5 to-card shadow-xs pb-3 gap-2">
      <CardHeader>
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <div className="flex items-center justify-between gap-2">
            <CardDescription>Average Litter per 100m</CardDescription>
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-auto w-auto p-1 hover:bg-primary/10"
                aria-label="Toggle calculation information"
              >
                <Info className="h-4 w-4 text-muted-foreground" />
                <ChevronDown
                  className={`h-3 w-3 text-muted-foreground transition-transform duration-200 ${
                    isOpen ? 'rotate-180' : ''
                  }`}
                />
              </Button>
            </CollapsibleTrigger>
          </div>

          <CollapsibleContent className="mt-2">
            <div className="rounded-md bg-muted/50 p-3 text-sm text-muted-foreground">
              <p><strong>How is this calculated?</strong></p>
              <p className="mt-2 text-xs">
               First, we work out how much litter is found per 100 metres of beach, so every
               stretch is measured in the same way. For each beach stretch, we then find the
               middle result (median) from all its surveys, which gives a fair &ldquo;typical&rdquo; value.
               Finally, we take the middle of those typical values across all beaches, so no single
               beach or unusual survey dominates the result.
              </p>
            </div>
          </CollapsibleContent>
        </Collapsible>

        <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
          {averageLitterPer100m.toFixed(1)}
        </CardTitle>
        <YearOverYearBadge change={yearOverYearChange} />
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
