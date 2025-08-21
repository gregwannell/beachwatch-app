'use client'

import { useQuery } from '@tanstack/react-query'
import type { MapRegion } from '@/types/map-types'

interface UseMapRegionsOptions {
  includeGeometry?: boolean
  onlyWithData?: boolean
  parentId?: number | null
}

export function useMapRegions(options: UseMapRegionsOptions = {}) {
  const { includeGeometry = true, onlyWithData = false, parentId } = options
  
  // Default to parentId = 1 (UK's children: countries and crown dependencies) when null
  const effectiveParentId = parentId === null ? 1 : parentId
  
  return useQuery({
    queryKey: ['map-regions', { includeGeometry, onlyWithData, parentId }],
    queryFn: async (): Promise<MapRegion[]> => {
      const params = new URLSearchParams()
      if (includeGeometry) params.set('includeGeometry', 'true')
      if (onlyWithData) params.set('hasData', 'true')
      if (effectiveParentId !== undefined) {
        params.set('parentId', effectiveParentId.toString())
      }
      
      const response = await fetch(`/api/regions?${params}`)
      if (!response.ok) {
        throw new Error('Failed to fetch regions')
      }
      
      const data = await response.json()
      return data.data || []
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
  })
}