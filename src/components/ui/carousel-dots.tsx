"use client"

import * as React from "react"
import type { CarouselApi } from "@/components/ui/carousel"
import { cn } from "@/lib/utils"

interface CarouselDotsProps {
  api: CarouselApi | undefined
  className?: string
}

export function CarouselDots({ api, className }: CarouselDotsProps) {
  const [selectedIndex, setSelectedIndex] = React.useState(0)
  const [scrollSnaps, setScrollSnaps] = React.useState<number[]>([])

  React.useEffect(() => {
    if (!api) return

    // Initialize scroll snaps and selected index
    setScrollSnaps(api.scrollSnapList())
    setSelectedIndex(api.selectedScrollSnap())

    const onSelect = () => {
      setSelectedIndex(api.selectedScrollSnap())
    }

    // Listen for slide changes
    api.on("select", onSelect)
    api.on("reInit", () => {
      setScrollSnaps(api.scrollSnapList())
      setSelectedIndex(api.selectedScrollSnap())
    })

    return () => {
      api.off("select", onSelect)
    }
  }, [api])

  if (!api || scrollSnaps.length === 0) {
    return null
  }

  return (
    <div className={cn("flex items-center justify-center gap-[3px] mt-4", className)}>
      {scrollSnaps.map((_, index) => (
        <button
          key={index}
          type="button"
          aria-label={`Go to slide ${index + 1}`}
          onClick={() => api.scrollTo(index)}
          className={cn(
            "w-[7px] h-[7px] rounded-full transition-colors duration-200",
            index === selectedIndex
              ? "bg-foreground"
              : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
          )}
        />
      ))}
    </div>
  )
}
