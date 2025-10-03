import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { validateRegionGeometry, createBoundaryData } from '@/lib/geometry-utils'
import type { Tables } from '@/lib/database.types'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  const { id } = await params
  try {
    const supabase = createServerClient()
    const { searchParams } = new URL(request.url)
    const regionId = parseInt(id)
    
    if (isNaN(regionId)) {
      return NextResponse.json(
        { error: 'Invalid region ID' },
        { status: 400 }
      )
    }
    
    const includeGeometry = searchParams.get('includeGeometry') !== 'false'
    const includeChildren = searchParams.get('includeChildren') === 'true'
    const includeParent = searchParams.get('includeParent') === 'true'
    const includeAggregates = searchParams.get('includeAggregates') === 'true'
    const year = searchParams.get('year')
    
    // Base region query
    const regionQuery = supabase
      .from('regions')
      .select(
        includeGeometry 
          ? 'id, name, parent_id, type, code, geometry, has_data, created_at, updated_at'
          : 'id, name, parent_id, type, code, has_data, created_at, updated_at'
      )
      .eq('id', regionId)
      .single()
    
    const { data: region, error: regionError } = await regionQuery

    if (regionError || !region) {
      if (regionError?.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Region not found' },
          { status: 404 }
        )
      }

      console.error('Database error:', regionError)
      return NextResponse.json(
        { error: 'Failed to fetch region', details: regionError?.message || 'Unknown error' },
        { status: 500 }
      )
    }

    // Validate and process geometry
    if (includeGeometry && region.geometry) {
      const isValid = validateRegionGeometry(region.geometry)
      if (!isValid) {
        console.warn(`Invalid geometry for region ${region.id}: ${region.name}`)
        // Cast to any to allow geometry modification
        ;(region as any).geometry = null
      }
    }
    
    const response: any = {
      region,
      boundaryData: includeGeometry ? createBoundaryData(region.geometry) : undefined
    }
    
    // Include children if requested
    if (includeChildren) {
      const { data: children, error: childrenError } = await supabase
        .from('regions')
        .select('id, name, parent_id, type, code, has_data, created_at, updated_at')
        .eq('parent_id', regionId)
        .order('name')
      
      if (childrenError) {
        console.error('Children query error:', childrenError)
        response.children = []
        response.childrenError = childrenError.message
      } else {
        response.children = children || []
      }
    }
    
    // Include parent if requested
    if (includeParent && region.parent_id) {
      const { data: parent, error: parentError } = await supabase
        .from('regions')
        .select('id, name, parent_id, type, code, has_data, created_at, updated_at')
        .eq('id', region.parent_id)
        .single()
      
      if (parentError) {
        console.error('Parent query error:', parentError)
        response.parent = null
        response.parentError = parentError.message
      } else {
        response.parent = parent
      }
    }
    
    // Include aggregates if requested
    if (includeAggregates && region.has_data) {
      let aggregatesQuery = supabase
        .from('annual_region_aggregates')
        .select(`
          id, year, total_surveys, total_volunteers, total_volunteer_min,
          total_length_m, additional_area_cleaned_m, total_bags, total_weight_kg,
          total_litter, avg_per_100m, created_at, updated_at
        `)
        .eq('name_id', regionId)
        .order('year', { ascending: false })
      
      // Apply year filter if provided
      if (year) {
        aggregatesQuery = aggregatesQuery.eq('year', year)
      }
      
      const { data: aggregates, error: aggregatesError } = await aggregatesQuery
      
      if (aggregatesError) {
        console.error('Aggregates query error:', aggregatesError)
        response.aggregates = []
        response.aggregatesError = aggregatesError.message
      } else {
        response.aggregates = aggregates || []
      }
    }
    
    return NextResponse.json(response)
    
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export const dynamic = 'force-dynamic'
export const revalidate = 300 // 5 minutes cache