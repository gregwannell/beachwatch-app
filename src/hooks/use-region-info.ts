'use client'

import { useQuery } from '@tanstack/react-query'
import type { RegionData, SuggestedRegion } from '@/types/region-types'

interface ApiRegionData {
  region: {
    id: number
    name: string
    type: string
    parent_id: number | null
    has_data: boolean
  }
  parent?: {
    id: number
    name: string
    type: string
  } | null
  aggregates: Array<{
    id: number
    year: string
    total_litter: number
    avg_per_100m: number
    total_length_m: number
    total_bags: number
    total_weight_kg: number
  }>
}

interface MaterialBreakdown {
  material: {
    id: number
    name: string
  }
  total: number
  avgPer100m: number
  presence: number
  yearOverYearChange?: number
}

interface SourceBreakdown {
  source: {
    id: number
    name: string
  }
  total: number
  avgPer100m: number
  presence: number
  yearOverYearChange?: number
}

interface LitterItemBreakdown {
  item: {
    id: number
    name: string
    shortName?: string
  }
  total: number
  avgPer100m: number
  presence: number
}

// Helper function to generate mock suggested regions (would be replaced with actual API)
function generateSuggestedRegions(regionId: number): SuggestedRegion[] {
  // This would normally come from a real API that finds nearby regions with data
  const mockSuggestions: SuggestedRegion[] = [
    {
      id: (regionId + 1).toString(),
      name: "Brighton Beach",
      level: 'region',
      distance: "2.5km",
      dataAvailability: 'full'
    },
    {
      id: (regionId + 2).toString(), 
      name: "East Sussex Coast",
      level: 'county',
      distance: "5km",
      dataAvailability: 'partial'
    },
    {
      id: (regionId + 3).toString(),
      name: "South Coast",
      level: 'region',
      distance: "8km", 
      dataAvailability: 'limited'
    }
  ]
  
  return mockSuggestions.slice(0, 2) // Return 2 suggestions
}

// Helper function to calculate year-over-year change
function calculateYearOverYearChange(
  aggregates: ApiRegionData['aggregates'],
  selectedYear?: number
): number | undefined {
  if (aggregates.length < 2) return undefined

  let current: ApiRegionData['aggregates'][0] | undefined
  let previous: ApiRegionData['aggregates'][0] | undefined

  if (selectedYear) {
    // Find data for the selected year and the previous year
    current = aggregates.find(agg => parseInt(agg.year) === selectedYear)
    previous = aggregates.find(agg => parseInt(agg.year) === selectedYear - 1)

    // If either year is missing, return undefined
    if (!current || !previous) return undefined
  } else {
    // Fall back to comparing the two most recent years
    const sorted = [...aggregates].sort((a, b) => parseInt(b.year) - parseInt(a.year))
    current = sorted[0]
    previous = sorted[1]
  }

  if (current.avg_per_100m === 0 && previous.avg_per_100m === 0) return 0
  if (previous.avg_per_100m === 0) return 100 // If previous was 0, any increase is 100%

  const change = ((current.avg_per_100m - previous.avg_per_100m) / previous.avg_per_100m) * 100
  return Math.round(change * 10) / 10 // Round to 1 decimal place
}

// Helper function to calculate UK average comparison
function calculateUkAverageComparison(
  regionalAverage: number,
  ukAverage: number
): RegionData['litterData']['ukAverageComparison'] | undefined {
  if (ukAverage === 0) return undefined

  const percentDifference = ((regionalAverage - ukAverage) / ukAverage) * 100
  const multiplier = regionalAverage / ukAverage

  return {
    ukAverage,
    percentDifference: Math.round(percentDifference * 10) / 10, // Round to 1 decimal place
    multiplier: Math.round(multiplier * 10) / 10 // Round to 1 decimal place
  }
}

// Helper function to calculate engagement year-over-year changes
function calculateEngagementYearOverYearChange(aggregates: { year: string, total_surveys: number, total_volunteers: number, total_length_m: number }[]): RegionData['engagementData']['yearOverYearChanges'] | undefined {
  if (aggregates.length < 2) return undefined
  
  // Sort by year descending to get current and previous year
  const sorted = [...aggregates].sort((a, b) => parseInt(b.year) - parseInt(a.year))
  const current = sorted[0]
  const previous = sorted[1]
  
  const calculatePercentChange = (current: number, previous: number): number => {
    if (current === 0 && previous === 0) return 0
    if (previous === 0) return 100
    const change = ((current - previous) / previous) * 100
    return Math.round(change * 10) / 10
  }
  
  return {
    surveys: calculatePercentChange(current.total_surveys, previous.total_surveys),
    volunteers: calculatePercentChange(current.total_volunteers, previous.total_volunteers),
    beachLength: calculatePercentChange(current.total_length_m, previous.total_length_m)
  }
}

