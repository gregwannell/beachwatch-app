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
    year: number
    total_litter: number
    avg_per_100m: number
    total_length_m: number
    total_bags: number
    total_weight_kg: number
    total_surveys: number
    total_volunteers: number
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
    current = aggregates.find(agg => agg.year === selectedYear)
    previous = aggregates.find(agg => agg.year === selectedYear - 1)

    // If either year is missing, return undefined
    if (!current || !previous) return undefined
  } else {
    // Fall back to comparing the two most recent years
    const sorted = [...aggregates].sort((a, b) => b.year - a.year)
    current = sorted[0]
    previous = sorted[1]
  }

  if (current.avg_per_100m === 0 && previous.avg_per_100m === 0) return 0
  if (previous.avg_per_100m === 0) return 100 // If previous was 0, any increase is 100%

  const change = ((current.avg_per_100m - previous.avg_per_100m) / previous.avg_per_100m) * 100
  return Math.round(change)
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
function calculateEngagementYearOverYearChange(aggregates: { year: number, total_surveys: number, total_volunteers: number, total_length_m: number }[]): RegionData['engagementData']['yearOverYearChanges'] | undefined {
  if (aggregates.length < 2) return undefined
  
  // Sort by year descending to get current and previous year
  const sorted = [...aggregates].sort((a, b) => b.year - a.year)
  const current = sorted[0]
  const previous = sorted[1]

  const calculatePercentChange = (current: number, previous: number): number => {
    if (current === 0 && previous === 0) return 0
    if (previous === 0) return 100
    const change = ((current - previous) / previous) * 100
    return Math.round(change)
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

      // Single RPC call replacing 7–8 parallel HTTP requests
      const yearParam = year ? `&year=${year}` : ''
      const panelResponse = await fetch(`/api/analytics/region-panel?regionId=${regionId}${yearParam}`)

      if (!panelResponse.ok) {
        throw new Error(`Failed to fetch region panel data: ${panelResponse.statusText}`)
      }

      const panelApiData: { data: {
        region: ApiRegionData['region'] | null
        parent: ApiRegionData['parent']
        aggregates: ApiRegionData['aggregates']
        effectiveYear: number | null
        materials: MaterialBreakdown[]
        sources: SourceBreakdown[]
        litterItems: LitterItemBreakdown[]
        plasticFragmentsItem: LitterItemBreakdown | null
        ukComparison: {
          aggregates: ApiRegionData['aggregates']
          materials: MaterialBreakdown[]
        } | null
      } } = await panelResponse.json()

      const panelData = panelApiData.data
      const { region, parent, aggregates = [] } = panelData

      if (!region) {
        throw new Error('Region not found')
      }

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

      // --- Materials ---
      let topItems: RegionData['litterData']['topItems'] = []
      let materialBreakdown: RegionData['litterData']['materialBreakdown'] = []
      if (panelData.materials.length > 0) {
        topItems = panelData.materials.slice(0, 5).map(item => ({
          category: item.material.name,
          count: item.total,
          percentage: item.presence
        }))
        const totalAvgPer100m = panelData.materials.reduce((sum, item) => sum + item.avgPer100m, 0)
        materialBreakdown = panelData.materials.map(item => ({
          material: item.material.name,
          count: item.total,
          avgPer100m: item.avgPer100m,
          percentage: totalAvgPer100m > 0 ? (item.avgPer100m / totalAvgPer100m) * 100 : 0,
          presence: item.presence,
          yearOverYearChange: item.yearOverYearChange
        }))
      }

      // --- Sources ---
      let sourceBreakdown: RegionData['litterData']['sourceBreakdown'] = []
      if (panelData.sources.length > 0) {
        const totalAvgPer100m = panelData.sources.reduce((sum, item) => sum + item.avgPer100m, 0)
        sourceBreakdown = panelData.sources.map(item => ({
          source: item.source.name,
          count: item.total,
          avgPer100m: item.avgPer100m,
          percentage: totalAvgPer100m > 0 ? (item.avgPer100m / totalAvgPer100m) * 100 : 0,
          presence: item.presence,
          yearOverYearChange: item.yearOverYearChange
        }))
      }

      // --- Litter items (exclude plastic/polystyrene 0-2.5cm — shown separately) ---
      // Sort by avgPer100m desc, then total desc as tiebreaker
      const topLitterItems: LitterItemBreakdown[] = panelData.litterItems
        .filter(item => item.item.name !== 'Plastic/Polystyrene: Plastic/polystyrene pieces 0 - 2.5cm')
        .sort((a, b) => b.avgPer100m - a.avgPer100m || b.total - a.total)

      // --- Plastic pieces ---
      let plasticFragmentsItem: { avgPer100m: number; presence: number } | undefined = undefined
      if (panelData.plasticFragmentsItem) {
        plasticFragmentsItem = {
          avgPer100m: panelData.plasticFragmentsItem.avgPer100m,
          presence: panelData.plasticFragmentsItem.presence
        }
      }

      // --- Trend data: built from aggregates (all years, no extra request) ---
      const trendData: RegionData['litterData']['trendData'] = aggregates.length > 0
        ? [...aggregates]
            .sort((a, b) => a.year - b.year)
            .map(agg => ({
              year: agg.year,
              averageLitterPer100m: agg.avg_per_100m,
              surveyCount: agg.total_surveys,
              date: `${agg.year}-01-01`
            }))
        : undefined

      // --- Filter aggregates to effective year ---
      const effectiveYear = panelData.effectiveYear
      const filteredAggregates = effectiveYear
        ? aggregates.filter(agg => agg.year === effectiveYear)
        : aggregates.length > 0
        ? [aggregates.sort((a, b) => b.year - a.year)[0]]
        : []

      // Detect "no data for selected year" (region has data in other years, but not this one)
      const lastDataYear = aggregates.length > 0
        ? Math.max(...aggregates.map((a) => a.year))
        : undefined

      if (filteredAggregates.length === 0) {
        return {
          id: region.id.toString(),
          name: region.name,
          level: region.type === 'Country' || region.type === 'Crown Dependency' ? 'country' :
                 region.type === 'County Unitary' ? 'county' : 'region',
          parentId: region.parent_id?.toString(),
          parentName: parent?.name,
          hasData: true,
          hasDataForYear: false,
          lastDataYear,
          suggestedRegions: generateSuggestedRegions(region.id)
        }
      }

      const averageLitterPer100m = filteredAggregates.length > 0
        ? filteredAggregates.reduce((sum, agg) => sum + agg.avg_per_100m, 0) / filteredAggregates.length
        : 0

      const yearOverYearChange = calculateYearOverYearChange(aggregates, year)

      // --- UK comparison ---
      let ukAverageComparison: RegionData['litterData']['ukAverageComparison'] = undefined
      let plasticPolystyreneComparison: RegionData['litterData']['plasticPolystyreneComparison'] = undefined

      if (panelData.ukComparison && region.name !== 'United Kingdom') {
        const ukAggregates = panelData.ukComparison.aggregates ?? []

        if (ukAggregates.length > 0) {
          const filteredUkAggregates = effectiveYear
            ? ukAggregates.filter(agg => agg.year === effectiveYear)
            : [ukAggregates.sort((a, b) => b.year - a.year)[0]]

          if (filteredUkAggregates.length > 0) {
            const ukAverage = filteredUkAggregates.reduce((sum, agg) => sum + agg.avg_per_100m, 0) / filteredUkAggregates.length
            ukAverageComparison = calculateUkAverageComparison(averageLitterPer100m, ukAverage)
          }
        }

        // Plastic/polystyrene comparison using RPC-provided UK materials
        const ukMaterials = panelData.ukComparison.materials ?? []
        if (ukMaterials.length > 0 && materialBreakdown.length > 0) {
          const regionalPlastic = materialBreakdown.find(m =>
            m.material.toLowerCase().includes('plastic') || m.material.toLowerCase().includes('polystyrene')
          )
          const ukPlastic = ukMaterials.find(m =>
            m.material.name.toLowerCase().includes('plastic') || m.material.name.toLowerCase().includes('polystyrene')
          )
          if (regionalPlastic && ukPlastic) {
            const ukTotalAvgPer100m = ukMaterials.reduce((sum, item) => sum + item.avgPer100m, 0)
            const ukPlasticShare = ukTotalAvgPer100m > 0 ? (ukPlastic.avgPer100m / ukTotalAvgPer100m) * 100 : 0
            plasticPolystyreneComparison = {
              regionalAvgPer100m: regionalPlastic.avgPer100m,
              regionalShare: regionalPlastic.percentage,
              ukShare: ukPlasticShare,
              shareDifference: regionalPlastic.percentage - ukPlasticShare
            }
          }
        }
      }

      // --- Aggregate totals ---
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
          plasticFragmentsItem,
          averageLitterPer100m,
          yearOverYearChange,
          ukAverageComparison,
          plasticPolystyreneComparison,
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

