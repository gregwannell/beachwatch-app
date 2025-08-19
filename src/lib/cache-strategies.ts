import { queryClient } from './query-client'
import { regionKeys } from '@/hooks/use-region-queries'
import type { RegionWithRelations } from './region-queries'
import type { Tables } from './database.types'

// Cache strategy configurations for different data types
export const CACHE_STRATEGIES = {
  // Static reference data (rarely changes)
  REFERENCE_DATA: {
    staleTime: 60 * 60 * 1000,      // 1 hour
    gcTime: 24 * 60 * 60 * 1000,   // 24 hours
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  },
  
  // Regional hierarchy (changes infrequently)
  HIERARCHY_DATA: {
    staleTime: 30 * 60 * 1000,      // 30 minutes
    gcTime: 2 * 60 * 60 * 1000,    // 2 hours  
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  },
  
  // Geometry data (large, stable)
  GEOMETRY_DATA: {
    staleTime: 45 * 60 * 1000,      // 45 minutes
    gcTime: 4 * 60 * 60 * 1000,    // 4 hours
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  },
  
  // Aggregate statistics (updated daily)
  STATISTICS_DATA: {
    staleTime: 15 * 60 * 1000,      // 15 minutes
    gcTime: 60 * 60 * 1000,        // 1 hour
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    refetchInterval: 30 * 60 * 1000, // Refetch every 30 minutes
  },
  
  // Search results (short-lived)
  SEARCH_DATA: {
    staleTime: 5 * 60 * 1000,       // 5 minutes
    gcTime: 15 * 60 * 1000,        // 15 minutes
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  },
  
  // User interaction data (very short-lived)
  INTERACTIVE_DATA: {
    staleTime: 1 * 60 * 1000,       // 1 minute
    gcTime: 5 * 60 * 1000,         // 5 minutes
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  }
}

// Preloading strategies for common user flows
export class CachePreloadingStrategies {
  
  // Preload essential hierarchy data on app initialization
  static async preloadEssentialData() {
    const promises = [
      // UK root regions
      queryClient.prefetchQuery({
        queryKey: regionKeys.hierarchy({ maxDepth: 1 }),
        queryFn: () => fetch('/api/regions/hierarchy?maxDepth=1').then(r => r.json()),
        ...CACHE_STRATEGIES.HIERARCHY_DATA
      }),
      
      // Statistics for dashboard
      queryClient.prefetchQuery({
        queryKey: regionKeys.statistics(),
        queryFn: () => fetch('/api/regions?includeGeometry=false&limit=0').then(r => r.json()),
        ...CACHE_STRATEGIES.STATISTICS_DATA
      }),
      
      // Countries for navigation
      queryClient.prefetchQuery({
        queryKey: regionKeys.byType('Country', { includeGeometry: false }),
        queryFn: () => fetch('/api/regions?type=Country&includeGeometry=false').then(r => r.json()),
        ...CACHE_STRATEGIES.REFERENCE_DATA
      })
    ]
    
    return Promise.allSettled(promises)
  }
  
  // Progressive loading strategy for region exploration
  static async preloadRegionExploration(regionId: number) {
    const promises = []
    
    // Load the specific region with geometry
    promises.push(
      queryClient.prefetchQuery({
        queryKey: regionKeys.detail(regionId),
        queryFn: () => fetch(`/api/regions/${regionId}?includeGeometry=true&includeChildren=true&includeParent=true`).then(r => r.json()),
        ...CACHE_STRATEGIES.GEOMETRY_DATA
      })
    )
    
    // Load region path for breadcrumbs
    promises.push(
      queryClient.prefetchQuery({
        queryKey: regionKeys.path(regionId),
        queryFn: async () => {
          const response = await fetch(`/api/regions/${regionId}?includeParent=true`)
          const data = await response.json()
          // Build path by following parent chain
          const path = []
          let current = data.region
          while (current) {
            path.unshift(current)
            current = current.parent
          }
          return path
        },
        ...CACHE_STRATEGIES.REFERENCE_DATA
      })
    )
    
    // Preload children for faster navigation
    promises.push(
      queryClient.prefetchQuery({
        queryKey: regionKeys.byParent(regionId, { includeGeometry: false }),
        queryFn: () => fetch(`/api/regions?parentId=${regionId}&includeGeometry=false`).then(r => r.json()),
        ...CACHE_STRATEGIES.HIERARCHY_DATA
      })
    )
    
    return Promise.allSettled(promises)
  }
  
