import { createServerClient } from './supabase'
import { supabase } from './supabase'
import type { Tables, Database } from './database.types'
import type { SupabaseClient } from '@supabase/supabase-js'

// Enhanced region type with optional relations
export interface RegionWithRelations extends Tables<'regions'> {
  children?: RegionWithRelations[]
  parent?: Tables<'regions'> | null
  aggregates?: Tables<'annual_region_aggregates'>[]
  childCount?: number
  descendantCount?: number
}

export interface RegionQueryOptions {
  includeGeometry?: boolean
  includeChildren?: boolean
  includeParent?: boolean
  includeAggregates?: boolean
  maxDepth?: number
  onlyWithData?: boolean
}

export interface HierarchyQueryOptions {
  rootType?: 'UK' | 'Country' | 'Crown Dependency' | 'County Unitary'
  maxDepth?: number
  includeGeometry?: boolean
  onlyWithData?: boolean
  orderBy?: 'name' | 'type' | 'has_data'
  orderDirection?: 'asc' | 'desc'
}

export class RegionQueries {
  private client: SupabaseClient<Database>
  
  constructor(useServerClient: boolean = false) {
    this.client = useServerClient ? createServerClient() : supabase
  }
  
  // Find regions by parent ID with proper field names
  async findRegionsByParent(
    parentId: number | null, 
    options: RegionQueryOptions = {}
  ): Promise<RegionWithRelations[]> {
    const {
      includeGeometry = false,
      includeAggregates = false,
      onlyWithData = false,
      orderBy = 'name'
    } = options
    
    let selectFields = 'id, name, parent_id, type, code, has_data, created_at, updated_at'
    if (includeGeometry) {
      selectFields += ', geometry'
    }
    
    let query = this.client
      .from('regions')
      .select(selectFields)
      .order(orderBy)
    
    // Handle parent_id filter correctly
    if (parentId === null) {
      query = query.is('parent_id', null)
    } else {
      query = query.eq('parent_id', parentId)
    }
    
    if (onlyWithData) {
      query = query.eq('has_data', true)
    }
    
    const { data: regions, error } = await query
    
    if (error) {
      throw new Error(`Failed to fetch regions by parent: ${error.message}`)
    }
    
    let result = regions || []
    
    // Add aggregates if requested
    if (includeAggregates && result.length > 0) {
      const regionIds = result.map(r => r.id)
      const { data: aggregates } = await this.client
        .from('annual_region_aggregates')
        .select(`
          id, name_id, year, total_surveys, total_volunteers, 
          total_volunteer_min, total_length_m, additional_area_cleaned_m,
          total_bags, total_weight_kg, total_litter, avg_per_100m
        `)
        .in('name_id', regionIds)
        .order('year', { ascending: false })
      
      // Group aggregates by region
      const aggregatesByRegion = new Map<number, Tables<'annual_region_aggregates'>[]>()
      aggregates?.forEach(agg => {
        if (!aggregatesByRegion.has(agg.name_id)) {
          aggregatesByRegion.set(agg.name_id, [])
        }
        aggregatesByRegion.get(agg.name_id)!.push(agg)
      })
      
      result = result.map(region => ({
        ...region,
        aggregates: aggregatesByRegion.get(region.id) || []
      }))
    }
    
    return result
  }
  
