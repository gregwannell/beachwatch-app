'use client'

import * as React from "react"
import { DesktopFilterPopover } from "./desktop-filter-popover"
import { FilterState } from "@/types/filter-types"
import { useFilterOptions } from "@/hooks/use-filter-options"
import { Button } from "@/components/ui/button"
import { RotateCcw } from "lucide-react"

interface MapFilterBarProps {
  filters: FilterState
  onFiltersChange: (filters: FilterState) => void
  className?: string
  onMapReset?: () => void
  onReset?: () => void
}

export function MapFilterBar({
  filters,
  onFiltersChange,
  className,
  onMapReset,
  onReset,
}: MapFilterBarProps) {
  const { data: filterOptions, isLoading } = useFilterOptions()

  const activeFilterCount = React.useMemo(() => {
    if (!filterOptions) return 0
    let count = 0
    if (filters.region.selectedRegionId !== null && filters.region.selectedRegionId !== 1) count++
    if (filters.yearRange.startYear !== filterOptions.availableYears.max) count++
    return count
  }, [filters, filterOptions])

  const hasActiveFilters = React.useMemo(() => {
    if (!filterOptions) return false
    return (filters.region.selectedRegionId !== null && filters.region.selectedRegionId !== 1) ||
           filters.yearRange.startYear !== filterOptions.availableYears.max
  }, [filters, filterOptions])

  if (isLoading || !filterOptions) {
    return (
      <div className={className}>
        <div className="h-10 w-32 bg-muted rounded animate-pulse" />
      </div>
    )
  }

  return (
    <div className={className}>
      <div className="flex items-center gap-2">
        <DesktopFilterPopover
          filters={filters}
          onFiltersChange={onFiltersChange}
          regions={filterOptions.regions}
          availableYears={filterOptions.availableYears}
          activeFilterCount={activeFilterCount}
          onMapReset={onMapReset}
        />

        <Button
          variant="outline"
          size="default"
          onClick={onReset}
          disabled={!hasActiveFilters}
          className="gap-2 bg-background/95 backdrop-blur-sm shadow-sm"
          aria-label="Reset to UK view"
        >
          <RotateCcw className="h-4 w-4" />
          <span>Reset to UK</span>
        </Button>
      </div>
    </div>
  )
}
