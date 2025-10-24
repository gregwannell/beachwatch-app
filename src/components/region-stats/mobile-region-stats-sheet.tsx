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
      >
        {/* Header with back button */}
        <SheetHeader className="border-b px-4 py-3 flex-shrink-0">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onOpenChange(false)}
              className="h-9 w-9"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <SheetTitle className="text-lg">
              {regionData?.name || 'Regional Statistics'}
            </SheetTitle>
          </div>
        </SheetHeader>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto">
          <RegionStatsContent
            regionData={regionData}
            isLoading={isLoading}
            onRegionSelect={onRegionSelect}
            selectedYear={selectedYear}
          />
        </div>
      </SheetContent>
    </Sheet>
  )
}
