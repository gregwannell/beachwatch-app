import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import type { Tables } from '@/lib/database.types'
import { 
  validateRegionId, 
  validateYearParams, 
  createErrorResponse, 
  createSuccessResponse,
  handleDatabaseError 
} from '@/lib/analytics-validation'

// Response types
interface RegionAnalyticsData {
  region: {
    id: number
    name: string
    type: string
  }
  aggregates: Tables<'annual_region_aggregates'>[]
  totalSurveys: number
  totalLitter: number
  avgPer100m: number
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = createServerClient()
    const { searchParams } = new URL(request.url)
    const resolvedParams = await params
    
    // Enhanced parameter validation
    const regionValidation = validateRegionId(resolvedParams.id)
    if (!regionValidation.isValid) {
      return NextResponse.json(
        createErrorResponse(regionValidation.error!),
        { status: 400 }
      )
    }
    const regionId = regionValidation.value!
    
    // Query parameters with validation
    const year = searchParams.get('year')
    const startYear = searchParams.get('startYear')
    const endYear = searchParams.get('endYear')
    
    const yearValidation = validateYearParams(year, startYear, endYear)
    if (!yearValidation.isValid) {
      return NextResponse.json(
        createErrorResponse(yearValidation.error!),
        { status: 400 }
      )
    }
    
    // First, get region info
    const { data: region, error: regionError } = await supabase
      .from('regions')
      .select('id, name, type')
      .eq('id', regionId)
      .single()
    
    if (regionError) {
      const dbError = handleDatabaseError(regionError)
      return NextResponse.json(
        createErrorResponse(dbError.message),
        { status: dbError.status }
      )
    }
    
    if (!region) {
      return NextResponse.json(
        createErrorResponse('Region not found'),
        { status: 404 }
      )
    }
    
    // Build query for aggregated data using name_id
    let aggregatesQuery = supabase
      .from('annual_region_aggregates')
      .select('*')
      .eq('name_id', regionId)
      .order('year', { ascending: false })
    
    // Apply year filters using validated parameters
    const validatedYears = yearValidation.years
    if (validatedYears?.year) {
      aggregatesQuery = aggregatesQuery.eq('year', validatedYears.year.toString())
    } else if (validatedYears?.startYear && validatedYears?.endYear) {
      aggregatesQuery = aggregatesQuery
        .gte('year', validatedYears.startYear.toString())
        .lte('year', validatedYears.endYear.toString())
    } else if (validatedYears?.startYear) {
      aggregatesQuery = aggregatesQuery.gte('year', validatedYears.startYear.toString())
    } else if (validatedYears?.endYear) {
      aggregatesQuery = aggregatesQuery.lte('year', validatedYears.endYear.toString())
    }
    
    const { data: aggregates, error: aggregatesError } = await aggregatesQuery
    
    if (aggregatesError) {
      const dbError = handleDatabaseError(aggregatesError)
      return NextResponse.json(
        createErrorResponse(dbError.message),
        { status: dbError.status }
      )
    }
    
    // Calculate totals
    const totalSurveys = aggregates?.reduce((sum, agg) => sum + agg.total_surveys, 0) || 0
    const totalLitter = aggregates?.reduce((sum, agg) => sum + agg.total_litter, 0) || 0
    const avgPer100m = aggregates?.length > 0 
      ? aggregates.reduce((sum, agg) => sum + agg.avg_per_100m, 0) / aggregates.length 
      : 0
    
    const responseData: RegionAnalyticsData = {
      region,
      aggregates: aggregates || [],
      totalSurveys,
      totalLitter,
      avgPer100m: Math.round(avgPer100m * 100) / 100 // Round to 2 decimal places
    }
    
    const response = NextResponse.json(
      createSuccessResponse(responseData, aggregates?.length || 0)
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
export const revalidate = 900 // 15 minutes cache for analytics data