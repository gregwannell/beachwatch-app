import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { validateRegionGeometry } from '@/lib/geometry-utils'
import type { Tables, RegionGeometry } from '@/lib/database.types'

// Regions table no longer stores geometry; we re-attach it after the JOIN
type RegionWithGeometry = Tables<'regions'> & { geometry?: RegionGeometry | null }

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient()
    const { searchParams } = new URL(request.url)

    // Query parameters
    const type = searchParams.get('type')
    const hasData = searchParams.get('hasData')
    const parentId = searchParams.get('parentId')
    const includeGeometry = searchParams.get('includeGeometry') !== 'false'
    const includeSurveyCounts = searchParams.get('includeSurveyCounts') === 'true'
    const year = searchParams.get('year')
    const limit = searchParams.get('limit')

    let query = supabase
      .from('regions')
      .select(
        includeGeometry
          ? 'id, name, parent_id, type, code, has_data, created_at, updated_at, region_geometries(geometry)'
          : 'id, name, parent_id, type, code, has_data, created_at, updated_at'
      )
      .order('name')
    
    // Apply filters
    if (type) {
      query = query.eq('type', type)
    }
    
    if (hasData !== null) {
      query = query.eq('has_data', hasData === 'true')
    }
    
    if (parentId) {
      if (parentId === 'null') {
        query = query.is('parent_id', null)
      } else {
        query = query.eq('parent_id', parseInt(parentId))
      }
    }
    
    if (limit) {
      query = query.limit(parseInt(limit))
    }
    
    const { data, error } = await query

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch regions', details: error.message },
        { status: 500 }
      )
    }

    // Flatten embedded region_geometries join into geometry field
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const regions = (data || []).map((r: any) => {
      if (!includeGeometry) return r as Partial<RegionWithGeometry>
      const { region_geometries: rg, ...rest } = r
      return { ...rest, geometry: rg?.geometry ?? null } as Partial<RegionWithGeometry>
    })

    // Validate geometry data if included
    let validatedData = regions.map(region => {
      if (includeGeometry && region.geometry) {
        const isValid = validateRegionGeometry(region.geometry)
        if (!isValid) {
          console.warn(`Invalid geometry for region ${region.id}: ${region.name}`)
          return { ...region, geometry: null }
        }
      }
      return region
    })

    // Add survey counts if requested
    if (includeSurveyCounts && validatedData.length > 0) {
      const regionIds = validatedData.map(r => r.id)

      let aggregatesQuery = supabase
        .from('annual_region_aggregates')
        .select('region_id, total_surveys')
        .in('region_id', regionIds)

      // Apply year filter if provided
      if (year) {
        aggregatesQuery = aggregatesQuery.eq('year', parseInt(year))
      }

      const { data: aggregates, error: aggregatesError } = await aggregatesQuery

      if (aggregatesError) {
        console.error('Survey counts query error:', aggregatesError)
      } else if (aggregates) {
        // Sum total_surveys per region
        const surveyCounts = aggregates.reduce((acc, agg) => {
          acc[agg.region_id] = (acc[agg.region_id] || 0) + agg.total_surveys
          return acc
        }, {} as Record<number, number>)

        // Add survey counts to region data
        validatedData = validatedData.map(region => ({
          ...region,
          total_surveys: surveyCounts[region.id] || 0
        }))
      }
    }

    return NextResponse.json({
      data: validatedData,
      count: validatedData.length,
      includeGeometry,
      includeSurveyCounts
    })
    
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

