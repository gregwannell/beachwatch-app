import { QueryClient } from '@tanstack/react-query'

// Factory for creating per-request server-side query clients
export function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000, // 1 minute — fresh enough to avoid hydration mismatches
      },
    },
  })
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Enhanced Supabase-optimized cache settings
      staleTime: 5 * 60 * 1000, // 5 minutes for most data
      gcTime: 30 * 60 * 1000, // 30 minutes garbage collection (extended for geo data)
      retry: (failureCount, error: unknown) => {
        // Custom retry logic for Supabase errors
        const hasMessage = (e: unknown): e is { message: string } =>
          typeof e === 'object' && e !== null && 'message' in e
        const hasStatus = (e: unknown): e is { status: number } =>
          typeof e === 'object' && e !== null && 'status' in e

        if (hasMessage(error) && error.message.includes('PGRST')) {
          // PostgreSQL REST errors - retry less aggressively
          return failureCount < 2
        }
        if (hasStatus(error) && error.status === 429) {
          // Rate limiting - retry with backoff
          return failureCount < 3
        }
        if (hasStatus(error) && error.status >= 500) {
          // Server errors - retry
          return failureCount < 3
        }
        // Client errors - don't retry
        return false
      },
      retryDelay: (attemptIndex, error: unknown) => {
        // Exponential backoff with jitter for Supabase
        const baseDelay = 1000 * 2 ** attemptIndex
        const hasStatus = (e: unknown): e is { status: number } =>
          typeof e === 'object' && e !== null && 'status' in e
        const maxDelay = (hasStatus(error) && error.status === 429) ? 60000 : 30000 // Longer delay for rate limits
        const jitter = Math.random() * 0.1 * baseDelay // Add 10% jitter
        return Math.min(baseDelay + jitter, maxDelay)
      },
      refetchOnWindowFocus: false,
      refetchOnMount: true,
      refetchOnReconnect: 'always',
      // Custom network mode for better offline handling
      networkMode: 'online',
      // Custom meta for Supabase queries
      meta: {
        persistToStorage: false, // We'll handle persistence manually for geo data
      }
    },
    mutations: {
      retry: (failureCount, error: unknown) => {
        // Only retry mutations for server errors, not client errors
        const hasStatus = (e: unknown): e is { status: number } =>
          typeof e === 'object' && e !== null && 'status' in e
        if (hasStatus(error) && error.status >= 500) {
          return failureCount < 1
        }
        return false
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 5000),
      // Mutation meta for optimistic updates
      meta: {
        optimisticUpdates: true,
      }
    },
  },
})

// Enhanced query client with Supabase-specific methods
export class SupabaseQueryClient {
  private client: QueryClient
  
  constructor(client: QueryClient) {
    this.client = client
  }
  
  // Optimized caching for large geometry datasets
  setGeometryCache(queryKey: unknown[], data: unknown, options?: {
    staleTime?: number
    priority?: 'low' | 'normal' | 'high'
  }) {
    const staleTime = options?.priority === 'high' 
      ? 15 * 60 * 1000 // 15 minutes for high priority
      : options?.priority === 'low' 
      ? 2 * 60 * 1000   // 2 minutes for low priority
      : 5 * 60 * 1000   // 5 minutes default
    
    this.client.setQueryData(queryKey, data, {
      updatedAt: Date.now(),
    })
    
    // Set custom stale time
    this.client.setQueryDefaults(queryKey, {
      staleTime,
      gcTime: staleTime * 6, // Keep in cache 6x longer than stale time
    })
  }
  
