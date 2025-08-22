'use client'

import { useQuery } from '@tanstack/react-query'
import type { FilterRegion } from '@/types/filter-types'

interface RegionApiResponse {
  id: number
  name: string
  parent_id: number | null
  type: string
  code: string
  has_data: boolean
}


// Hook to fetch all regions for filtering
export function useFilterRegions() {
  return useQuery({
    queryKey: ['filter-regions'],
    queryFn: async (): Promise<FilterRegion[]> => {
      const response = await fetch('/api/regions?includeGeometry=false&limit=1000')
      if (!response.ok) {
        throw new Error('Failed to fetch regions for filtering')
      }
      
      const data = await response.json()
      return data.data.map((region: RegionApiResponse) => ({
        id: region.id,
        name: region.name,
        parent_id: region.parent_id,
        type: region.type,
        code: region.code,
        has_data: region.has_data,
      }) as FilterRegion)
    },
    staleTime: 30 * 60 * 1000, // 30 minutes
    refetchOnWindowFocus: false,
  })
}



// Hook to fetch available years range
export function useAvailableYears() {
  return useQuery({
    queryKey: ['available-years'],
    queryFn: async (): Promise<{ min: number; max: number }> => {
      const response = await fetch('/api/years')
      if (!response.ok) {
        throw new Error('Failed to fetch available years')
      }
      
      const data = await response.json()
      return {
        min: data.minYear,
        max: data.maxYear,
      }
    },
    staleTime: 24 * 60 * 60 * 1000, // 24 hours
    refetchOnWindowFocus: false,
  })
}

// Combined hook for all filter options
export function useFilterOptions() {
  const regionsQuery = useFilterRegions()
  const yearsQuery = useAvailableYears()

  const isLoading = regionsQuery.isLoading || yearsQuery.isLoading

  const error = regionsQuery.error || yearsQuery.error

  return {
    data: {
      regions: regionsQuery.data || [],
      availableYears: yearsQuery.data || { min: 2020, max: 2024 }, // fallback
    },
    isLoading,
    error,
    refetch: () => {
      regionsQuery.refetch()
      yearsQuery.refetch()
    },
  }
}