'use client'

import * as React from "react"
import { DesktopFilterPopover } from "./desktop-filter-popover"
import { FilterState } from "@/types/filter-types"
import { useFilterOptions } from "@/hooks/use-filter-options"

interface MapFilterBarProps {
  filters: FilterState
  onFiltersChange: (filters: FilterState) => void
  className?: string
}

export function MapFilterBar({
  filters,
  onFiltersChange,
  className,
}: MapFilterBarProps) {
  const { data: filterOptions, isLoading } = useFilterOptions()

  const activeFilterCount = React.useMemo(() => {
    if (!filterOptions) return 0
    let count = 0
    if (filters.region.selectedRegionId !== null && filters.region.selectedRegionId !== 1) count++
    if (filters.yearRange.startYear !== filterOptions.availableYears.max) count++
    return count
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
      <DesktopFilterPopover
        filters={filters}
        onFiltersChange={onFiltersChange}
        regions={filterOptions.regions}
        availableYears={filterOptions.availableYears}
        activeFilterCount={activeFilterCount}
      />
    </div>
  )
}
