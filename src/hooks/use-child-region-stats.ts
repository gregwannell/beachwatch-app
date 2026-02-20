'use client'

import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

export interface ChildRegionStat {
  id: string
  name: string
  type: string
  hasData: boolean
  avgPer100m: number | null
  totalSurveys: number | null
  totalLengthM: number | null
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
        .select('name_id, year, avg_per_100m, total_surveys, total_length_m')
        .in('name_id', childIds)
        .order('year', { ascending: false })

      // Group aggregates by child region id
      const aggregatesByRegion = new Map<number, NonNullable<typeof aggregates>>()
      aggregates?.forEach(agg => {
        if (!aggregatesByRegion.has(agg.name_id)) {
          aggregatesByRegion.set(agg.name_id, [])
        }
        aggregatesByRegion.get(agg.name_id)!.push(agg)
      })

      return children.map(child => {
        const childAggregates = aggregatesByRegion.get(child.id) ?? []

        // Find aggregate for the selected year, fall back to the most recent
        const target = year
          ? childAggregates.find(a => parseInt(a.year) === year)
          : childAggregates[0] // already sorted desc

        return {
          id: child.id.toString(),
          name: child.name,
          type: child.type,
          hasData: child.has_data,
          avgPer100m: target?.avg_per_100m ?? null,
          totalSurveys: target?.total_surveys ?? null,
          totalLengthM: target?.total_length_m ?? null,
        }
      })
    },
    enabled: !!parentId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}
