'use client'

import { useQuery } from '@tanstack/react-query'
import type { RegionData } from '@/components/region-info-panel'

// Hook for fetching UK-level aggregate statistics
export function useUKStats(year?: number, enabled: boolean = true) {
  return useQuery({
    queryKey: ['uk-stats', year],
    queryFn: async (): Promise<RegionData> => {
      // Fetch UK-level aggregated data (region ID 1 is typically UK)
      const ukRegionId = 1
      
      // Fetch basic UK region data
      const yearParam = year ? `&year=${year}` : ''
      const regionResponse = await fetch(
        `/api/regions/${ukRegionId}?includeAggregates=true${yearParam}`
      )
      
      if (!regionResponse.ok) {
        throw new Error(`Failed to fetch UK data: ${regionResponse.statusText}`)
      }
      
      const regionData = await regionResponse.json()
      const { region, aggregates = [] } = regionData

      // Fetch UK-wide breakdown data in parallel
      const yearQueryParam = year ? `&year=${year}` : ''
      const [materialsResponse, sourcesResponse] = await Promise.all([
        fetch(`/api/analytics/materials?regionId=${ukRegionId}&limit=10${yearQueryParam}`).catch(() => null),
        fetch(`/api/analytics/sources?regionId=${ukRegionId}&limit=10${yearQueryParam}`).catch(() => null)
      ])

      let topItems: RegionData['litterData']['topItems'] = []
      let materialBreakdown: RegionData['litterData']['materialBreakdown'] = []
      let sourceBreakdown: RegionData['litterData']['sourceBreakdown'] = []

      // Process materials data
      if (materialsResponse?.ok) {
        const materialsData = await materialsResponse.json()
        
        topItems = materialsData.data.materials.slice(0, 5).map((item: { material: { name: string }, total: number, presence: number }) => ({
          category: item.material.name,
          count: item.total,
          percentage: item.presence
        }))

        materialBreakdown = materialsData.data.materials.map((item: { material: { name: string }, total: number, presence: number }) => ({
          material: item.material.name,
          count: item.total,
          percentage: item.presence
        }))
      }

      // Process sources data  
      if (sourcesResponse?.ok) {
        const sourcesData = await sourcesResponse.json()
        
        sourceBreakdown = sourcesData.data.sources.map((item: { source: { name: string }, total: number, presence: number }) => ({
          source: item.source.name,
          count: item.total,
          percentage: item.presence
        }))
      }

      // Calculate average litter per 100m from aggregates
      const averageLitterPer100m = aggregates.length > 0
        ? aggregates.reduce((sum: number, agg: { avg_per_100m: number }) => sum + agg.avg_per_100m, 0) / aggregates.length
        : 0

      // Calculate year-over-year change
      const yearOverYearChange = calculateYearOverYearChange(aggregates)

      // Use real engagement data from aggregates
      const engagementData = aggregates.length > 0 ? {
        surveyCount: aggregates.reduce((sum, agg) => sum + agg.total_surveys, 0),
        volunteerCount: aggregates.reduce((sum, agg) => sum + agg.total_volunteers, 0),
        totalBeachLength: Math.round(aggregates.reduce((sum, agg) => sum + agg.total_length_m, 0)),
        yearOverYearChanges: calculateEngagementYearOverYearChange(aggregates)
      } : undefined

      return {
        id: region.id.toString(),
        name: 'United Kingdom',
        level: 'country',
        hasData: aggregates.length > 0,
        litterData: {
          topItems,
          materialBreakdown,
          sourceBreakdown,
          averageLitterPer100m,
          yearOverYearChange
        },
        engagementData
      }
    },
    enabled,
    staleTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
  })
}

// Helper function to calculate year-over-year change
function calculateYearOverYearChange(aggregates: { year: string, avg_per_100m: number }[]): number | undefined {
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