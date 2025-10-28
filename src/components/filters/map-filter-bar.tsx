'use client'

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { RotateCcw, Info } from "lucide-react"
import { HierarchicalRegionSelect } from "./hierarchical-region-select"
import { YearRangePicker } from "./year-range-picker"
import { FilterState } from "@/types/filter-types"
import { useFilterOptions } from "@/hooks/use-filter-options"

interface MapFilterBarProps {
  filters: FilterState
  onFiltersChange: (filters: FilterState) => void
  onMapReset?: () => void
  className?: string
}

export function MapFilterBar({
  filters,
  onFiltersChange,
  onMapReset,
  className,
}: MapFilterBarProps) {
  const { data: filterOptions, isLoading } = useFilterOptions()

  const handleRegionChange = (selectedRegionId: number | null) => {
    onFiltersChange({
      ...filters,
      region: { selectedRegionId },
    })
  }

  const handleYearRangeChange = (yearRange: FilterState['yearRange']) => {
    onFiltersChange({
      ...filters,
      yearRange,
    })
  }

  const handleResetFilters = () => {
    if (!filterOptions) return

    const resetFilters = {
      region: { selectedRegionId: 1 },
      yearRange: {
        startYear: filterOptions.availableYears.max,
        endYear: filterOptions.availableYears.max,
        mode: 'single' as const
      },
      categories: {},
    }

    onFiltersChange(resetFilters)
    onMapReset?.()
  }

  // Calculate if any filters are active
  const hasActiveFilters = filterOptions
    ? (filters.region.selectedRegionId !== null && filters.region.selectedRegionId !== 1) ||
      filters.yearRange.startYear !== filterOptions.availableYears.max
    : false

  if (isLoading || !filterOptions) {
    return (
      <div className={`bg-background/95 backdrop-blur-sm border rounded-lg shadow-lg p-3 ${className}`}>
        <div className="flex items-center gap-2">
          <div className="h-10 w-32 bg-muted rounded animate-pulse" />
          <div className="h-10 w-32 bg-muted rounded animate-pulse" />
        </div>
      </div>
    )
  }

  return (
    <div className={`flex items-center gap-2 flex-wrap ${className}`}>
      {/* Region Select - Compact */}
      <div className="min-w-[200px] bg-background/95 backdrop-blur-sm rounded-lg shadow-lg">
        <HierarchicalRegionSelect
          regions={filterOptions.regions}
          selectedRegionId={filters.region.selectedRegionId}
          onRegionChange={handleRegionChange}
          placeholder="All regions"
          className="w-full"
        />
      </div>

      {/* Year Picker - Compact */}
      <div className="min-w-[140px] bg-background/95 backdrop-blur-sm rounded-lg shadow-lg">
        <YearRangePicker
          value={filters.yearRange}
          onChange={handleYearRangeChange}
          availableYears={filterOptions.availableYears}
          className="w-full"
        />
      </div>

      {/* Reset Button */}
      {hasActiveFilters && (
        <Button
          variant="outline"
          size="sm"
          onClick={handleResetFilters}
          className="h-10 bg-background/95 backdrop-blur-sm shadow-lg"
          aria-label="Reset all filters"
        >
          <RotateCcw className="h-4 w-4 mr-2" />
          Reset
        </Button>
      )}

      {/* Active Filters Summary */}
      {hasActiveFilters && (
        <div className="flex items-center gap-2 flex-wrap bg-background/95 backdrop-blur-sm rounded-lg shadow-lg px-3 py-2 border border-primary/20">
          <Info className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium">Active:</span>
          {filters.region.selectedRegionId && filters.region.selectedRegionId !== 1 && (
            <Badge variant="secondary" className="text-xs">
              {filterOptions.regions.find(r =>
                r.id === filters.region.selectedRegionId
              )?.name}
            </Badge>
          )}
          {filters.yearRange.startYear !== filterOptions.availableYears.max && (
            <Badge variant="secondary" className="text-xs">
              {filters.yearRange.startYear}
            </Badge>
          )}
        </div>
      )}
    </div>
  )
}