// Main hook for fetching region info panel data
export function useRegionInfo(regionId: number | null, year?: number, enabled: boolean = true) {
  return useQuery({
    queryKey: ['region-info', regionId, year],
    queryFn: async (): Promise<RegionData | null> => {
      if (!regionId) return null

      // Fetch basic region data with parent info
      // Note: We don't filter by year here because we need multiple years for year-over-year comparison
      const regionResponse = await fetch(
        `/api/regions/${regionId}?includeParent=true&includeAggregates=true`
      )
      
      if (!regionResponse.ok) {
        throw new Error(`Failed to fetch region data: ${regionResponse.statusText}`)
      }
      
      const regionApiData: {
        region: ApiRegionData['region']
        parent?: ApiRegionData['parent']
        aggregates: ApiRegionData['aggregates']
      } = await regionResponse.json()

      const { region, parent, aggregates = [] } = regionApiData

      // If no data, return basic info with suggestions
      if (!region.has_data || aggregates.length === 0) {
        return {
          id: region.id.toString(),
          name: region.name,
          level: region.type === 'Country' || region.type === 'Crown Dependency' ? 'country' : 
                 region.type === 'County Unitary' ? 'county' : 'region',
          parentId: region.parent_id?.toString(),
          parentName: parent?.name,
          hasData: false,
          suggestedRegions: generateSuggestedRegions(region.id)
        }
      }

      // Fetch detailed breakdown data in parallel
      const yearQueryParam = year ? `&year=${year}` : ''
      const [materialsResponse, sourcesResponse, litterItemsResponse, trendsResponse, ukDataResponse] = await Promise.all([
        fetch(`/api/analytics/materials?regionId=${regionId}&limit=5${yearQueryParam}`).catch(() => null),
        fetch(`/api/analytics/sources?regionId=${regionId}&limit=5${yearQueryParam}`).catch(() => null),
        fetch(`/api/analytics/litter-items?regionId=${regionId}&limit=5${yearQueryParam}`).catch(() => null),
        fetch(`/api/analytics/trends?regionId=${regionId}`).catch(() => null),
        // Fetch UK data for comparison (UK region ID is 1)
        // Don't filter by year - we need all years for comparison
        region.name !== 'United Kingdom'
          ? fetch(`/api/regions/1?includeAggregates=true`).catch(() => null)
          : null
      ])

      let topItems: RegionData['litterData']['topItems'] = []
      let materialBreakdown: RegionData['litterData']['materialBreakdown'] = []
      let sourceBreakdown: RegionData['litterData']['sourceBreakdown'] = []
      let topLitterItems: LitterItemBreakdown[] = []
      let trendData: RegionData['litterData']['trendData'] = undefined

      // Process materials data (represents top litter items)
      if (materialsResponse?.ok) {
        const materialsData: { data: { materials: MaterialBreakdown[] } } = await materialsResponse.json()

        topItems = materialsData.data.materials.slice(0, 5).map(item => ({
          category: item.material.name,
          count: item.total,
          percentage: item.presence
        }))

        // Calculate total avgPer100m for percentage calculation
        const totalAvgPer100m = materialsData.data.materials.reduce((sum, item) => sum + item.avgPer100m, 0)

        materialBreakdown = materialsData.data.materials.map(item => ({
          material: item.material.name,
          count: item.total,
          avgPer100m: item.avgPer100m,
          percentage: totalAvgPer100m > 0 ? (item.avgPer100m / totalAvgPer100m) * 100 : 0,
          yearOverYearChange: item.yearOverYearChange
        }))
      }

      // Process sources data
      if (sourcesResponse?.ok) {
        const sourcesData: { data: { sources: SourceBreakdown[] } } = await sourcesResponse.json()

        // Calculate total avgPer100m for percentage calculation
        const totalAvgPer100m = sourcesData.data.sources.reduce((sum, item) => sum + item.avgPer100m, 0)

        sourceBreakdown = sourcesData.data.sources.map(item => ({
          source: item.source.name,
          count: item.total,
          avgPer100m: item.avgPer100m,
          percentage: totalAvgPer100m > 0 ? (item.avgPer100m / totalAvgPer100m) * 100 : 0,
          yearOverYearChange: item.yearOverYearChange
        }))
      }

      // Process litter items data
      if (litterItemsResponse?.ok) {
        const litterItemsData: { data: { litterItems: LitterItemBreakdown[] } } = await litterItemsResponse.json()
        topLitterItems = litterItemsData.data.litterItems
      }

      // Process trends data
      if (trendsResponse?.ok) {
        const trendsData: { data: { trends: Array<{ year: string, avgPer100m: number }> } } = await trendsResponse.json()
        trendData = trendsData.data.trends.map(trend => ({
          year: parseInt(trend.year),
          averageLitterPer100m: trend.avgPer100m,
          date: `${trend.year}-01-01`
        }))
      }

      // Filter aggregates to selected year (or most recent if no year selected)
      const filteredAggregates = year
        ? aggregates.filter(agg => parseInt(agg.year) === year)
        : aggregates.length > 0
        ? [aggregates.sort((a, b) => parseInt(b.year) - parseInt(a.year))[0]]
        : []

      // Calculate average litter per 100m from filtered aggregates
      const averageLitterPer100m = filteredAggregates.length > 0
        ? filteredAggregates.reduce((sum, agg) => sum + agg.avg_per_100m, 0) / filteredAggregates.length
        : 0

      // Calculate year-over-year change (uses all aggregates internally)
      const yearOverYearChange = calculateYearOverYearChange(aggregates, year)

      // Calculate UK average comparison
      let ukAverageComparison: RegionData['litterData']['ukAverageComparison'] = undefined
      if (ukDataResponse?.ok && region.name !== 'United Kingdom') {
        const ukData: {
          aggregates: ApiRegionData['aggregates']
        } = await ukDataResponse.json()

        if (ukData.aggregates && ukData.aggregates.length > 0) {
          // Filter UK data to the same year for comparison
          const filteredUkAggregates = year
            ? ukData.aggregates.filter(agg => parseInt(agg.year) === year)
            : ukData.aggregates.length > 0
            ? [ukData.aggregates.sort((a, b) => parseInt(b.year) - parseInt(a.year))[0]]
            : []

          if (filteredUkAggregates.length > 0) {
            const ukAverage = filteredUkAggregates.reduce((sum, agg) => sum + agg.avg_per_100m, 0) / filteredUkAggregates.length
            ukAverageComparison = calculateUkAverageComparison(averageLitterPer100m, ukAverage)
          }
        }
      }

      // Calculate aggregate totals from filtered aggregates
      const totalLitter = filteredAggregates.reduce((sum, agg) => sum + agg.total_litter, 0)
      const totalLengthSurveyed = filteredAggregates.reduce((sum, agg) => sum + agg.total_length_m, 0)
      const totalBags = filteredAggregates.reduce((sum, agg) => sum + agg.total_bags, 0)
      const totalWeight = filteredAggregates.reduce((sum, agg) => sum + agg.total_weight_kg, 0)

      return {
        id: region.id.toString(),
        name: region.name,
        level: region.type === 'Country' || region.type === 'Crown Dependency' ? 'country' :
               region.type === 'County Unitary' ? 'county' : 'region',
        parentId: region.parent_id?.toString(),
        parentName: parent?.name,
        hasData: true,
        litterData: {
          topItems,
          materialBreakdown,
          sourceBreakdown,
          topLitterItems,
          averageLitterPer100m,
          yearOverYearChange,
          ukAverageComparison,
          trendData,
          totalLitter,
          totalLengthSurveyed,
          totalBags,
          totalWeight
        },
        engagementData: filteredAggregates.length > 0 ? {
          surveyCount: filteredAggregates.reduce((sum, agg) => sum + agg.total_surveys, 0),
          volunteerCount: filteredAggregates.reduce((sum, agg) => sum + agg.total_volunteers, 0),
          totalBeachLength: Math.round(filteredAggregates.reduce((sum, agg) => sum + agg.total_length_m, 0)),
          yearOverYearChanges: calculateEngagementYearOverYearChange(aggregates)
        } : undefined
      }
    },
    enabled: enabled && regionId !== null,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  })
}

// Hook for prefetching region info (useful for hover states)
export function usePrefetchRegionInfo() {
  // This could be implemented to prefetch region data on hover
  return {
    prefetch: (regionId: number) => {
      // Implementation would prefetch the data without triggering loading state
    }
  }
}