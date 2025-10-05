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
interface YearTrend {
  year: string
  totalSurveys: number
  totalLitter: number
  avgPer100m: number
  totalRegions: number
}

interface TrendsData {
  trends: YearTrend[]
  summary: {
    totalYears: number
    totalSurveys: number
    totalLitter: number
    avgLitterPer100m: number
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient()
    const { searchParams } = new URL(request.url)
    
    // Enhanced parameter validation
    const regionId = searchParams.get('regionId')
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
    const yearValidation = validateYearParams(null, startYear, endYear)
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
    
    // Build base query
    let query = supabase
      .from('annual_region_aggregates')
      .select('*')
      .order('year', { ascending: false })
    
    // Apply filters with validated values
    if (regionId) {
      const regionValidation = validateRegionId(regionId)
      query = query.eq('name_id', regionValidation.value!)
    }
    
    const validatedYears = yearValidation.years
    if (validatedYears?.startYear && validatedYears?.endYear) {
      query = query
        .gte('year', validatedYears.startYear.toString())
        .lte('year', validatedYears.endYear.toString())
    } else if (validatedYears?.startYear) {
      query = query.gte('year', validatedYears.startYear.toString())
    } else if (validatedYears?.endYear) {
      query = query.lte('year', validatedYears.endYear.toString())
    }
    
    if (limitValidation.value) {
      query = query.limit(limitValidation.value)
    }
    
    const { data: aggregates, error } = await query
    
    if (error) {
      const dbError = handleDatabaseError(error)
      return NextResponse.json(
        createErrorResponse(dbError.message),
        { status: dbError.status }
      )
    }
    
    // Group data by year
    const yearGroups: { [year: string]: Tables<'annual_region_aggregates'>[] } = {}
    aggregates?.forEach(aggregate => {
      if (!yearGroups[aggregate.year]) {
        yearGroups[aggregate.year] = []
      }
      yearGroups[aggregate.year].push(aggregate)
    })
    
    // Calculate trends for each year
    const trends: YearTrend[] = Object.entries(yearGroups).map(([year, data]) => {
      const totalSurveys = data.reduce((sum, agg) => sum + agg.total_surveys, 0)
      const totalLitter = data.reduce((sum, agg) => sum + agg.total_litter, 0)
      const avgPer100m = data.length > 0 
        ? data.reduce((sum, agg) => sum + agg.avg_per_100m, 0) / data.length 
        : 0
      
      return {
        year,
        totalSurveys,
        totalLitter,
        avgPer100m: Math.round(avgPer100m * 100) / 100,
        totalRegions: data.length
      }
    }).sort((a, b) => b.year.localeCompare(a.year)) // Most recent first
    
    // Calculate summary statistics
    const totalSurveys = trends.reduce((sum, trend) => sum + trend.totalSurveys, 0)
    const totalLitter = trends.reduce((sum, trend) => sum + trend.totalLitter, 0)
    const avgLitterPer100m = trends.length > 0 
      ? trends.reduce((sum, trend) => sum + trend.avgPer100m, 0) / trends.length 
      : 0
    
    const responseData: TrendsData = {
      trends,
      summary: {
        totalYears: trends.length,
        totalSurveys,
        totalLitter,
        avgLitterPer100m: Math.round(avgLitterPer100m * 100) / 100
      }
    }
    
    const response = NextResponse.json(
      createSuccessResponse(responseData, trends.length)
    )
    
    // Add cache control headers - trends data changes less frequently
    response.headers.set('Cache-Control', 'public, s-maxage=1800, stale-while-revalidate=3600')
    
    return response
    
  } catch (error) {
    console.error('Unexpected API error:', error)
    return NextResponse.json(
      createErrorResponse('Internal server error'),
      { status: 500 }
    )
  }
}

export const revalidate = 1800 // 30 minutes cache for trends data