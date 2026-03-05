'use client'

import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

export interface ChildRegionStat {
  id: string
  name: string
  type: string
  hasData: boolean
  hasDataForYear: boolean
  avgPer100m: number | null
  avgPer100mYoY: number | null
  totalSurveys: number | null
  totalSurveysYoY: number | null
  totalVolunteers: number | null
  totalVolunteersYoY: number | null
  totalLitter: number | null
  totalWeightKg: number | null
  totalLengthM: number | null
}

function calcYoY(current: number | null | undefined, previous: number | null | undefined): number | null {
  if (current == null || previous == null) return null
  if (previous === 0) return current === 0 ? 0 : 100
  return Math.round(((current - previous) / previous) * 100)
}

export function useChildRegionStats(parentId: string | null, year?: number) {
  return useQuery({
    queryKey: ['child-region-stats', parentId, year],
    queryFn: async (): Promise<ChildRegionStat[]> => {
      if (!parentId) return []

      const numericParentId = parseInt(parentId)
      if (isNaN(numericParentId)) return []

      // Fetch direct children of this region
      const { data: children, error: childrenError } = await supabase
        .from('regions')
        .select('id, name, type, has_data')
        .eq('parent_id', numericParentId)
        .order('name')

      if (childrenError || !children || children.length === 0) {
        return []
      }

      const childIds = children.map(c => c.id)

      // Fetch all aggregates for all children in one query
      const { data: aggregates } = await supabase
        .from('annual_region_aggregates')
        .select('region_id, year, avg_per_100m, total_surveys, total_volunteers, total_litter, total_weight_kg, total_length_m')
        .in('region_id', childIds)
        .order('year', { ascending: false })

      // Group aggregates by child region id
      const aggregatesByRegion = new Map<number, NonNullable<typeof aggregates>>()
      aggregates?.forEach(agg => {
        if (!aggregatesByRegion.has(agg.region_id)) {
          aggregatesByRegion.set(agg.region_id, [])
        }
        aggregatesByRegion.get(agg.region_id)!.push(agg)
      })

      return children.map(child => {
        const childAggregates = aggregatesByRegion.get(child.id) ?? []

        // Find aggregate for the selected year, fall back to the most recent
        const target = year
          ? childAggregates.find(a => a.year === year)
          : childAggregates[0] // already sorted desc

        // Find the previous year's aggregate for YoY calculations
        const targetYear = target ? target.year : null
        const prev = targetYear
          ? childAggregates.find(a => a.year === targetYear - 1)
          : childAggregates[1] // second most recent

        return {
          id: child.id.toString(),
          name: child.name,
          type: child.type,
          hasData: child.has_data,
          hasDataForYear: target != null,
          avgPer100m: target?.avg_per_100m ?? null,
          avgPer100mYoY: calcYoY(target?.avg_per_100m, prev?.avg_per_100m),
          totalSurveys: target?.total_surveys ?? null,
          totalSurveysYoY: calcYoY(target?.total_surveys, prev?.total_surveys),
          totalVolunteers: target?.total_volunteers ?? null,
          totalVolunteersYoY: calcYoY(target?.total_volunteers, prev?.total_volunteers),
          totalLitter: target?.total_litter ?? null,
          totalWeightKg: target?.total_weight_kg ?? null,
          totalLengthM: target?.total_length_m ?? null,
        }
      })
    },
    enabled: !!parentId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}