  // Get complete region hierarchy starting from a root
  async getRegionHierarchy(
    rootId?: number,
    options: HierarchyQueryOptions = {}
  ): Promise<RegionWithRelations[]> {
    const {
      maxDepth = 4,
      includeGeometry = false,
      onlyWithData = false,
      rootType,
      orderBy = 'name',
      orderDirection = 'asc'
    } = options
    
    // First get all regions
    let selectFields = 'id, name, parent_id, type, code, has_data, created_at, updated_at'
    if (includeGeometry) {
      selectFields += ', geometry'
    }
    
    let query = this.client
      .from('regions')
      .select(selectFields)
      .order(orderBy, { ascending: orderDirection === 'asc' })
    
    if (onlyWithData) {
      query = query.eq('has_data', true)
    }
    
    if (rootType) {
      query = query.eq('type', rootType)
    }
    
    const { data: allRegions, error } = await query
    
    if (error) {
      throw new Error(`Failed to fetch hierarchy: ${error.message}`)
    }
    
    if (!allRegions || allRegions.length === 0) {
      return []
    }
    
    // Build maps for efficient processing
    const regionMap = new Map<number, RegionWithRelations>()
    const childrenMap = new Map<number, RegionWithRelations[]>()
    
    // Initialize maps
    allRegions.forEach(region => {
      const regionWithRelations: RegionWithRelations = {
        ...region,
        children: [],
        childCount: 0,
        descendantCount: 0
      }
      regionMap.set(region.id, regionWithRelations)
    })
    
    // Build parent-child relationships using correct field name
    allRegions.forEach(region => {
      if (region.parent_id) {
        if (!childrenMap.has(region.parent_id)) {
          childrenMap.set(region.parent_id, [])
        }
        childrenMap.get(region.parent_id)!.push(regionMap.get(region.id)!)
      }
    })
    
    // Assign children and calculate counts
    const calculateDescendantCount = (region: RegionWithRelations): number => {
      const children = childrenMap.get(region.id) || []
      region.children = children
      region.childCount = children.length
      
      let totalDescendants = children.length
      children.forEach(child => {
        totalDescendants += calculateDescendantCount(child)
      })
      
      region.descendantCount = totalDescendants
      return totalDescendants
    }
    
    // Calculate descendant counts for all regions
    regionMap.forEach(region => {
      if (!region.parent_id) { // Only calculate for root regions
        calculateDescendantCount(region)
      }
    })
    
    // Determine root regions
    let rootRegions: RegionWithRelations[]
    
    if (rootId) {
      const rootRegion = regionMap.get(rootId)
      if (!rootRegion) {
        throw new Error(`Root region with ID ${rootId} not found`)
      }
      rootRegions = [rootRegion]
    } else {
      rootRegions = allRegions
        .filter(region => region.parent_id === null)
        .map(region => regionMap.get(region.id)!)
        .filter(Boolean)
    }
    
    // Trim hierarchy to maxDepth
    const trimToDepth = (regions: RegionWithRelations[], currentDepth: number): RegionWithRelations[] => {
      if (currentDepth >= maxDepth) {
        return regions.map(region => ({ ...region, children: [] }))
      }
      
      return regions.map(region => ({
        ...region,
        children: region.children ? trimToDepth(region.children, currentDepth + 1) : []
      }))
    }
    
    return trimToDepth(rootRegions, 0)
  }
  
  // Search regions by name with hierarchy context
  async searchRegionsByName(
    searchTerm: string,
    options: RegionQueryOptions = {}
  ): Promise<RegionWithRelations[]> {
    const {
      includeGeometry = false,
      includeParent = true,
      includeChildren = false,
      onlyWithData = false
    } = options
    
    let selectFields = 'id, name, parent_id, type, code, has_data, created_at, updated_at'
    if (includeGeometry) {
      selectFields += ', geometry'
    }
    
    let query = this.client
      .from('regions')
      .select(selectFields)
      .ilike('name', `%${searchTerm}%`)
      .order('name')
    
    if (onlyWithData) {
      query = query.eq('has_data', true)
    }
    
    const { data: regions, error } = await query
    
    if (error) {
      throw new Error(`Failed to search regions: ${error.message}`)
    }
    
    let result: RegionWithRelations[] = (regions || []).map(region => ({ ...region }))
    
    // Add parent information if requested
    if (includeParent && result.length > 0) {
      const parentIds = [...new Set(result.map(r => r.parent_id).filter(Boolean))]
      
      if (parentIds.length > 0) {
        const { data: parents } = await this.client
          .from('regions')
          .select('id, name, parent_id, type, code, has_data')
          .in('id', parentIds)
        
        const parentMap = new Map<number, Tables<'regions'>>()
        parents?.forEach(parent => parentMap.set(parent.id, parent))
        
        result = result.map(region => ({
          ...region,
          parent: region.parent_id ? parentMap.get(region.parent_id) || null : null
        }))
      }
    }
    
    // Add children if requested
    if (includeChildren) {
      for (const region of result) {
        region.children = await this.findRegionsByParent(region.id, { 
          includeGeometry: false,
          onlyWithData 
        })
        region.childCount = region.children.length
      }
    }
    
    return result
  }
  
  // Get region path (breadcrumb trail)
  async getRegionPath(regionId: number): Promise<Tables<'regions'>[]> {
    const path: Tables<'regions'>[] = []
    let currentId: number | null = regionId
    
    while (currentId) {
      const { data: region, error } = await this.client
        .from('regions')
        .select('id, name, parent_id, type, code, has_data, created_at, updated_at')
        .eq('id', currentId)
        .single()
      
      if (error || !region) {
        break
      }
      
      path.unshift(region) // Add to beginning to build path from root to leaf
      currentId = region.parent_id
    }
    
    return path
  }
  
