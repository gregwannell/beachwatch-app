'use client'

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { RotateCcw } from "lucide-react"

import { RegionSelect } from "./region-select"
import { YearRangePicker } from "./year-range-picker"
import { useFilterOptions } from "@/hooks/use-filter-options"
import { FilterState } from "@/types/filter-types"

interface FilterSidebarProps {
  filters: FilterState
  onFiltersChange: (filters: FilterState) => void
  className?: string
}

export function FilterSidebar({
  filters,
  onFiltersChange,
  className,
}: FilterSidebarProps) {
  const { data: filterOptions, isLoading, error } = useFilterOptions()

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
    onFiltersChange({
      region: { selectedRegionId: null },
      yearRange: {
        startYear: filterOptions.availableYears.max,
        endYear: filterOptions.availableYears.max,
        mode: 'single'
      },
      categories: {},
    })
  }

  // Calculate if any filters are active
  const hasActiveFilters = 
    filters.region.selectedRegionId !== null ||
    filters.yearRange.startYear !== filterOptions.availableYears.max

  if (isLoading) {
    return (
      <div className={`p-4 space-y-4 ${className}`}>
        <div className="space-y-3">
          <div className="h-4 bg-muted rounded animate-pulse" />
          <div className="h-32 bg-muted rounded animate-pulse" />
          <div className="h-32 bg-muted rounded animate-pulse" />
          <div className="h-48 bg-muted rounded animate-pulse" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`p-4 ${className}`}>
        <Card>
          <CardContent className="p-4">
            <div className="text-center space-y-2">
              <div className="text-sm font-medium text-destructive">
                Failed to load filters
              </div>
              <div className="text-xs text-muted-foreground">
                {error?.message || 'Unable to fetch filter options'}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className={`p-4 space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-sm text-muted-foreground">
          Data Filters
        </h3>
        {hasActiveFilters && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleResetFilters}
            className="h-7 text-xs"
            aria-label="Reset all filters"
          >
            <RotateCcw className="h-3 w-3 mr-1" />
            Reset
          </Button>
        )}
      </div>

      {/* Region Filter */}
      <Card role="region" aria-labelledby="location-filter-title">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium" id="location-filter-title">Location</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <RegionSelect
            regions={filterOptions.regions}
            selectedRegionId={filters.region.selectedRegionId}
            onRegionChange={handleRegionChange}
            placeholder="All regions"
            className="w-full"
          />
        </CardContent>
      </Card>

      <Separator />

      {/* Year Range Filter */}
      <YearRangePicker
        value={filters.yearRange}
        onChange={handleYearRangeChange}
        availableYears={filterOptions.availableYears}
      />


      {/* Active filters summary */}
      {hasActiveFilters && (
        <Card className="bg-muted/50">
          <CardContent className="p-3">
            <div className="text-xs text-muted-foreground">
              <div className="font-medium mb-2">Active Filters:</div>
              <div className="space-y-1">
                {filters.region.selectedRegionId && (
                  <div>
                    • Region: {filterOptions.regions.find(r => 
                      r.id === filters.region.selectedRegionId
                    )?.name}
                  </div>
                )}
                <div>
                  • Time: {filters.yearRange.startYear}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}