  // Preload data for map interactions
  static async preloadMapData(bounds: {
    north: number, south: number, east: number, west: number
  }) {
    // For now, preload all regions with geometry (in a real app, you'd filter by bounds)
    return queryClient.prefetchQuery({
      queryKey: regionKeys.list('map-bounds'),
      queryFn: () => fetch('/api/regions?includeGeometry=true&hasData=true').then(r => r.json()),
      ...CACHE_STRATEGIES.GEOMETRY_DATA
    })
  }
  
  // Preload search suggestions
  static async preloadSearchSuggestions() {
    const commonSearchTerms = ['england', 'scotland', 'wales', 'cornwall', 'yorkshire']
    
    const promises = commonSearchTerms.map(term =>
      queryClient.prefetchQuery({
        queryKey: regionKeys.search(term, { includeGeometry: false }),
        queryFn: () => fetch(`/api/regions?search=${encodeURIComponent(term)}&includeGeometry=false&limit=10`).then(r => r.json()),
        ...CACHE_STRATEGIES.SEARCH_DATA
      })
    )
    
    return Promise.allSettled(promises)
  }
}

// Cache optimization utilities
export class CacheOptimizer {
  
  // Analyze cache usage patterns
  static analyzeCacheUsage() {
    const cache = queryClient.getQueryCache()
    const queries = cache.getAll()
    
    const analysis = {
      totalQueries: queries.length,
      queryTypes: {} as Record<string, number>,
      memoryUsage: 0,
      staleness: {
        fresh: 0,
        stale: 0,
        inactive: 0
      },
      accessPatterns: {} as Record<string, { hits: number, lastAccess: number }>
    }
    
    queries.forEach(query => {
      const keyType = query.queryKey[1] as string || 'unknown'
      analysis.queryTypes[keyType] = (analysis.queryTypes[keyType] || 0) + 1
      
      // Estimate memory usage
      if (query.state.data) {
        analysis.memoryUsage += JSON.stringify(query.state.data).length
      }
      
      // Analyze staleness
      if (query.isStale()) {
        analysis.staleness.stale++
      } else if (query.getObserversCount() > 0) {
        analysis.staleness.fresh++
      } else {
        analysis.staleness.inactive++
      }
      
      // Track access patterns
      const keyString = JSON.stringify(query.queryKey)
      if (!analysis.accessPatterns[keyString]) {
        analysis.accessPatterns[keyString] = {
          hits: 0,
          lastAccess: query.state.dataUpdatedAt
        }
      }
      analysis.accessPatterns[keyString].hits++
    })
    
    analysis.memoryUsage = Math.round(analysis.memoryUsage / 1024) // Convert to KB
    
    return analysis
  }
  
