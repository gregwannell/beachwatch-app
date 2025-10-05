import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import type { Tables } from '@/lib/database.types'

interface RegionWithChildren extends Tables<'regions'> {
  children?: RegionWithChildren[]
  childCount?: number
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient()
    const { searchParams } = new URL(request.url)
    
    const rootId = searchParams.get('rootId')
    const includeData = searchParams.get('includeData') !== 'false'
    const maxDepth = parseInt(searchParams.get('maxDepth') || '3')
    const type = searchParams.get('type')
    
    // Fetch all regions with necessary data
    let query = supabase
      .from('regions')
      .select('id, name, parent_id, type, code, has_data, created_at, updated_at')
      .order('name')
    
    // Apply filters
    if (type) {
      query = query.eq('type', type)
    }
    
    if (includeData) {
      query = query.eq('has_data', true)
    }
    
    const { data: regions, error } = await query
    
    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch regions hierarchy', details: error.message },
        { status: 500 }
      )
    }
    
    if (!regions || regions.length === 0) {
      return NextResponse.json({
        data: [],
        metadata: {
          totalRegions: 0,
          maxDepth: 0,
          rootRegions: 0
        }
      })
    }
    
    // Create lookup maps for efficient processing
    const regionMap = new Map<number, RegionWithChildren>()
    const childrenMap = new Map<number, RegionWithChildren[]>()
    
    // Initialize maps
    regions.forEach(region => {
      regionMap.set(region.id, { ...region, children: [] })
      if (region.parent_id) {
        if (!childrenMap.has(region.parent_id)) {
          childrenMap.set(region.parent_id, [])
        }
        childrenMap.get(region.parent_id)!.push(regionMap.get(region.id)!)
      }
    })
    
    // Build hierarchy by assigning children
    regions.forEach(region => {
      const regionWithChildren = regionMap.get(region.id)!
      const children = childrenMap.get(region.id) || []
      regionWithChildren.children = children.sort((a, b) => a.name.localeCompare(b.name))
      regionWithChildren.childCount = children.length
    })
    
    // Find root regions (based on rootId or parent_id null)
    let rootRegions: RegionWithChildren[]
    
    if (rootId) {
      const rootRegion = regionMap.get(parseInt(rootId))
      if (!rootRegion) {
        return NextResponse.json(
          { error: 'Root region not found' },
          { status: 404 }
        )
      }
      rootRegions = [rootRegion]
    } else {
      rootRegions = regions
        .filter(region => region.parent_id === null)
        .map(region => regionMap.get(region.id)!)
        .sort((a, b) => a.name.localeCompare(b.name))
    }
    
    // Calculate hierarchy depth
    const calculateDepth = (region: RegionWithChildren, currentDepth: number = 1): number => {
      if (!region.children || region.children.length === 0) {
        return currentDepth
      }
      
      const maxChildDepth = Math.max(
        ...region.children.map(child => calculateDepth(child, currentDepth + 1))
      )
      
      return Math.min(maxChildDepth, maxDepth) // Respect maxDepth limit
    }
    
    // Trim hierarchy based on maxDepth
    const trimHierarchy = (region: RegionWithChildren, currentDepth: number = 1): RegionWithChildren => {
      if (currentDepth >= maxDepth || !region.children) {
        return { ...region, children: [] }
      }
      
      return {
        ...region,
        children: region.children.map(child => trimHierarchy(child, currentDepth + 1))
      }
    }
    
    const trimmedRootRegions = rootRegions.map(region => trimHierarchy(region))
    const actualMaxDepth = Math.max(...rootRegions.map(region => calculateDepth(region)))
    
    // Calculate statistics
    const countRegions = (regions: RegionWithChildren[]): number => {
      return regions.reduce((count, region) => {
        return count + 1 + (region.children ? countRegions(region.children) : 0)
      }, 0)
    }
    
    const countDataRegions = (regions: RegionWithChildren[]): number => {
      return regions.reduce((count, region) => {
        const hasData = region.has_data ? 1 : 0
        return count + hasData + (region.children ? countDataRegions(region.children) : 0)
      }, 0)
    }
    
    return NextResponse.json({
      data: trimmedRootRegions,
      metadata: {
        totalRegions: countRegions(trimmedRootRegions),
        totalDataRegions: countDataRegions(trimmedRootRegions),
        maxDepth: Math.min(actualMaxDepth, maxDepth),
        rootRegions: trimmedRootRegions.length,
        appliedFilters: {
          type: type || null,
          includeData,
          maxDepth,
          rootId: rootId ? parseInt(rootId) : null
        }
      }
    })
    
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export const revalidate = 600 // 10 minutes cache for hierarchy data