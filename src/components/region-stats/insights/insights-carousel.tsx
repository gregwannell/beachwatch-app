"use client"

import { useState } from 'react'
import { Sparkles, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { RegionData } from '@/types/region-types'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel"
import { CarouselDots } from "@/components/ui/carousel-dots"
import {
  HistoricalContextInsight,
  TopLitterItemInsight,
  TopSourceInsight,
} from '.'
import { TopLitterTypeCard } from './top-litter-type-card'

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

  const scrollPrev = () => api?.scrollPrev()
  const scrollNext = () => api?.scrollNext()

  return (
    <div className="space-y-4">
      {/* Section header with navigation arrows */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-extrabold flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary" />
          Key Insights
        </h2>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 rounded-full shadow-sm"
            onClick={scrollPrev}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 rounded-full shadow-sm"
            onClick={scrollNext}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Carousel
        setApi={setApi}
        opts={{
          align: "start",
          loop: true,
        }}
        className="w-full"
      >
        <CarouselContent className="-ml-3 py-1">
          {/* Page 1: Historical Context + Top Litter Type */}
          <CarouselItem className="pl-3 basis-full">
            <div className="grid grid-cols-1 gap-4">
              <HistoricalContextInsight
                regionData={regionData}
                selectedYear={selectedYear}
              />
              <TopLitterTypeCard
                plasticPolystyreneComparison={litterData.plasticPolystyreneComparison}
              />
            </div>
          </CarouselItem>

          {/* Page 2: Top Litter Item + Top Source */}
          <CarouselItem className="pl-3 basis-full">
            <div className="grid grid-cols-1 gap-4">
              <TopLitterItemInsight
                topLitterItems={litterData.topLitterItems}
              />
              <TopSourceInsight
                sourceBreakdown={litterData.sourceBreakdown}
              />
            </div>
          </CarouselItem>
        </CarouselContent>
      </Carousel>

      {/* Page indicator dots */}
      <CarouselDots api={api} />
    </div>
  )
}
