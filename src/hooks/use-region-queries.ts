'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { RegionQueries, type RegionWithRelations, type HierarchyQueryOptions, type RegionQueryOptions } from '@/lib/region-queries'
import type { Tables } from '@/lib/database.types'

// Query key factories for consistent cache management
export const regionKeys = {
  all: ['regions'] as const,
  lists: () => [...regionKeys.all, 'list'] as const,
  list: (filters: string) => [...regionKeys.lists(), { filters }] as const,
  details: () => [...regionKeys.all, 'detail'] as const,
  detail: (id: number) => [...regionKeys.details(), id] as const,
  hierarchy: (options?: HierarchyQueryOptions) => [...regionKeys.all, 'hierarchy', options] as const,
  search: (term: string, options?: RegionQueryOptions) => [...regionKeys.all, 'search', { term, options }] as const,
  byParent: (parentId: number | null, options?: RegionQueryOptions) => 
    [...regionKeys.all, 'byParent', { parentId, options }] as const,
  byType: (type: string, options?: RegionQueryOptions) => 
    [...regionKeys.all, 'byType', { type, options }] as const,
  path: (id: number) => [...regionKeys.all, 'path', id] as const,
  statistics: () => [...regionKeys.all, 'statistics'] as const,
}

// Custom hooks for region queries

// Hook for fetching regions by parent
export function useRegionsByParent(
  parentId: number | null,
  options: RegionQueryOptions = {},
  queryOptions?: {
    enabled?: boolean
    staleTime?: number
    refetchOnWindowFocus?: boolean
  }
) {
  const regionQueries = new RegionQueries()
  
  return useQuery({
    queryKey: regionKeys.byParent(parentId, options),
    queryFn: () => regionQueries.findRegionsByParent(parentId, options),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    ...queryOptions
  })
}

// Hook for fetching complete hierarchy
export function useRegionHierarchy(
  rootId?: number,
  options: HierarchyQueryOptions = {},
  queryOptions?: {
    enabled?: boolean
    staleTime?: number
    refetchOnWindowFocus?: boolean
  }
) {
  const regionQueries = new RegionQueries()
  
  return useQuery({
    queryKey: regionKeys.hierarchy({ rootId, ...options }),
    queryFn: () => regionQueries.getRegionHierarchy(rootId, options),
    staleTime: 10 * 60 * 1000, // 10 minutes for hierarchy data
    refetchOnWindowFocus: false,
    ...queryOptions
  })
}

// Hook for searching regions
export function useRegionSearch(
  searchTerm: string,
  options: RegionQueryOptions = {},
  queryOptions?: {
    enabled?: boolean
    debounceMs?: number
  }
) {
  const regionQueries = new RegionQueries()
  
  return useQuery({
    queryKey: regionKeys.search(searchTerm, options),
    queryFn: () => regionQueries.searchRegionsByName(searchTerm, options),
    enabled: (queryOptions?.enabled !== false) && searchTerm.length >= 2,
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchOnWindowFocus: false,
    ...queryOptions
  })
}

// Hook for fetching regions by type
export function useRegionsByType(
  type: 'UK' | 'Country' | 'Crown Dependency' | 'County Unitary',
  options: RegionQueryOptions = {},
  queryOptions?: {
    enabled?: boolean
    staleTime?: number
  }
) {
  const regionQueries = new RegionQueries()
  
  return useQuery({
    queryKey: regionKeys.byType(type, options),
    queryFn: () => regionQueries.getRegionsByType(type, options),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    ...queryOptions
  })
}

// Hook for fetching region path (breadcrumb)
export function useRegionPath(
  regionId: number,
  queryOptions?: {
    enabled?: boolean
    staleTime?: number
  }
) {
  const regionQueries = new RegionQueries()
  
  return useQuery({
    queryKey: regionKeys.path(regionId),
    queryFn: () => regionQueries.getRegionPath(regionId),
    enabled: queryOptions?.enabled !== false && regionId > 0,
    staleTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    ...queryOptions
  })
}

// Hook for fetching region statistics
export function useRegionStatistics(
  queryOptions?: {
    enabled?: boolean
    staleTime?: number
    refetchInterval?: number
  }
) {
  const regionQueries = new RegionQueries()
  
  return useQuery({
    queryKey: regionKeys.statistics(),
    queryFn: () => regionQueries.getRegionStatistics(),
    staleTime: 15 * 60 * 1000, // 15 minutes
    refetchInterval: 30 * 60 * 1000, // Refetch every 30 minutes
    refetchOnWindowFocus: false,
    ...queryOptions
  })
}

