'use client'

import { useState, useEffect } from 'react'
import { Filter, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { HierarchicalRegionSelect } from './hierarchical-region-select'
import { YearRangePicker } from './year-range-picker'
import { DataAvailabilityFilter } from './data-availability-filter'
import type { FilterState, FilterRegion } from '@/types/filter-types'

interface DesktopFilterPopoverProps {
  filters: FilterState
  onFiltersChange: (filters: FilterState) => void
  regions: FilterRegion[]
  availableYears: { min: number; max: number }
  activeFilterCount: number
  onMapReset?: () => void
}

export function DesktopFilterPopover({
  filters,
  onFiltersChange,
  regions,
  availableYears,
  activeFilterCount,
  onMapReset,
}: DesktopFilterPopoverProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [draftFilters, setDraftFilters] = useState<FilterState>(filters)

  // Sync draft filters when actual filters change from outside
  useEffect(() => {
    setDraftFilters(filters)
  }, [filters])

  const handleApplyFilters = () => {
    onFiltersChange(draftFilters)
    setIsOpen(false)
  }

  const handleResetFilters = () => {
    const defaultFilters: FilterState = {
      region: { selectedRegionId: 1 }, // Default to UK
      yearRange: {
        startYear: availableYears.max,
        endYear: availableYears.max,
        mode: 'single'
      },
      categories: { selectedCategories: [] },
      dataAvailability: draftFilters.dataAvailability // PRESERVE user's data availability settings
    }
    setDraftFilters(defaultFilters)
    onFiltersChange(defaultFilters)
    onMapReset?.()
    setIsOpen(false)
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="h-10 px-4 gap-2 bg-background/95 backdrop-blur-sm border shadow-sm hover:bg-accent"
        >
          <Filter className="h-4 w-4" />
          <span className="text-sm font-medium">Filters</span>
          {activeFilterCount > 0 && (
            <Badge variant="secondary" className="ml-1">
              {activeFilterCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[400px] p-0"
        align="end"
        side="bottom"
        sideOffset={8}
      >
        {/* Header */}
        <div className="px-4 pt-4 pb-3 border-b">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Filters</h3>
            {activeFilterCount > 0 && (
              <Badge variant="secondary">{activeFilterCount} active</Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Customize your data view
          </p>
        </div>

        {/* Filter Content */}
        <div className="px-4 py-4 space-y-3 max-h-[400px] overflow-y-auto">
          {/* Region Filter */}
          <HierarchicalRegionSelect
            regions={regions}
            selectedRegionId={draftFilters.region.selectedRegionId}
            onRegionChange={(regionId) =>
              setDraftFilters({
                ...draftFilters,
                region: { selectedRegionId: regionId }
              })
            }
            variant="inline"
            className="w-full"
          />

          {/* Year Filter */}
          <YearRangePicker
            value={draftFilters.yearRange}
            onChange={(yearRange) =>
              setDraftFilters({
                ...draftFilters,
                yearRange
              })
            }
            availableYears={availableYears}
            className="w-full"
          />

          {/* Data Availability Filter */}
          <DataAvailabilityFilter
            showNoData={draftFilters.dataAvailability.showNoData}
            highlightLimitedSurveys={draftFilters.dataAvailability.highlightLimitedSurveys}
            onChange={(filters) =>
              setDraftFilters({
                ...draftFilters,
                dataAvailability: filters
              })
            }
            className="w-full"
          />
        </div>

        {/* Footer with Actions */}
        <div className="px-4 py-4 border-t space-y-2">
          <Button
            onClick={handleApplyFilters}
            className="w-full h-10"
          >
            Apply Filters
          </Button>
          <Button
            variant="outline"
            onClick={handleResetFilters}
            className="w-full h-10"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset All
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