  // Prefetch strategy for region hierarchies
  async prefetchRegionHierarchy(rootId?: number, depth: number = 3) {
    const prefetchPromises: Promise<unknown>[] = []
    
    // Prefetch root regions first
    prefetchPromises.push(
      this.client.prefetchQuery({
        queryKey: ['regions', 'hierarchy', { rootId, maxDepth: 1 }],
        queryFn: () => fetch(`/api/regions/hierarchy?${new URLSearchParams({
          ...(rootId && { rootId: rootId.toString() }),
          maxDepth: '1'
        })}`).then(r => r.json()),
        staleTime: 10 * 60 * 1000,
      })
    )
    
    // Prefetch deeper levels progressively
    for (let i = 2; i <= depth; i++) {
      prefetchPromises.push(
        this.client.prefetchQuery({
          queryKey: ['regions', 'hierarchy', { rootId, maxDepth: i }],
          queryFn: () => fetch(`/api/regions/hierarchy?${new URLSearchParams({
            ...(rootId && { rootId: rootId.toString() }),
            maxDepth: i.toString()
          })}`).then(r => r.json()),
          staleTime: 8 * 60 * 1000, // Slightly shorter for deeper data
        })
      )
    }
    
    return Promise.allSettled(prefetchPromises)
  }
  
  // Smart invalidation for related region queries
  invalidateRegionQueries(regionId?: number, options?: {
    includeHierarchy?: boolean
    includeChildren?: boolean
    includeParent?: boolean
  }) {
    const promises: Promise<void>[] = []
    
    if (regionId) {
      // Invalidate specific region
      promises.push(this.client.invalidateQueries({
        queryKey: ['regions', 'detail', regionId]
      }))
      
      // Invalidate parent's children if needed
      if (options?.includeParent) {
        promises.push(this.client.invalidateQueries({
          queryKey: ['regions', 'byParent']
        }))
      }
      
      // Invalidate region's children if needed  
      if (options?.includeChildren) {
        promises.push(this.client.invalidateQueries({
          queryKey: ['regions', 'byParent', { parentId: regionId }]
        }))
      }
    }
    
    // Invalidate hierarchy if requested
    if (options?.includeHierarchy) {
      promises.push(this.client.invalidateQueries({
        queryKey: ['regions', 'hierarchy']
      }))
    }
    
    return Promise.allSettled(promises)
  }
  
  // Background sync for region data
  startBackgroundSync(intervalMs: number = 30 * 60 * 1000) { // Default 30 minutes
    return setInterval(async () => {
      try {
        // Refetch critical region statistics in background
        await this.client.refetchQueries({
          queryKey: ['regions', 'statistics'],
          type: 'active'
        })
        
        // Refetch any stale hierarchy data
        await this.client.refetchQueries({
          queryKey: ['regions', 'hierarchy'],
          type: 'active',
          stale: true
        })
        
      } catch (error) {
        console.warn('Background sync failed:', error)
      }
    }, intervalMs)
  }
  
  // Memory optimization for large datasets
  optimizeMemoryUsage() {
    // Clear old queries but keep frequently accessed ones
    this.client.getQueryCache().getAll().forEach(query => {
      const age = Date.now() - query.state.dataUpdatedAt
      const isLargeGeometry = query.state.data && 
        typeof query.state.data === 'object' && 
        'geometry' in query.state.data
      
      // Remove large geometry data older than 10 minutes unless recently accessed
      if (isLargeGeometry && age > 10 * 60 * 1000 && 
          Date.now() - query.state.dataUpdatedAt > 5 * 60 * 1000) {
        this.client.removeQueries({ queryKey: query.queryKey })
      }
    })
  }
  
  // Get cache statistics
  getCacheStats() {
    const cache = this.client.getQueryCache()
    const queries = cache.getAll()
    
    let totalSize = 0
    let geometryQueries = 0
    let staleQueries = 0
    
    queries.forEach(query => {
      const dataSize = JSON.stringify(query.state.data || {}).length
      totalSize += dataSize
      
      if (query.state.data && typeof query.state.data === 'object' && 'geometry' in query.state.data) {
        geometryQueries++
      }
      
      if (query.isStale()) {
        staleQueries++
      }
    })
    
    return {
      totalQueries: queries.length,
      approximateSize: `${Math.round(totalSize / 1024)}KB`,
      geometryQueries,
      staleQueries,
      hitRate: cache.getAll().filter(q => !q.isStale()).length / queries.length
    }
  }
}

// Create enhanced client instance
export const supabaseQueryClient = new SupabaseQueryClient(queryClient)