  // Get regions by type with counts
  async getRegionsByType(
    type: 'UK' | 'Country' | 'Crown Dependency' | 'County Unitary',
    options: RegionQueryOptions = {}
  ): Promise<RegionWithRelations[]> {
    const {
      includeGeometry = false,
      includeChildren = false,
      onlyWithData = false
    } = options
    
    let selectFields = 'id, name, parent_id, type, code, has_data, created_at, updated_at'
    if (includeGeometry) {
      selectFields += ', geometry'
    }
    
    let query = this.client
      .from('regions')
      .select(selectFields)
      .eq('type', type)
      .order('name')
    
    if (onlyWithData) {
      query = query.eq('has_data', true)
    }
    
    const { data: regions, error } = await query
    
    if (error) {
      throw new Error(`Failed to fetch regions by type: ${error.message}`)
    }
    
    let result: RegionWithRelations[] = (regions || []).map(region => ({ ...region }))
    
    // Add child counts if requested
    if (includeChildren) {
      const regionIds = result.map(r => r.id)
      
      // Get child counts efficiently
      const { data: childCounts } = await this.client
        .from('regions')
        .select('parent_id')
        .in('parent_id', regionIds)
      
      const countMap = new Map<number, number>()
      childCounts?.forEach(child => {
        if (child.parent_id) {
          countMap.set(child.parent_id, (countMap.get(child.parent_id) || 0) + 1)
        }
      })
      
      result = result.map(region => ({
        ...region,
        childCount: countMap.get(region.id) || 0
      }))
    }
    
    return result
  }
  
  // Get statistics about the region hierarchy
  async getRegionStatistics(): Promise<{
    totalRegions: number
    regionsByType: Record<string, number>
    regionsWithData: number
    regionsWithGeometry: number
    maxDepth: number
  }> {
    // Get total regions and type counts
    const { data: regions, error } = await this.client
      .from('regions')
      .select('id, type, has_data, geometry, parent_id')
    
    if (error || !regions) {
      throw new Error(`Failed to fetch region statistics: ${error?.message}`)
    }
    
    const regionsByType: Record<string, number> = {}
    let regionsWithData = 0
    let regionsWithGeometry = 0
    
    regions.forEach(region => {
      // Count by type
      regionsByType[region.type] = (regionsByType[region.type] || 0) + 1
      
      // Count regions with data
      if (region.has_data) regionsWithData++
      
      // Count regions with geometry
      if (region.geometry) regionsWithGeometry++
    })
    
    // Calculate max depth
    const calculateMaxDepth = (regionId: number, visited = new Set<number>()): number => {
      if (visited.has(regionId)) return 0 // Prevent infinite loops
      visited.add(regionId)
      
      const children = regions.filter(r => r.parent_id === regionId)
      if (children.length === 0) return 1
      
      return 1 + Math.max(...children.map(child => 
        calculateMaxDepth(child.id, new Set(visited))
      ))
    }
    
    const rootRegions = regions.filter(r => r.parent_id === null)
    const maxDepth = rootRegions.length > 0 
      ? Math.max(...rootRegions.map(root => calculateMaxDepth(root.id)))
      : 0
    
    return {
      totalRegions: regions.length,
      regionsByType,
      regionsWithData,
      regionsWithGeometry,
      maxDepth
    }
  }
  
  // Validate hierarchy integrity
  async validateHierarchy(): Promise<{
    isValid: boolean
    issues: string[]
    orphanedRegions: number[]
    circularReferences: number[]
  }> {
    const issues: string[] = []
    const orphanedRegions: number[] = []
    const circularReferences: number[] = []
    
    const { data: regions, error } = await this.client
      .from('regions')
      .select('id, parent_id, type, name')
    
    if (error || !regions) {
      return { isValid: false, issues: ['Failed to fetch regions'], orphanedRegions, circularReferences }
    }
    
    const regionMap = new Map(regions.map(r => [r.id, r]))
    
    regions.forEach(region => {
      // Check for orphaned regions (parent doesn't exist)
      if (region.parent_id && !regionMap.has(region.parent_id)) {
        orphanedRegions.push(region.id)
        issues.push(`Region ${region.name} (${region.id}) has non-existent parent ${region.parent_id}`)
      }
      
      // Check type hierarchy rules
      if (region.type === 'UK' && region.parent_id) {
        issues.push(`UK region ${region.name} should not have a parent`)
      }
      
      if (region.type !== 'UK' && !region.parent_id) {
        issues.push(`Non-UK region ${region.name} (${region.type}) should have a parent`)
      }
      
      // Check for circular references
      const visited = new Set<number>()
      let currentId: number | null = region.parent_id
      
      while (currentId && !visited.has(currentId)) {
        visited.add(currentId)
        const parent = regionMap.get(currentId)
        if (!parent) break
        
        if (parent.id === region.id) {
          circularReferences.push(region.id)
          issues.push(`Circular reference detected for region ${region.name} (${region.id})`)
          break
        }
        
        currentId = parent.parent_id
      }
    })
    
    return {
      isValid: issues.length === 0,
      issues,
      orphanedRegions,
      circularReferences
    }
  }
}