'use client'

import { useQuery } from '@tanstack/react-query'
import type { FilterRegion } from '@/types/filter-types'

interface CategoryOption {
  id: string
  label: string
}

interface FilterOptionsResponse {
  regions: FilterRegion[]
  materials: CategoryOption[]
  sources: CategoryOption[]
  availableYears: { min: number; max: number }
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
      return data.data.map((region: any) => ({
        id: region.id,
        name: region.name,
        parent_id: region.parent_id,
        type: region.type,
        code: region.code,
        has_data: region.has_data,
      }))
    },
    staleTime: 30 * 60 * 1000, // 30 minutes
    refetchOnWindowFocus: false,
  })
}

// Hook to fetch materials options
export function useFilterMaterials() {
  return useQuery({
    queryKey: ['filter-materials'],
    queryFn: async (): Promise<CategoryOption[]> => {
      const response = await fetch('/api/materials')
      if (!response.ok) {
        throw new Error('Failed to fetch materials')
      }
      
      const data = await response.json()
      return data.data.map((material: any) => ({
        id: material.id.toString(),
        label: material.material,
      }))
    },
    staleTime: 60 * 60 * 1000, // 1 hour
    refetchOnWindowFocus: false,
  })
}

// Hook to fetch sources options
export function useFilterSources() {
  return useQuery({
    queryKey: ['filter-sources'],
    queryFn: async (): Promise<CategoryOption[]> => {
      const response = await fetch('/api/sources')
      if (!response.ok) {
        throw new Error('Failed to fetch sources')
      }
      
      const data = await response.json()
      return data.data.map((source: any) => ({
        id: source.id.toString(),
        label: source.source,
      }))
    },
    staleTime: 60 * 60 * 1000, // 1 hour
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
  const materialsQuery = useFilterMaterials()
  const sourcesQuery = useFilterSources()
  const yearsQuery = useAvailableYears()

  const isLoading = regionsQuery.isLoading || materialsQuery.isLoading || 
                   sourcesQuery.isLoading || yearsQuery.isLoading

  const error = regionsQuery.error || materialsQuery.error || 
               sourcesQuery.error || yearsQuery.error

  return {
    data: {
      regions: regionsQuery.data || [],
      materials: materialsQuery.data || [],
      sources: sourcesQuery.data || [],
      availableYears: yearsQuery.data || { min: 2020, max: 2024 }, // fallback
    },
    isLoading,
    error,
    refetch: () => {
      regionsQuery.refetch()
      materialsQuery.refetch()
      sourcesQuery.refetch()
      yearsQuery.refetch()
    },
  }
}