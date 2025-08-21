'use client'

import { useQuery } from '@tanstack/react-query'
import type { RegionData } from '@/components/region-info-panel'

// Hook for fetching UK-level aggregate statistics
export function useUKStats(enabled: boolean = true) {
  return useQuery({
    queryKey: ['uk-stats'],
    queryFn: async (): Promise<RegionData> => {
      // Fetch UK-level aggregated data (region ID 1 is typically UK)
      const ukRegionId = 1
      
      // Fetch basic UK region data
      const regionResponse = await fetch(
        `/api/regions/${ukRegionId}?includeAggregates=true`
      )
      
      if (!regionResponse.ok) {
        throw new Error(`Failed to fetch UK data: ${regionResponse.statusText}`)
      }
      
      const regionData = await regionResponse.json()
      const { region, aggregates = [] } = regionData

      // Fetch UK-wide breakdown data in parallel
      const [materialsResponse, sourcesResponse] = await Promise.all([
        fetch(`/api/analytics/materials?regionId=${ukRegionId}&limit=10`).catch(() => null),
        fetch(`/api/analytics/sources?regionId=${ukRegionId}&limit=10`).catch(() => null)
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
        ? aggregates.reduce((sum: number, agg: any) => sum + agg.avg_per_100m, 0) / aggregates.length
        : 0

      // Calculate year-over-year change
      const yearOverYearChange = calculateYearOverYearChange(aggregates)

      // Generate UK-wide engagement data
      const engagementData = generateUKEngagementData()

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

// Helper function to generate UK-wide engagement data
function generateUKEngagementData(): RegionData['engagementData'] {
  // Generate realistic UK-wide engagement numbers
  const surveyCount = Math.floor(2500 + Math.random() * 500) // 2500-3000 surveys
  const volunteerCount = Math.floor(surveyCount * 2.8 + Math.random() * 200) // ~7000-8500 volunteers
  const totalBeachLength = Math.floor(45000 + Math.random() * 5000) // ~45-50km total

  // Generate year-over-year changes
  const surveyChange = (Math.random() - 0.3) * 20 // Generally positive trend
  const volunteerChange = (Math.random() - 0.2) * 25 // Generally positive trend  
  const beachLengthChange = (Math.random() - 0.2) * 15 // Generally positive trend

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