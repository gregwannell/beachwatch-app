'use client'

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { RotateCcw } from "lucide-react"

import { RegionSelect } from "./region-select"
import { YearRangePicker } from "./year-range-picker"
import { CategoryCheckboxes } from "./category-checkboxes"
import { useFilterOptions } from "@/hooks/use-filter-options"
import { FilterState, FilterRegion } from "@/types/filter-types"

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

  const handleCategoriesChange = (categories: FilterState['categories']) => {
    onFiltersChange({
      ...filters,
      categories,
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
      categories: {
        materials: [],
        sources: [],
      },
    })
  }

  // Calculate if any filters are active
  const hasActiveFilters = 
    filters.region.selectedRegionId !== null ||
    filters.yearRange.mode === 'range' ||
    filters.yearRange.startYear !== filterOptions.availableYears.max ||
    filters.categories.materials.length > 0 ||
    filters.categories.sources.length > 0

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
          >
            <RotateCcw className="h-3 w-3 mr-1" />
            Reset
          </Button>
        )}
      </div>

      {/* Region Filter */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Location</CardTitle>
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

      <Separator />

      {/* Category Filters */}
      <div>
        <h4 className="font-medium text-sm text-muted-foreground mb-3">
          Litter Categories
        </h4>
        <CategoryCheckboxes
          value={filters.categories}
          onChange={handleCategoriesChange}
          availableCategories={{
            materials: filterOptions.materials,
            sources: filterOptions.sources,
          }}
        />
      </div>

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
                  • Time: {filters.yearRange.mode === 'single' 
                    ? `${filters.yearRange.startYear}` 
                    : `${filters.yearRange.startYear}-${filters.yearRange.endYear}`}
                </div>
                {filters.categories.materials.length > 0 && (
                  <div>• Materials: {filters.categories.materials.length} selected</div>
                )}
                {filters.categories.sources.length > 0 && (
                  <div>• Sources: {filters.categories.sources.length} selected</div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}