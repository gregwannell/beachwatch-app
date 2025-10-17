'use client'

import { MainLayout } from '@/components/layout/main-layout'
import { ModernMobileNav } from '@/components/layout/modern-mobile-nav'
import { RegionStatsContent } from '@/components/region-stats'
import { MobileFilterBar } from '@/components/filters/mobile-filter-bar'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import { useRegionInfo } from '@/hooks/use-region-info'
import { useFilterOptions } from '@/hooks/use-filter-options'
import { FilterState } from '@/types/filter-types'

export default function StatsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const regionIdParam = searchParams.get('region')
  const yearParam = searchParams.get('year')

  // State management
  const [selectedRegionId, setSelectedRegionId] = useState<number>(
    regionIdParam ? parseInt(regionIdParam) : 1
  )
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false)

  // Filter state - sync with URL params
  const [filters, setFilters] = useState<FilterState>({
    region: { selectedRegionId },
    yearRange: {
      startYear: yearParam ? parseInt(yearParam) : 2024,
      endYear: yearParam ? parseInt(yearParam) : 2024,
      mode: 'single'
    },
    categories: {}
  })

  // Fetch filter options for region lookup
  const { data: filterOptions } = useFilterOptions()

  // Sync filters when URL params change
  useEffect(() => {
    if (regionIdParam) {
      const regionId = parseInt(regionIdParam)
      setSelectedRegionId(regionId)
      setFilters(prev => ({
        ...prev,
        region: { selectedRegionId: regionId }
      }))
    }
    if (yearParam) {
      const year = parseInt(yearParam)
      setFilters(prev => ({
        ...prev,
        yearRange: {
          startYear: year,
          endYear: year,
          mode: 'single'
        }
      }))
    }
  }, [regionIdParam, yearParam])

  // Fetch region data
  const { data: regionData, isLoading: isRegionLoading } = useRegionInfo(
    selectedRegionId,
    filters.yearRange.startYear,
    true
  )

  // Update URL when filters change
  const handleFiltersChange = (newFilters: FilterState) => {
    setFilters(newFilters)

    // Update URL with new params
    const params = new URLSearchParams()
    if (newFilters.region.selectedRegionId) {
      params.set('region', newFilters.region.selectedRegionId.toString())
    }
    if (newFilters.yearRange.startYear) {
      params.set('year', newFilters.yearRange.startYear.toString())
    }
    router.push(`/stats?${params.toString()}`)
  }

  const handleRegionSelect = (regionId: string) => {
    const numericRegionId = parseInt(regionId)
    setSelectedRegionId(numericRegionId)
    handleFiltersChange({
      ...filters,
      region: { selectedRegionId: numericRegionId }
    })
  }

  const handleBackToMap = () => {
    // Navigate to map with current region and filters
    const params = new URLSearchParams()
    if (selectedRegionId) {
      params.set('region', selectedRegionId.toString())
    }
    if (filters.yearRange.startYear) {
      params.set('year', filters.yearRange.startYear.toString())
    }
    router.push(`/explore?${params.toString()}`)
  }

  return (
    <MainLayout>
      {/* Mobile Header */}
      <div className="lg:hidden sticky top-0 z-[1000] bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="flex items-center h-14 px-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleBackToMap}
            aria-label="Back to map"
            className="mr-2"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold">Regional Statistics</h1>
        </div>
      </div>

      {/* Desktop Header */}
      <div className="hidden lg:block sticky top-0 z-[1000] bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="flex items-center h-16 px-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleBackToMap}
            aria-label="Back to map"
            className="mr-2"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-semibold">Regional Statistics</h1>
        </div>
      </div>

      {/* Content Area */}
      <div className="h-[calc(100vh-3.5rem)] lg:h-[calc(100vh-4rem)] overflow-auto pb-24 lg:pb-6">
        <RegionStatsContent
          regionData={regionData}
          isLoading={isRegionLoading}
          onRegionSelect={handleRegionSelect}
          selectedYear={filters.yearRange.startYear}
        />
      </div>

      {/* Hidden Mobile Filter Bar - Controlled via bottom nav */}
      {filterOptions && (
        <div className="lg:hidden">
          <MobileFilterBar
            filters={filters}
            onFiltersChange={handleFiltersChange}
            regions={filterOptions.regions}
            availableYears={filterOptions.availableYears}
            isLoading={false}
            isOpen={isMobileFilterOpen}
            onOpenChange={setIsMobileFilterOpen}
          />
        </div>
      )}

      {/* Mobile Bottom Navigation */}
      <ModernMobileNav onFilterClick={() => setIsMobileFilterOpen(true)} />
    </MainLayout>
  )
}
