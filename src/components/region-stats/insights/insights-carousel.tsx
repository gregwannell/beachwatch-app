"use client"

import { useState } from 'react'
import type { RegionData } from '@/types/region-types'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel"
import { CarouselDots } from "@/components/ui/carousel-dots"
import {
  HistoricalContextInsight,
  TopLitterItemInsight,
  TopSourceInsight,
  PlasticComparisonInsight
} from '.'

interface InsightsCarouselProps {
  regionData: RegionData
  selectedYear?: number
}

export function InsightsCarousel({ regionData, selectedYear }: InsightsCarouselProps) {
  const [api, setApi] = useState<CarouselApi>()

  if (!regionData.hasData || !regionData.litterData) {
    return null
  }

  const { litterData } = regionData

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-muted-foreground">Key Insights</h3>

      <Carousel
        setApi={setApi}
        opts={{
          align: "center",
          loop: true,
        }}
        className="w-full"
      >
        <CarouselContent className="-ml-2 md:-ml-4">
          {/* Historical Context Insight */}
          <CarouselItem className="pl-2 md:pl-4 basis-[70%]">
            <HistoricalContextInsight
              regionData={regionData}
              selectedYear={selectedYear}
            />
          </CarouselItem>

          {/* Top Litter Item */}
          <CarouselItem className="pl-2 md:pl-4 basis-[70%]">
            <TopLitterItemInsight
              topLitterItems={litterData.topLitterItems}
            />
          </CarouselItem>

          {/* Top Litter Source */}
          <CarouselItem className="pl-2 md:pl-4 basis-[70%]">
            <TopSourceInsight
              sourceBreakdown={litterData.sourceBreakdown}
            />
          </CarouselItem>

          {/* Plastic/Polystyrene Comparison */}
          <CarouselItem className="pl-2 md:pl-4 basis-[70%]">
            <PlasticComparisonInsight
              plasticPolystyreneComparison={litterData.plasticPolystyreneComparison}
            />
          </CarouselItem>
        </CarouselContent>

        {/* Navigation arrows - desktop only */}
        <CarouselPrevious className="hidden md:flex left-2 md:left-4" />
        <CarouselNext className="hidden md:flex right-2 md:right-4" />
      </Carousel>

      {/* Page indicator dots */}
      <CarouselDots api={api} />
    </div>
  )
}