// Hook for validating hierarchy
export function useHierarchyValidation(
  queryOptions?: {
    enabled?: boolean
    staleTime?: number
  }
) {
  const regionQueries = new RegionQueries()
  
  return useQuery({
    queryKey: [...regionKeys.all, 'validation'],
    queryFn: () => regionQueries.validateHierarchy(),
    staleTime: 30 * 60 * 1000, // 30 minutes
    refetchOnWindowFocus: false,
    ...queryOptions
  })
}

// Custom hook for fetching individual region with API route fallback
export function useRegion(
  regionId: number,
  options: RegionQueryOptions = {},
  queryOptions?: {
    enabled?: boolean
    staleTime?: number
  }
) {
  return useQuery({
    queryKey: regionKeys.detail(regionId),
    queryFn: async (): Promise<RegionWithRelations | null> => {
      // Try API route first
      try {
        const params = new URLSearchParams()
        if (options.includeGeometry !== false) params.set('includeGeometry', 'true')
        if (options.includeChildren) params.set('includeChildren', 'true')
        if (options.includeParent) params.set('includeParent', 'true')
        if (options.includeAggregates) params.set('includeAggregates', 'true')
        
        const response = await fetch(`/api/regions/${regionId}?${params}`)
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`)
        }
        
        const data = await response.json()
        return data.region || null
        
      } catch (error) {
        console.warn('API route failed, falling back to direct query:', error)
        
        // Fallback to direct Supabase query
        const regionQueries = new RegionQueries()
        const results = await regionQueries.findRegionsByParent(null, { 
          ...options,
          onlyWithData: false 
        })
        
        return results.find(r => r.id === regionId) || null
      }
    },
    enabled: (queryOptions?.enabled !== false) && regionId > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    ...queryOptions
  })
}

// Mutation hooks for potential future use
export function useInvalidateRegions() {
  const queryClient = useQueryClient()
  
  return {
    invalidateAll: () => queryClient.invalidateQueries({ queryKey: regionKeys.all }),
    invalidateHierarchy: () => queryClient.invalidateQueries({ queryKey: regionKeys.hierarchy() }),
    invalidateByParent: (parentId: number | null) => 
      queryClient.invalidateQueries({ queryKey: regionKeys.byParent(parentId) }),
    invalidateDetail: (id: number) => 
      queryClient.invalidateQueries({ queryKey: regionKeys.detail(id) }),
    invalidateStatistics: () => 
      queryClient.invalidateQueries({ queryKey: regionKeys.statistics() }),
  }
}

// Prefetch helpers
export function usePrefetchRegions() {
  const queryClient = useQueryClient()
  const regionQueries = new RegionQueries()
  
  return {
    prefetchHierarchy: (rootId?: number, options: HierarchyQueryOptions = {}) => {
      queryClient.prefetchQuery({
        queryKey: regionKeys.hierarchy({ rootId, ...options }),
        queryFn: () => regionQueries.getRegionHierarchy(rootId, options),
        staleTime: 10 * 60 * 1000,
      })
    },
    
    prefetchByParent: (parentId: number | null, options: RegionQueryOptions = {}) => {
      queryClient.prefetchQuery({
        queryKey: regionKeys.byParent(parentId, options),
        queryFn: () => regionQueries.findRegionsByParent(parentId, options),
        staleTime: 5 * 60 * 1000,
      })
    },
    
    prefetchStatistics: () => {
      queryClient.prefetchQuery({
        queryKey: regionKeys.statistics(),
        queryFn: () => regionQueries.getRegionStatistics(),
        staleTime: 15 * 60 * 1000,
      })
    }
  }
}

// Utility hooks
export function useRegionCache() {
  const queryClient = useQueryClient()
  
  return {
    getRegionFromCache: (id: number): RegionWithRelations | undefined => {
      return queryClient.getQueryData(regionKeys.detail(id))
    },
    
    setRegionInCache: (id: number, region: RegionWithRelations) => {
      queryClient.setQueryData(regionKeys.detail(id), region)
    },
    
    updateRegionInCache: (id: number, updater: (old: RegionWithRelations | undefined) => RegionWithRelations) => {
      queryClient.setQueryData(regionKeys.detail(id), updater)
    },
    
    removeRegionFromCache: (id: number) => {
      queryClient.removeQueries({ queryKey: regionKeys.detail(id) })
    }
  }
}