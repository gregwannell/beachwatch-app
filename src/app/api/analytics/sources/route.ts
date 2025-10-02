import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import type { Tables } from '@/lib/database.types'
import { 
  validateRegionId, 
  validateYearParams, 
  validateLimit,
  createErrorResponse, 
  createSuccessResponse,
  handleDatabaseError 
} from '@/lib/analytics-validation'

// Response types
interface SourceBreakdown {
  source: {
    id: number
    name: string
  }
  total: number
  avgPer100m: number
  presence: number
  yearOverYearChange?: number
}

interface SourcesData {
  sources: SourceBreakdown[]
  summary: {
    totalSources: number
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
    
    // Validate limit parameter
    const limitValidation = validateLimit(limit)
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
      aggregateIdsQuery = aggregateIdsQuery.eq('name_id', regionValidation.value!)
    }
    
    const validatedYears = yearValidation.years
    const currentYear = validatedYears?.year

    if (validatedYears?.year) {
      aggregateIdsQuery = aggregateIdsQuery.eq('year', validatedYears.year.toString())
    } else if (validatedYears?.startYear && validatedYears?.endYear) {
      aggregateIdsQuery = aggregateIdsQuery
        .gte('year', validatedYears.startYear.toString())
        .lte('year', validatedYears.endYear.toString())
    }

    const { data: aggregateIds, error: aggregateError } = await aggregateIdsQuery

    // Also fetch previous year data for year-over-year comparison
    let previousYearAggregateIds: number[] = []
    if (currentYear && regionId) {
      const { data: prevAggregates } = await supabase
        .from('annual_region_aggregates')
        .select('id')
        .eq('name_id', parseInt(regionId))
        .eq('year', (currentYear - 1).toString())

      previousYearAggregateIds = prevAggregates?.map(agg => agg.id) || []
    }
    
    if (aggregateError) {
      const dbError = handleDatabaseError(aggregateError)
      return NextResponse.json(
        createErrorResponse(dbError.message),
        { status: dbError.status }
      )
    }
    
    if (!aggregateIds || aggregateIds.length === 0) {
      return NextResponse.json(
        createSuccessResponse({
          sources: [],
          summary: {
            totalSources: 0,
            totalLitter: 0,
            avgPresence: 0
          }
        }, 0)
      )
    }
    
    const aggregateIdsList = aggregateIds.map(agg => agg.id)
    
    // Build sources aggregates query
    let sourcesQuery = supabase
      .from('annual_source_aggregates')
      .select(`
        source_id,
        total,
        avg_per_100m,
        presence,
        sources (
          id,
          source
        )
      `)
      .in('aggregate_id', aggregateIdsList)
      .order('total', { ascending: false })
    
    if (limitValidation.value) {
      sourcesQuery = sourcesQuery.limit(limitValidation.value)
    }
    
    const { data: sourceAggregates, error: sourcesError } = await sourcesQuery
    
    if (sourcesError) {
      const dbError = handleDatabaseError(sourcesError)
      return NextResponse.json(
        createErrorResponse(dbError.message),
        { status: dbError.status }
      )
    }

    // Fetch previous year sources data for year-over-year comparison
    let previousYearSources: { [sourceId: number]: number } = {}
    if (previousYearAggregateIds.length > 0) {
      const { data: prevSourceAggregates } = await supabase
        .from('annual_source_aggregates')
        .select('source_id, avg_per_100m')
        .in('aggregate_id', previousYearAggregateIds)

      const prevSourceGroups: { [sourceId: number]: number[] } = {}
      prevSourceAggregates?.forEach(agg => {
        if (!prevSourceGroups[agg.source_id]) {
          prevSourceGroups[agg.source_id] = []
        }
        prevSourceGroups[agg.source_id].push(agg.avg_per_100m)
      })

      // Calculate average for previous year
      Object.entries(prevSourceGroups).forEach(([sourceId, values]) => {
        previousYearSources[parseInt(sourceId)] =
          values.reduce((sum, val) => sum + val, 0) / values.length
      })
    }

    // Group and sum by source
    const sourceGroups: { [sourceId: number]: {
      source: any,
      total: number,
      avgPer100m: number[],
      presence: number[]
    } } = {}

    sourceAggregates?.forEach(agg => {
      const sourceId = agg.source_id
      if (!sourceGroups[sourceId]) {
        sourceGroups[sourceId] = {
          source: agg.sources,
          total: 0,
          avgPer100m: [],
          presence: []
        }
      }
      sourceGroups[sourceId].total += agg.total
      sourceGroups[sourceId].avgPer100m.push(agg.avg_per_100m)
      sourceGroups[sourceId].presence.push(agg.presence)
    })

    // Calculate final breakdown with year-over-year changes
    const sources: SourceBreakdown[] = Object.values(sourceGroups).map(group => {
      const currentAvg = Math.round((group.avgPer100m.reduce((sum, val) => sum + val, 0) / group.avgPer100m.length) * 100) / 100
      const prevAvg = previousYearSources[group.source?.id]

      let yearOverYearChange: number | undefined
      if (prevAvg !== undefined && prevAvg > 0) {
        yearOverYearChange = ((currentAvg - prevAvg) / prevAvg) * 100
      }

      return {
        source: {
          id: group.source?.id || 0,
          name: group.source?.source || 'Unknown'
        },
        total: group.total,
        avgPer100m: currentAvg,
        presence: Math.round((group.presence.reduce((sum, val) => sum + val, 0) / group.presence.length) * 100) / 100,
        yearOverYearChange
      }
    }).sort((a, b) => b.total - a.total)
    
    // Calculate summary
    const totalLitter = sources.reduce((sum, source) => sum + source.total, 0)
    const avgPresence = sources.length > 0 
      ? sources.reduce((sum, source) => sum + source.presence, 0) / sources.length 
      : 0
    
    const responseData: SourcesData = {
      sources,
      summary: {
        totalSources: sources.length,
        totalLitter,
        avgPresence: Math.round(avgPresence * 100) / 100
      }
    }
    
    const response = NextResponse.json(
      createSuccessResponse(responseData, sources.length)
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

export const dynamic = 'force-dynamic'
export const revalidate = 900 // 15 minutes cache for sources data