  // Smart cache eviction based on usage patterns
  static optimizeCache() {
    const cache = queryClient.getQueryCache()
    const queries = cache.getAll()
    const now = Date.now()
    
    let removed = 0
    let sizeFreed = 0
    
    queries.forEach(query => {
      const age = now - query.state.dataUpdatedAt
      const isStale = query.isStale()
      const hasObservers = query.getObserversCount() > 0
      const dataSize = query.state.data ? JSON.stringify(query.state.data).length : 0
      
      // Remove if:
      // 1. Old and stale with no observers
      // 2. Very large geometry data that's been inactive
      // 3. Search queries older than 10 minutes
      
      const shouldRemove = 
        (age > 30 * 60 * 1000 && isStale && !hasObservers) || // 30 min old, stale, no observers
        (dataSize > 50000 && age > 10 * 60 * 1000 && !hasObservers) || // Large data, 10 min old, no observers
        (query.queryKey.includes('search') && age > 10 * 60 * 1000) // Search queries older than 10 min
      
      if (shouldRemove) {
        queryClient.removeQueries({ queryKey: query.queryKey })
        removed++
        sizeFreed += dataSize
      }
    })
    
    console.log(`Cache optimization: removed ${removed} queries, freed ${Math.round(sizeFreed / 1024)}KB`)
    
    return { removed, sizeFreed: Math.round(sizeFreed / 1024) }
  }
  
  // Prefetch based on user behavior prediction
  static async predictivePrefetch(currentRegionId?: number, userHistory?: number[]) {
    if (!currentRegionId && !userHistory?.length) return
    
    const promises = []
    
    // If user is viewing a region, prefetch its siblings and children
    if (currentRegionId) {
      // Get the region to find its parent
      const region = queryClient.getQueryData<RegionWithRelations>(
        regionKeys.detail(currentRegionId)
      )
      
      if (region?.parent_id) {
        // Prefetch siblings
        promises.push(
          queryClient.prefetchQuery({
            queryKey: regionKeys.byParent(region.parent_id),
            queryFn: () => fetch(`/api/regions?parentId=${region.parent_id}&includeGeometry=false`).then(r => r.json()),
            ...CACHE_STRATEGIES.HIERARCHY_DATA
          })
        )
      }
      
      // Prefetch children
      promises.push(
        queryClient.prefetchQuery({
          queryKey: regionKeys.byParent(currentRegionId),
          queryFn: () => fetch(`/api/regions?parentId=${currentRegionId}&includeGeometry=false`).then(r => r.json()),
          ...CACHE_STRATEGIES.HIERARCHY_DATA
        })
      )
    }
    
    // Prefetch frequently accessed regions from history
    if (userHistory?.length) {
      const frequentRegions = userHistory.slice(-5) // Last 5 accessed regions
      
      frequentRegions.forEach(regionId => {
        promises.push(
          queryClient.prefetchQuery({
            queryKey: regionKeys.detail(regionId),
            queryFn: () => fetch(`/api/regions/${regionId}?includeGeometry=true`).then(r => r.json()),
            ...CACHE_STRATEGIES.GEOMETRY_DATA
          })
        )
      })
    }
    
    return Promise.allSettled(promises)
  }
}

// Cache warming for production deployment
export class CacheWarming {
  
  static async warmCacheForProduction() {
    console.log('Starting cache warming...')
    
    try {
      // Step 1: Essential data
      await CachePreloadingStrategies.preloadEssentialData()
      console.log('✓ Essential data preloaded')
      
      // Step 2: Search suggestions
      await CachePreloadingStrategies.preloadSearchSuggestions()
      console.log('✓ Search suggestions preloaded')
      
      // Step 3: Major regions with geometry (top-level regions)
      const majorRegionTypes = ['UK', 'Country']
      for (const type of majorRegionTypes) {
        await queryClient.prefetchQuery({
          queryKey: regionKeys.byType(type as any, { includeGeometry: true }),
          queryFn: () => fetch(`/api/regions?type=${type}&includeGeometry=true`).then(r => r.json()),
          ...CACHE_STRATEGIES.GEOMETRY_DATA
        })
      }
      console.log('✓ Major regions with geometry preloaded')
      
      const stats = CacheOptimizer.analyzeCacheUsage()
      console.log(`Cache warming complete: ${stats.totalQueries} queries, ${stats.memoryUsage}KB`)
      
    } catch (error) {
      console.error('Cache warming failed:', error)
    }
  }
}