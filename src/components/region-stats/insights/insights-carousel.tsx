"use client"

import { useState, type ReactElement } from 'react'
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
import { AveragePer100mCard } from './average-per-100m-card'
import { TopLitterMaterialCard } from './top-litter-material-card'
import { TopLitterItemCard } from './top-litter-item-card'
import { TopLitterSourceCard } from './top-litter-source-card'

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

  const slides = [
    <AveragePer100mCard
      key="history"
      regionData={regionData}
      selectedYear={selectedYear}
    />,
    litterData.materialBreakdown.length > 0 ? (
      <TopLitterMaterialCard
        key="top-material"
        materialBreakdown={litterData.materialBreakdown}
      />
    ) : null,
    (litterData.topLitterItems?.length ?? 0) > 0 ? (
      <TopLitterItemCard
        key="top-item"
        topLitterItems={litterData.topLitterItems}
      />
    ) : null,
    litterData.sourceBreakdown.length > 0 ? (
      <TopLitterSourceCard
        key="top-source"
        sourceBreakdown={litterData.sourceBreakdown}
      />
    ) : null,
  ].filter((s): s is ReactElement => s !== null)

  if (slides.length === 0) return null

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
          {slides.map((slide) => (
            <CarouselItem key={slide.key} className="pl-3 basis-full">
              {slide}
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>

      {/* Page indicator dots */}
      <CarouselDots api={api} />
    </div>
  )
}
