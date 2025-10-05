import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { validateRegionGeometry } from '@/lib/geometry-utils'
import type { Tables } from '@/lib/database.types'

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
    const limit = searchParams.get('limit')
    
    let query = supabase
      .from('regions')
      .select(
        includeGeometry 
          ? 'id, name, parent_id, type, code, geometry, has_data, created_at, updated_at'
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
    
    // Validate geometry data if included
    const validatedData = data?.map(region => {
      if (includeGeometry && 'geometry' in region && region.geometry) {
        const isValid = validateRegionGeometry(region.geometry)
        if (!isValid) {
          console.warn(`Invalid geometry for region ${region.id}: ${region.name}`)
          return { ...region, geometry: null }
        }
      }
      return region
    }) || []
    
    return NextResponse.json({
      data: validatedData,
      count: validatedData.length,
      includeGeometry
    })
    
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export const revalidate = 300 // 5 minutes cache