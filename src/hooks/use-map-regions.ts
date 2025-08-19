'use client'

import { useQuery } from '@tanstack/react-query'
import type { MapRegion } from '@/types/map-types'

interface UseMapRegionsOptions {
  includeGeometry?: boolean
  onlyWithData?: boolean
}

export function useMapRegions(options: UseMapRegionsOptions = {}) {
  const { includeGeometry = true, onlyWithData = false } = options
  
  return useQuery({
    queryKey: ['map-regions', { includeGeometry, onlyWithData }],
    queryFn: async (): Promise<MapRegion[]> => {
      const params = new URLSearchParams()
      if (includeGeometry) params.set('includeGeometry', 'true')
      if (onlyWithData) params.set('hasData', 'true')
      
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