'use client'

import React, { createContext, useContext, useEffect, useRef, ReactNode } from 'react'
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { queryClient, supabaseQueryClient } from '@/lib/query-client'
import { supabase } from '@/lib/supabase'
import { regionKeys } from '@/hooks/use-region-queries'
import type { RealtimeChannel } from '@supabase/supabase-js'

interface SupabaseQueryContextValue {
  isConnected: boolean
  subscriptionCount: number
  cacheStats: ReturnType<typeof supabaseQueryClient.getCacheStats>
  optimizeCache: () => void
  startBackgroundSync: (intervalMs?: number) => number
  stopBackgroundSync: (intervalId: number) => void
}

const SupabaseQueryContext = createContext<SupabaseQueryContextValue | null>(null)

export function useSupabaseQuery() {
  const context = useContext(SupabaseQueryContext)
  if (!context) {
    throw new Error('useSupabaseQuery must be used within SupabaseQueryProvider')
  }
  return context
}

interface SupabaseQueryProviderProps {
  children: ReactNode
  enableRealtimeSync?: boolean
  backgroundSyncInterval?: number
  enableMemoryOptimization?: boolean
}

export function SupabaseQueryProvider({
  children,
  enableRealtimeSync = true,
  backgroundSyncInterval = 30 * 60 * 1000, // 30 minutes
  enableMemoryOptimization = true
}: SupabaseQueryProviderProps) {
  const subscriptionsRef = useRef<Map<string, RealtimeChannel>>(new Map())
  const backgroundSyncRef = useRef<number | null>(null)
  const memoryOptimizationRef = useRef<number | null>(null)
  const [isConnected, setIsConnected] = React.useState(false)
  const [subscriptionCount, setSubscriptionCount] = React.useState(0)
  const [cacheStats, setCacheStats] = React.useState(supabaseQueryClient.getCacheStats())

  // Initialize real-time subscriptions
  useEffect(() => {
    if (!enableRealtimeSync) return

    const setupSubscriptions = async () => {
      try {
        // Subscribe to regions table changes
        const regionsChannel = supabase
          .channel('regions-changes')
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'regions'
            },
            async (payload) => {
              console.log('Regions change detected:', payload.eventType, payload.new?.id)
              
              // Invalidate related queries based on change type
              switch (payload.eventType) {
                case 'INSERT':
                case 'UPDATE':
                  if (payload.new?.id) {
                    await supabaseQueryClient.invalidateRegionQueries(
                      payload.new.id as number,
                      {
                        includeHierarchy: true,
                        includeChildren: true,
                        includeParent: true
                      }
                    )
                  }
                  break
                  
                case 'DELETE':
                  if (payload.old?.id) {
                    // Remove deleted region from cache
                    queryClient.removeQueries({
                      queryKey: regionKeys.detail(payload.old.id as number)
                    })
                    
                    // Invalidate hierarchy
                    queryClient.invalidateQueries({
                      queryKey: regionKeys.hierarchy()
                    })
                  }
                  break
              }
              
              // Always invalidate statistics after any change
              queryClient.invalidateQueries({
                queryKey: regionKeys.statistics()
              })
            }
          )
          .subscribe((status) => {
            console.log('Regions subscription status:', status)
            setIsConnected(status === 'SUBSCRIBED')
          })

        subscriptionsRef.current.set('regions', regionsChannel)

        // Subscribe to annual_region_aggregates for data updates
        const aggregatesChannel = supabase
          .channel('aggregates-changes')
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'annual_region_aggregates'
            },
            async (payload) => {
              console.log('Aggregates change detected:', payload.eventType)
              
              // Invalidate region statistics and specific region data
              queryClient.invalidateQueries({
                queryKey: regionKeys.statistics()
              })
              
              if (payload.new?.name_id || payload.old?.name_id) {
                const regionId = (payload.new?.name_id || payload.old?.name_id) as number
                queryClient.invalidateQueries({
                  queryKey: regionKeys.detail(regionId)
                })
              }
            }
          )
          .subscribe()

        subscriptionsRef.current.set('aggregates', aggregatesChannel)
        
        setSubscriptionCount(subscriptionsRef.current.size)

      } catch (error) {
        console.error('Failed to setup real-time subscriptions:', error)
        setIsConnected(false)
      }
    }

    setupSubscriptions()

    // Cleanup subscriptions
    return () => {
      subscriptionsRef.current.forEach((channel) => {
        supabase.removeChannel(channel)
      })
      subscriptionsRef.current.clear()
      setSubscriptionCount(0)
      setIsConnected(false)
    }
  }, [enableRealtimeSync])

  // Setup background sync
  useEffect(() => {
    if (backgroundSyncInterval > 0) {
      backgroundSyncRef.current = supabaseQueryClient.startBackgroundSync(backgroundSyncInterval)
      
      return () => {
        if (backgroundSyncRef.current) {
          clearInterval(backgroundSyncRef.current)
          backgroundSyncRef.current = null
        }
      }
    }
  }, [backgroundSyncInterval])

  // Setup memory optimization
  useEffect(() => {
    if (enableMemoryOptimization) {
      // Run memory optimization every 5 minutes
      memoryOptimizationRef.current = window.setInterval(() => {
        supabaseQueryClient.optimizeMemoryUsage()
        setCacheStats(supabaseQueryClient.getCacheStats())
      }, 5 * 60 * 1000)
      
      return () => {
        if (memoryOptimizationRef.current) {
          clearInterval(memoryOptimizationRef.current)
          memoryOptimizationRef.current = null
        }
      }
    }
  }, [enableMemoryOptimization])

  // Update cache stats periodically
  useEffect(() => {
    const updateStatsInterval = setInterval(() => {
      setCacheStats(supabaseQueryClient.getCacheStats())
    }, 60000) // Update every minute
    
    return () => clearInterval(updateStatsInterval)
  }, [])

  // Context value
  const contextValue: SupabaseQueryContextValue = {
    isConnected,
    subscriptionCount,
    cacheStats,
    optimizeCache: () => {
      supabaseQueryClient.optimizeMemoryUsage()
      setCacheStats(supabaseQueryClient.getCacheStats())
    },
    startBackgroundSync: (intervalMs?: number) => {
      return supabaseQueryClient.startBackgroundSync(intervalMs)
    },
    stopBackgroundSync: (intervalId: number) => {
      clearInterval(intervalId)
    }
  }

  return (
    <SupabaseQueryContext.Provider value={contextValue}>
      <QueryClientProvider client={queryClient}>
        {children}
        {process.env.NODE_ENV === 'development' && (
          <ReactQueryDevtools 
            initialIsOpen={false} 
            position="bottom-right"
            buttonPosition="bottom-right"
          />
        )}
      </QueryClientProvider>
    </SupabaseQueryContext.Provider>
  )
}

// Utility component for displaying cache debug info
export function CacheDebugInfo() {
  const { cacheStats, isConnected, subscriptionCount } = useSupabaseQuery()
  
  if (process.env.NODE_ENV !== 'development') {
    return null
  }
  
  return (
    <div className="fixed bottom-4 left-4 bg-black bg-opacity-75 text-white p-2 rounded text-xs font-mono z-50">
      <div>🔗 Realtime: {isConnected ? '✅' : '❌'} ({subscriptionCount} subs)</div>
      <div>📊 Queries: {cacheStats.totalQueries} ({cacheStats.approximateSize})</div>
      <div>🗺️ Geometry: {cacheStats.geometryQueries}</div>
      <div>⚠️ Stale: {cacheStats.staleQueries}</div>
      <div>🎯 Hit Rate: {Math.round(cacheStats.hitRate * 100)}%</div>
    </div>
  )
}