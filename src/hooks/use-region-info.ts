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
}

interface SourceBreakdown {
  source: {
    id: number
    name: string
  }
  total: number
  avgPer100m: number
  presence: number
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
function calculateYearOverYearChange(aggregates: ApiRegionData['aggregates']): number | undefined {
  if (aggregates.length < 2) return undefined

  // Sort by year descending to get current and previous year
  const sorted = [...aggregates].sort((a, b) => parseInt(b.year) - parseInt(a.year))
  const current = sorted[0]
  const previous = sorted[1]

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
      const yearParam = year ? `&year=${year}` : ''
      const regionResponse = await fetch(
        `/api/regions/${regionId}?includeParent=true&includeAggregates=true${yearParam}`
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
        // Fetch UK data for comparison (UK region ID is typically 1, but we'll fetch by name)
        region.name !== 'United Kingdom'
          ? fetch(`/api/regions/1?includeAggregates=true${yearParam}`).catch(() => null)
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

        materialBreakdown = materialsData.data.materials.map(item => ({
          material: item.material.name,
          count: item.total,
          percentage: item.presence
        }))
      }

      // Process sources data  
      if (sourcesResponse?.ok) {
        const sourcesData: { data: { sources: SourceBreakdown[] } } = await sourcesResponse.json()
        
        sourceBreakdown = sourcesData.data.sources.map(item => ({
          source: item.source.name,
          count: item.total,
          percentage: item.presence
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

      // Calculate average litter per 100m from aggregates
      const averageLitterPer100m = aggregates.length > 0
        ? aggregates.reduce((sum, agg) => sum + agg.avg_per_100m, 0) / aggregates.length
        : 0

      // Calculate year-over-year change
      const yearOverYearChange = calculateYearOverYearChange(aggregates)

      // Calculate UK average comparison
      let ukAverageComparison: RegionData['litterData']['ukAverageComparison'] = undefined
      if (ukDataResponse?.ok && region.name !== 'United Kingdom') {
        const ukData: {
          aggregates: ApiRegionData['aggregates']
        } = await ukDataResponse.json()

        if (ukData.aggregates && ukData.aggregates.length > 0) {
          const ukAverage = ukData.aggregates.reduce((sum, agg) => sum + agg.avg_per_100m, 0) / ukData.aggregates.length
          ukAverageComparison = calculateUkAverageComparison(averageLitterPer100m, ukAverage)
        }
      }

      // Calculate aggregate totals
      const totalLitter = aggregates.reduce((sum, agg) => sum + agg.total_litter, 0)
      const totalLengthSurveyed = aggregates.reduce((sum, agg) => sum + agg.total_length_m, 0)
      const totalBags = aggregates.reduce((sum, agg) => sum + agg.total_bags, 0)
      const totalWeight = aggregates.reduce((sum, agg) => sum + agg.total_weight_kg, 0)

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
        engagementData: aggregates.length > 0 ? {
          surveyCount: aggregates.reduce((sum, agg) => sum + agg.total_surveys, 0),
          volunteerCount: aggregates.reduce((sum, agg) => sum + agg.total_volunteers, 0),
          totalBeachLength: Math.round(aggregates.reduce((sum, agg) => sum + agg.total_length_m, 0)),
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