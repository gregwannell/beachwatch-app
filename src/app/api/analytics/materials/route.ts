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
interface MaterialBreakdown {
  material: {
    id: number
    name: string
  }
  total: number
  avgPer100m: number
  presence: number
  yearOverYearChange?: number
}

interface MaterialsData {
  materials: MaterialBreakdown[]
  summary: {
    totalMaterials: number
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
      if (regionValidation.isValid && regionValidation.value) {
        aggregateIdsQuery = aggregateIdsQuery.eq('name_id', regionValidation.value)
      }
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
          materials: [],
          summary: {
            totalMaterials: 0,
            totalLitter: 0,
            avgPresence: 0
          }
        }, 0)
      )
    }
    
    const aggregateIdsList = aggregateIds.map(agg => agg.id)
    
    // Build materials aggregates query - simplified for debugging
    let materialsQuery = supabase
      .from('annual_material_aggregates')
      .select('material_id, total, avg_per_100m, presence')
      .in('aggregate_id', aggregateIdsList)
      .order('total', { ascending: false })
    
    if (limitValidation.value) {
      materialsQuery = materialsQuery.limit(limitValidation.value)
    }
    
    const { data: materialAggregates, error: materialsError } = await materialsQuery
    
    if (materialsError) {
      const dbError = handleDatabaseError(materialsError)
      return NextResponse.json(
        createErrorResponse(dbError.message),
        { status: dbError.status }
      )
    }
    
    // Get unique material IDs and fetch material names
    const materialIds = [...new Set(materialAggregates?.map(agg => agg.material_id) || [])]
    
    const { data: materials_lookup, error: materialsLookupError } = await supabase
      .from('materials')
      .select('id, material')
      .in('id', materialIds)
    
    if (materialsLookupError) {
      console.error('Materials lookup error:', materialsLookupError)
    }
    
    const materialsMap = new Map(materials_lookup?.map(m => [m.id, m.material]) || [])

    // Fetch previous year materials data for year-over-year comparison
    const previousYearMaterials: { [materialId: number]: number } = {}
    if (previousYearAggregateIds.length > 0) {
      const { data: prevMaterialAggregates } = await supabase
        .from('annual_material_aggregates')
        .select('material_id, avg_per_100m')
        .in('aggregate_id', previousYearAggregateIds)

      const prevMaterialGroups: { [materialId: number]: number[] } = {}
      prevMaterialAggregates?.forEach(agg => {
        if (!prevMaterialGroups[agg.material_id]) {
          prevMaterialGroups[agg.material_id] = []
        }
        prevMaterialGroups[agg.material_id].push(agg.avg_per_100m)
      })

      // Calculate average for previous year
      Object.entries(prevMaterialGroups).forEach(([materialId, values]) => {
        previousYearMaterials[parseInt(materialId)] =
          values.reduce((sum, val) => sum + val, 0) / values.length
      })
    }

    // Group and sum by material
    const materialGroups: { [materialId: number]: {
      total: number,
      avgPer100m: number[],
      presence: number[]
    } } = {}

    materialAggregates?.forEach(agg => {
      const materialId = agg.material_id
      if (!materialGroups[materialId]) {
        materialGroups[materialId] = {
          total: 0,
          avgPer100m: [],
          presence: []
        }
      }
      materialGroups[materialId].total += agg.total
      materialGroups[materialId].avgPer100m.push(agg.avg_per_100m)
      materialGroups[materialId].presence.push(agg.presence)
    })

    // Calculate final breakdown with year-over-year changes
    const materials: MaterialBreakdown[] = Object.entries(materialGroups).map(([materialId, group]) => {
      const currentAvg = Math.round((group.avgPer100m.reduce((sum, val) => sum + val, 0) / group.avgPer100m.length) * 100) / 100
      const prevAvg = previousYearMaterials[parseInt(materialId)]

      let yearOverYearChange: number | undefined
      if (prevAvg !== undefined && prevAvg > 0) {
        yearOverYearChange = ((currentAvg - prevAvg) / prevAvg) * 100
      }

      return {
        material: {
          id: parseInt(materialId),
          name: materialsMap.get(parseInt(materialId)) || 'Unknown'
        },
        total: group.total,
        avgPer100m: currentAvg,
        presence: Math.round((group.presence.reduce((sum, val) => sum + val, 0) / group.presence.length) * 100) / 100,
        yearOverYearChange
      }
    }).sort((a, b) => b.total - a.total)
    
    // Calculate summary
    const totalLitter = materials.reduce((sum, material) => sum + material.total, 0)
    const avgPresence = materials.length > 0 
      ? materials.reduce((sum, material) => sum + material.presence, 0) / materials.length 
      : 0
    
    const responseData: MaterialsData = {
      materials,
      summary: {
        totalMaterials: materials.length,
        totalLitter,
        avgPresence: Math.round(avgPresence * 100) / 100
      }
    }
    
    const response = NextResponse.json(
      createSuccessResponse(responseData, materials.length)
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

export const revalidate = 900 // 15 minutes cache for materials data