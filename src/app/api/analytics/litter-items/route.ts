import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { 
  validateRegionId, 
  validateYearParams, 
  validateLimit,
  createErrorResponse, 
  createSuccessResponse,
  handleDatabaseError 
} from '@/lib/analytics-validation'

// Response types
interface LitterItemBreakdown {
  item: {
    id: number
    name: string
    shortName?: string
  }
  total: number
  avgPer100m: number
  presence: number
}

interface LitterItemsData {
  litterItems: LitterItemBreakdown[]
  summary: {
    totalItems: number
    totalLitter: number
    avgPresence: number
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient()
    const { searchParams } = new URL(request.url)
    
    // Enhanced parameter validation
    const regionId = searchParams.get('regionId')
    const year = searchParams.get('year')
    const startYear = searchParams.get('startYear')
    const endYear = searchParams.get('endYear')
    const limit = searchParams.get('limit')
    
    // Validate region ID if provided
    if (regionId) {
      const regionValidation = validateRegionId(regionId)
      if (!regionValidation.isValid) {
        return NextResponse.json(
          createErrorResponse(regionValidation.error!),
          { status: 400 }
        )
      }
    }
    
    // Validate year parameters
    const yearValidation = validateYearParams(year, startYear, endYear)
    if (!yearValidation.isValid) {
      return NextResponse.json(
        createErrorResponse(yearValidation.error!),
        { status: 400 }
      )
    }
    
    // Validate limit parameter - default to 5 for top items
    const limitValidation = validateLimit(limit || '5')
    if (!limitValidation.isValid) {
      return NextResponse.json(
        createErrorResponse(limitValidation.error!),
        { status: 400 }
      )
    }
    
    // First, get the aggregate_id(s) for filtering
    let aggregateIdsQuery = supabase
      .from('annual_region_aggregates')
      .select('id')
    
    if (regionId) {
      const regionValidation = validateRegionId(regionId)
      if (regionValidation.isValid && regionValidation.value) {
        aggregateIdsQuery = aggregateIdsQuery.eq('name_id', regionValidation.value)
      }
    }
    
    const validatedYears = yearValidation.years
    if (validatedYears?.year) {
      aggregateIdsQuery = aggregateIdsQuery.eq('year', validatedYears.year.toString())
    } else if (validatedYears?.startYear && validatedYears?.endYear) {
      aggregateIdsQuery = aggregateIdsQuery
        .gte('year', validatedYears.startYear.toString())
        .lte('year', validatedYears.endYear.toString())
    }
    
    const { data: aggregateIds, error: aggregateError } = await aggregateIdsQuery
    
    if (aggregateError) {
      console.error('Aggregate IDs query error:', aggregateError)
      const dbError = handleDatabaseError(aggregateError)
      return NextResponse.json(
        createErrorResponse(dbError.message),
        { status: dbError.status }
      )
    }
    
    if (!aggregateIds || aggregateIds.length === 0) {
      return NextResponse.json(
        createSuccessResponse({
          litterItems: [],
          summary: {
            totalItems: 0,
            totalLitter: 0,
            avgPresence: 0
          }
        }, 0)
      )
    }
    
    const aggregateIdsList = aggregateIds.map(agg => agg.id)
    
    // Build litter items aggregates query
    let litterItemsQuery = supabase
      .from('annual_litter_aggregates')
      .select('litter_item_id, total, avg_per_100m, presence')
      .in('aggregate_id', aggregateIdsList)
      .order('avg_per_100m', { ascending: false })
    
    if (limitValidation.value) {
      litterItemsQuery = litterItemsQuery.limit(limitValidation.value)
    }
    
    const { data: litterAggregates, error: litterError } = await litterItemsQuery
    
    if (litterError) {
      const dbError = handleDatabaseError(litterError)
      return NextResponse.json(
        createErrorResponse(dbError.message),
        { status: dbError.status }
      )
    }
    
    // Get unique litter item IDs and fetch item names
    const litterItemIds = [...new Set(litterAggregates?.map(agg => agg.litter_item_id) || [])]
    
    const { data: litterItems_lookup, error: litterItemsLookupError } = await supabase
      .from('litter_items')
      .select('id, item_name, short_name')
      .in('id', litterItemIds)
    
    if (litterItemsLookupError) {
      console.error('Litter items lookup error:', litterItemsLookupError)
    }
    
    const litterItemsMap = new Map(litterItems_lookup?.map(item => [
      item.id, 
      { name: item.item_name, shortName: item.short_name }
    ]) || [])
    
    // Group and sum by litter item
    const litterItemGroups: { [itemId: number]: { 
      total: number, 
      avgPer100m: number[], 
      presence: number[] 
    } } = {}
    
    litterAggregates?.forEach(agg => {
      const itemId = agg.litter_item_id
      if (!litterItemGroups[itemId]) {
        litterItemGroups[itemId] = {
          total: 0,
          avgPer100m: [],
          presence: []
        }
      }
      litterItemGroups[itemId].total += agg.total
      litterItemGroups[itemId].avgPer100m.push(agg.avg_per_100m)
      litterItemGroups[itemId].presence.push(agg.presence)
    })
    
    // Calculate final breakdown
    const litterItems: LitterItemBreakdown[] = Object.entries(litterItemGroups).map(([itemId, group]) => {
      const itemInfo = litterItemsMap.get(parseInt(itemId))
      return {
        item: {
          id: parseInt(itemId),
          name: itemInfo?.name || 'Unknown',
          shortName: itemInfo?.shortName
        },
        total: group.total,
        avgPer100m: Math.round((group.avgPer100m.reduce((sum, val) => sum + val, 0) / group.avgPer100m.length) * 100) / 100,
        presence: Math.round((group.presence.reduce((sum, val) => sum + val, 0) / group.presence.length) * 100) / 100
      }
    }).sort((a, b) => b.avgPer100m - a.avgPer100m)
    
    // Calculate summary
    const totalLitter = litterItems.reduce((sum, item) => sum + item.total, 0)
    const avgPresence = litterItems.length > 0 
      ? litterItems.reduce((sum, item) => sum + item.presence, 0) / litterItems.length 
      : 0
    
    const responseData: LitterItemsData = {
      litterItems,
      summary: {
        totalItems: litterItems.length,
        totalLitter,
        avgPresence: Math.round(avgPresence * 100) / 100
      }
    }
    
    const response = NextResponse.json(
      createSuccessResponse(responseData, litterItems.length)
    )
    
    // Add cache control headers for better browser caching
    response.headers.set('Cache-Control', 'public, s-maxage=900, stale-while-revalidate=1800')
    
    return response
    
  } catch (error) {
    console.error('Unexpected API error:', error)
    return NextResponse.json(
      createErrorResponse('Internal server error'),
      { status: 500 }
    )
  }
}

export const revalidate = 900 // 15 minutes cache for litter items data