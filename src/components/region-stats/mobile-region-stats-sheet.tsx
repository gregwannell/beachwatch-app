'use client'

import { ArrowLeft } from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetTitle,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { RegionStatsContent } from './region-stats-content'
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
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="!w-[100vw] !max-w-none p-0 flex flex-col h-full"
        hideCloseButton
      >
        {/* Accessible title for screen readers */}
        <SheetTitle className="sr-only">
          {regionData?.name || 'Regional Statistics'}
        </SheetTitle>

        {/* Back button overlaid on gradient hero */}
        <div className="absolute top-3 left-3 z-30">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onOpenChange(false)}
            className="h-9 w-9 text-white hover:bg-white/20 rounded-full"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </div>

        {/* Content — gradient hero is the header, tabs + scrolling below */}
        <div className="flex-1 min-h-0">
          <RegionStatsContent
            regionData={regionData}
            isLoading={isLoading}
            onRegionSelect={onRegionSelect}
            selectedYear={selectedYear}
            hideHeader={false}
            autoOpenLimitedSurveyDialog={false}
          />
        </div>
      </SheetContent>
    </Sheet>
  )
}
