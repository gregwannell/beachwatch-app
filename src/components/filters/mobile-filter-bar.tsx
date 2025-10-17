'use client'

import * as React from "react"
import { Search, SlidersHorizontal, Palette, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { FilterState, FilterRegion } from "@/types/filter-types"
import { HierarchicalRegionSelect } from "./hierarchical-region-select"
import { MapThemeToggle } from "@/components/map/map-theme-toggle"
import { type MapTheme } from "@/lib/map-themes"
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select"

interface MobileFilterBarProps {
  filters: FilterState
  onFiltersChange: (filters: FilterState) => void
  onMapReset?: () => void
  regions: FilterRegion[]
  availableYears: { min: number; max: number }
  mapTheme?: MapTheme
  onMapThemeChange?: (theme: MapTheme) => void
  isLoading?: boolean
}

export function MobileFilterBar({
  filters,
  onFiltersChange,
  onMapReset,
  regions,
  availableYears,
  mapTheme = 'light',
  onMapThemeChange,
  isLoading = false,
}: MobileFilterBarProps) {
  const [searchTerm, setSearchTerm] = React.useState("")
  const [isSearchOpen, setIsSearchOpen] = React.useState(false)
  const [isDrawerOpen, setIsDrawerOpen] = React.useState(false)

  // No expanded filter state needed anymore (removed collapsibles)

  // Draft filter state for drawer (only applied when "Apply" is clicked)
  const [draftFilters, setDraftFilters] = React.useState<FilterState>(filters)

  // Sync draft filters when parent filters change
  React.useEffect(() => {
    setDraftFilters(filters)
  }, [filters])

  // Group regions by country for search results
  const groupedRegions = React.useMemo(() => {
    const countries = regions.filter(region => region.type === 'Country' || region.type === 'Crown Dependency')
    const counties = regions.filter(region => region.type === 'County Unitary')

    const countiesMap = counties.reduce((acc, county) => {
      if (!acc[county.parent_id!]) {
        acc[county.parent_id!] = []
      }
      acc[county.parent_id!].push(county)
      return acc
    }, {} as Record<number, FilterRegion[]>)

    return countries.map(country => ({
      country,
      counties: countiesMap[country.id] || []
    }))
  }, [regions])

  // Filter regions based on search term
  const filteredResults = React.useMemo(() => {
    if (!searchTerm.trim()) return []

    const term = searchTerm.toLowerCase()
    const results: FilterRegion[] = []

    groupedRegions.forEach(({ country, counties }) => {
      // Add matching country
      if (country.name.toLowerCase().includes(term)) {
        results.push(country)
      }
      // Add matching counties
      counties.forEach(county => {
        if (county.name.toLowerCase().includes(term) ||
            country.name.toLowerCase().includes(term)) {
          results.push(county)
        }
      })
    })

    return results.slice(0, 8) // Limit to 8 results
  }, [searchTerm, groupedRegions])

  // Calculate active filter count
  const activeFilterCount = React.useMemo(() => {
    let count = 0
    if (filters.region.selectedRegionId !== null && filters.region.selectedRegionId !== 1) {
      count++
    }
    if (filters.yearRange.startYear !== availableYears.max) {
      count++
    }
    return count
  }, [filters, availableYears])

  const handleSearchSelect = (regionId: number) => {
    onFiltersChange({
      ...filters,
      region: { selectedRegionId: regionId }
    })
    setSearchTerm("")
    setIsSearchOpen(false)
  }

  const handleApplyFilters = () => {
    onFiltersChange(draftFilters)
    setIsDrawerOpen(false)
  }

  const handleResetFilters = () => {
    const resetFilters = {
      region: { selectedRegionId: 1 },
      yearRange: {
        startYear: availableYears.max,
        endYear: availableYears.max,
        mode: 'single' as const
      },
      categories: {},
    }
    setDraftFilters(resetFilters)
    onFiltersChange(resetFilters)
    onMapReset?.()
    setIsDrawerOpen(false)
  }

  const selectedRegion = regions.find(r => r.id === filters.region.selectedRegionId)

  return (
    <div className="flex items-center gap-3">
      {/* Search Input with Popover */}
      <Popover open={isSearchOpen} onOpenChange={setIsSearchOpen}>
        <PopoverTrigger asChild>
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              type="text"
              placeholder="Search regions..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                setIsSearchOpen(true)
              }}
              onFocus={() => setIsSearchOpen(true)}
              className="pl-11 pr-4 h-12 text-base rounded-full border-muted-foreground/20 shadow-md bg-background/95 backdrop-blur-sm focus-visible:ring-2 focus-visible:ring-primary/20"
              disabled={isLoading}
            />
            {selectedRegion && selectedRegion.id !== 1 && (
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                <Badge variant="secondary" className="text-xs rounded-full">
                  {selectedRegion.name}
                </Badge>
              </div>
            )}
          </div>
        </PopoverTrigger>
        {filteredResults.length > 0 && (
          <PopoverContent
            className="w-[--radix-popover-trigger-width] p-0"
            align="start"
            side="bottom"
          >
            <div className="max-h-[300px] overflow-y-auto">
              {filteredResults.map((region) => (
                <Button
                  key={region.id}
                  variant="ghost"
                  className="w-full justify-start h-auto py-3 px-4"
                  onClick={() => handleSearchSelect(region.id)}
                >
                  <div className="flex flex-col items-start gap-1 w-full">
                    <div className="font-medium">{region.name}</div>
                    {region.parent_name && (
                      <div className="text-xs text-muted-foreground">
                        {region.parent_name}
                      </div>
                    )}
                    {region.type && (
                      <div className="text-xs text-muted-foreground">
                        {region.type}
                      </div>
                    )}
                  </div>
                </Button>
              ))}
            </div>
          </PopoverContent>
        )}
      </Popover>

      {/* Filter Drawer Trigger */}
      <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <DrawerTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="h-12 w-12 shrink-0 relative rounded-full shadow-md bg-background/95 backdrop-blur-sm border-muted-foreground/20 hover:bg-accent"
            disabled={isLoading}
            aria-label="Open filter options"
          >
            <SlidersHorizontal className="h-5 w-5" />
            {activeFilterCount > 0 && (
              <Badge
                variant="destructive"
                className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs rounded-full"
              >
                {activeFilterCount}
              </Badge>
            )}
          </Button>
        </DrawerTrigger>
        <DrawerContent className="max-h-[85vh] z-[9999]">
          <DrawerHeader className="text-left">
            <DrawerTitle className="flex items-center justify-between">
              <span>Filters</span>
              {activeFilterCount > 0 && (
                <Badge variant="secondary">{activeFilterCount} active</Badge>
              )}
            </DrawerTitle>
            <DrawerDescription>
              Customize your data view
            </DrawerDescription>
          </DrawerHeader>

          {/* Scrollable Content */}
          <div className="px-4 overflow-y-auto max-h-[calc(85vh-200px)]">
            <div className="space-y-3 pb-4">
              {/* Location Filter */}
              <HierarchicalRegionSelect
                regions={regions}
                selectedRegionId={draftFilters.region.selectedRegionId}
                onRegionChange={(regionId) =>
                  setDraftFilters({
                    ...draftFilters,
                    region: { selectedRegionId: regionId }
                  })
                }
                className="w-full"
              />

              {/* Year Filter */}
              <Select
                value={draftFilters.yearRange.startYear.toString()}
                onValueChange={(yearString) => {
                  const year = parseInt(yearString)
                  setDraftFilters({
                    ...draftFilters,
                    yearRange: {
                      startYear: year,
                      endYear: year,
                      mode: 'single'
                    }
                  })
                }}
              >
                <SelectTrigger className="w-full h-auto py-3 px-4 border rounded-lg">
                  <div className="flex items-center justify-between w-full">
                    <span className="text-sm font-medium text-foreground">Year</span>
                    <span className="text-sm text-muted-foreground">
                      {draftFilters.yearRange.startYear}
                    </span>
                  </div>
                </SelectTrigger>
                <SelectContent position="popper" className="max-h-[200px]">
                  {Array.from(
                    { length: availableYears.max - availableYears.min + 1 },
                    (_, i) => availableYears.max - i
                  ).map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year} {year === availableYears.max && '(Latest)'}
                      {year === availableYears.min && '(Oldest)'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Map Theme Filter */}
              {onMapThemeChange && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Map Style
                  </label>
                  <div className="flex items-center justify-between px-4 py-3 border rounded-lg">
                    <div className="flex items-center gap-2">
                      <Palette className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        {mapTheme === 'light' ? 'Light Theme' : 'Dark Theme'}
                      </span>
                    </div>
                    <MapThemeToggle
                      theme={mapTheme}
                      onThemeChange={onMapThemeChange}
                      className="shrink-0"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer with Actions */}
          <DrawerFooter className="pt-4 pb-6">
            <Button
              onClick={handleApplyFilters}
              className="w-full h-12"
            >
              Apply Filters
            </Button>
            <Button
              variant="outline"
              onClick={handleResetFilters}
              className="w-full h-12"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset All
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  )
}
