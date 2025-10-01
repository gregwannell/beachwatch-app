"use client"

import type { RegionData } from '@/types/region-types'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

interface LitterCollectionStatsProps {
  litterData: NonNullable<RegionData['litterData']>
}

export function LitterCollectionStats({ litterData }: LitterCollectionStatsProps) {
  const stats = [
    {
      id: "total-litter",
      label: "Total Litter",
      value: litterData.totalLitter.toLocaleString(),
      explanation: "This represents every individual piece of litter that was identified, counted, and recorded during beach surveys."
    },
    {
      id: "coastline-surveyed",
      label: "Coastline Surveyed",
      value: `${litterData.totalLengthSurveyed.toLocaleString()}m`,
      explanation: "The total linear distance of beach that has been surveyed. This includes both the survey length and additional cleaning once the survey was completed."
    },
    {
      id: "bags-collected",
      label: "Bags Collected",
      value: Math.round(litterData.totalBags).toLocaleString(),
      explanation: "The number of collection bags filled during beach clean-up activities. While this provides a visual sense of volume, it's less precise than item counts since bag sizes and packing density can vary between surveys."
    },
    {
      id: "weight-removed",
      label: "Weight Removed",
      value: `${Math.round(litterData.totalWeight).toLocaleString()}kg`,
      explanation: "The total mass of litter removed from beaches. please note, weight is highly influenced by the type of litter collected and whether that item is wet. For example, a single wet fishing net can weigh significantly more than dozens of dry plastic bottles."
    }
  ]

  return (
    <Accordion type="single" collapsible className="w-full rounded-lg border bg-card">
      {stats.map((stat) => (
        <AccordionItem key={stat.id} value={stat.id} className="border-none">
          <AccordionTrigger className="px-4 py-3 hover:no-underline">
            <div className="flex items-center justify-between w-full pr-1">
              <span className="text-sm font-medium text-muted-foreground">
                {stat.label}
              </span>
              <span className="text-l font-bold tabular-nums text-foreground">
                {stat.value}
              </span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-1 border-b last:border-b-0 data-[state=closed]:border-b-0">
            <div className="text-sm text-muted-foreground space-y-1">
              <p className="text-xs leading-relaxed">
                {stat.explanation}
              </p>
            </div>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  )
}
