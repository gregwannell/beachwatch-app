'use client'

import { useQuery } from '@tanstack/react-query'
import type { RegionData, SuggestedRegion } from '@/components/region-info-panel'

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

// Helper function to generate mock engagement data
function generateEngagementData(regionId: number, hasData: boolean): RegionData['engagementData'] {
  if (!hasData) return undefined

  // Generate realistic engagement numbers based on region ID (for consistent mock data)
  const baseMultiplier = (regionId % 10) + 1
  const surveyCount = Math.floor(45 + (baseMultiplier * 15) + Math.random() * 20)
  const volunteerCount = Math.floor(surveyCount * 2.3 + Math.random() * 10)
  const totalBeachLength = Math.floor(2500 + (baseMultiplier * 800) + Math.random() * 1500)

  // Generate year-over-year changes (some positive, some negative)
  const surveyChange = (Math.random() - 0.5) * 30 // -15% to +15%
  const volunteerChange = (Math.random() - 0.4) * 25 // Slightly more positive trend
  const beachLengthChange = (Math.random() - 0.3) * 20 // Generally positive trend

  return {
    surveyCount,
    volunteerCount,
    totalBeachLength,
    yearOverYearChanges: {
      surveys: Math.round(surveyChange * 10) / 10,
      volunteers: Math.round(volunteerChange * 10) / 10,
      beachLength: Math.round(beachLengthChange * 10) / 10
    }
  }
}

// Main hook for fetching region info panel data
export function useRegionInfo(regionId: number | null, enabled: boolean = true) {
  return useQuery({
    queryKey: ['region-info', regionId],
    queryFn: async (): Promise<RegionData | null> => {
      if (!regionId) return null

      // Fetch basic region data with parent info
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
          level: region.type === 'County Unitary' ? 'county' : 'region',
          parentId: region.parent_id?.toString(),
          parentName: parent?.name,
          hasData: false,
          suggestedRegions: generateSuggestedRegions(region.id)
        }
      }

      // Fetch detailed breakdown data in parallel
      const [materialsResponse, sourcesResponse] = await Promise.all([
        fetch(`/api/analytics/materials?regionId=${regionId}&limit=5`).catch(() => null),
        fetch(`/api/analytics/sources?regionId=${regionId}&limit=5`).catch(() => null)
      ])

      let topItems: RegionData['litterData']['topItems'] = []
      let materialBreakdown: RegionData['litterData']['materialBreakdown'] = []
      let sourceBreakdown: RegionData['litterData']['sourceBreakdown'] = []

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

      // Calculate average litter per 100m from aggregates
      const averageLitterPer100m = aggregates.length > 0
        ? aggregates.reduce((sum, agg) => sum + agg.avg_per_100m, 0) / aggregates.length
        : 0

      // Calculate year-over-year change
      const yearOverYearChange = calculateYearOverYearChange(aggregates)

      return {
        id: region.id.toString(),
        name: region.name,
        level: region.type === 'County Unitary' ? 'county' : 'region',
        parentId: region.parent_id?.toString(),
        parentName: parent?.name,
        hasData: true,
        litterData: {
          topItems,
          materialBreakdown,
          sourceBreakdown,
          averageLitterPer100m,
          yearOverYearChange
        },
        engagementData: generateEngagementData(region.id, true)
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