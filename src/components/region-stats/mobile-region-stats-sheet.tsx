'use client'

import { ArrowLeft } from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { RegionStatsContent } from './region-stats-content'
import { getBreadcrumbHierarchy } from './utils/breadcrumb-helpers'
import type { RegionData } from '@/types/region-types'

interface MobileRegionStatsSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  regionData?: RegionData
  isLoading?: boolean
  selectedYear?: number
  onRegionSelect?: (regionId: string) => void
}

export function MobileRegionStatsSheet({
  open,
  onOpenChange,
  regionData,
  isLoading,
  selectedYear,
  onRegionSelect,
}: MobileRegionStatsSheetProps) {
  // Generate breadcrumb hierarchy
  const breadcrumbHierarchy = getBreadcrumbHierarchy(regionData)

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="!w-[100vw] !max-w-none p-0 flex flex-col h-full"
      >
        {/* Header with back button */}
        <SheetHeader className="bg-primary dark:bg-background text-primary-foreground dark:text-foreground px-4 py-3 flex-shrink-0">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onOpenChange(false)}
              className="h-9 w-9 flex-shrink-0 hover:bg-primary-foreground/10 dark:hover:bg-accent text-primary-foreground dark:text-foreground"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex flex-col gap-1 min-w-0">
              <SheetTitle className="text-lg text-primary-foreground dark:text-foreground">
                {regionData?.name || 'Regional Statistics'}
                {selectedYear && (
                  <span className="opacity-80 dark:text-muted-foreground font-normal ml-2">
                    {selectedYear}
                  </span>
                )}
              </SheetTitle>
              {breadcrumbHierarchy.length > 0 && (
                <div className="flex items-center gap-1 text-xs opacity-90 dark:text-muted-foreground dark:opacity-100">
                  {breadcrumbHierarchy.map((item, index) => (
                    <span key={index}>
                      {index > 0 && <span className="mx-1">›</span>}
                      {item.name}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </SheetHeader>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto">
          <RegionStatsContent
            regionData={regionData}
            isLoading={isLoading}
            onRegionSelect={onRegionSelect}
            selectedYear={selectedYear}
            hideHeader={true}
          />
        </div>
      </SheetContent>
    </Sheet>
  )
}
