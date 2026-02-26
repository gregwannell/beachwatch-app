"use client"

import { CalendarX, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { RegionData } from "@/types/region-types"

interface NoDataForYearProps {
  regionData: RegionData
  selectedYear?: number
}

export function NoDataForYear({ regionData, selectedYear }: NoDataForYearProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-6 text-center gap-4">
      <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
        <CalendarX className="w-6 h-6 text-muted-foreground" />
      </div>
      <div className="space-y-1.5">
        <h4 className="text-base font-semibold">
          No data for {selectedYear}
        </h4>
        <p className="text-sm text-muted-foreground">
          No surveys were recorded for {regionData.name} in {selectedYear}.
        </p>
        {regionData.lastDataYear && (
          <p className="text-xs text-muted-foreground pt-1">
            Most recently surveyed in {regionData.lastDataYear} — try adjusting the year filter.
          </p>
        )}
        <Button
          variant="outline"
          size="sm"
          className="mt-2"
          onClick={() => window.open("https://www.mcsuk.org/what-you-can-do/join-a-beach-clean/", "_blank")}
        >
          Contribute a survey
          <ExternalLink className="w-3 h-3 ml-1.5" />
        </Button>
      </div>
    </div>
  )
}
