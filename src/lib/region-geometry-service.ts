import type { 
  RegionGeometry, 
  BoundaryData, 
  Coordinates,
  Tables 
} from './database.types'
import {
  validateRegionGeometry,
  calculateGeometryBounds,
  createBoundaryData,
  optimizeForZoom,
  simplifyPolygonCoordinates,
  extractCoordinatesFromGeometry
} from './geometry-utils'
import {
  pointInGeometry,
  calculateDistance,
  calculatePolygonArea,
  calculatePolygonCentroid,
  findIntersections,
  executeSpatialQuery,
  type SpatialQuery
} from './spatial-operations'

export interface GeometryValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
  metadata: {
    area?: number
    centroid?: Coordinates
    bounds?: BoundaryData['bounds']
    coordinateCount?: number
    ringCount?: number
  }
}

export interface ProcessedGeometry {
  original: RegionGeometry
  simplified?: RegionGeometry
  bounds: BoundaryData['bounds']
  metadata: {
    area: number
    centroid: Coordinates
    coordinateCount: number
    ringCount: number
  }
  validation: GeometryValidationResult
}

export class RegionGeometryService {
  // Comprehensive geometry validation
  static validateGeometry(geometry: unknown): GeometryValidationResult {
    const result: GeometryValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
      metadata: {}
    }
    
    // Basic structure validation
    if (!validateRegionGeometry(geometry)) {
      result.isValid = false
      result.errors.push('Invalid GeoJSON structure')
      return result
    }
    
    const validGeometry = geometry as RegionGeometry
    
    // Extract coordinates for validation
    const coordinates = extractCoordinatesFromGeometry(validGeometry)
    
    if (coordinates.length === 0) {
      result.isValid = false
      result.errors.push('No coordinate rings found')
      return result
    }
    
    let totalCoordinates = 0
    const totalRings = coordinates.length
    
    // Validate each coordinate ring
    coordinates.forEach((ring, ringIndex) => {
      totalCoordinates += ring.length
      
      // Check minimum ring size
      if (ring.length < 4) {
        result.errors.push(`Ring ${ringIndex} has fewer than 4 coordinates`)
        result.isValid = false
      }
      
      // Check if ring is closed
      const first = ring[0]
      const last = ring[ring.length - 1]
      if (!first || !last || first[0] !== last[0] || first[1] !== last[1]) {
        result.errors.push(`Ring ${ringIndex} is not closed`)
        result.isValid = false
      }
      
      // Check coordinate bounds
      ring.forEach((coord, coordIndex) => {
        const [lon, lat] = coord
        if (lon < -180 || lon > 180) {
          result.errors.push(`Invalid longitude ${lon} at ring ${ringIndex}, coordinate ${coordIndex}`)
          result.isValid = false
        }
        if (lat < -90 || lat > 90) {
          result.errors.push(`Invalid latitude ${lat} at ring ${ringIndex}, coordinate ${coordIndex}`)
          result.isValid = false
        }
        
        // UK-specific bounds check (warning only)
        if (lon < -8.5 || lon > 2.0 || lat < 49.5 || lat > 61.0) {
          result.warnings.push(`Coordinate [${lon}, ${lat}] is outside typical UK bounds`)
        }
      })
      
      // Check for duplicate consecutive coordinates
      for (let i = 0; i < ring.length - 1; i++) {
        const curr = ring[i]
        const next = ring[i + 1]
        if (curr[0] === next[0] && curr[1] === next[1]) {
          result.warnings.push(`Duplicate consecutive coordinates at ring ${ringIndex}`)
          break
        }
      }
    })
    
    // Calculate metadata if geometry is valid enough
    if (result.isValid || result.errors.length === 0) {
      try {
        const bounds = calculateGeometryBounds(validGeometry)
        result.metadata.bounds = bounds
        
        if (validGeometry.type === 'Polygon') {
          const area = calculatePolygonArea(validGeometry.coordinates)
          const centroid = calculatePolygonCentroid(validGeometry.coordinates)
          result.metadata.area = area
          result.metadata.centroid = centroid
        }
        
        result.metadata.coordinateCount = totalCoordinates
        result.metadata.ringCount = totalRings
        
        // Performance warnings
        if (totalCoordinates > 10000) {
          result.warnings.push(`High coordinate count (${totalCoordinates}) may impact performance`)
        }
        
        if (result.metadata.area && result.metadata.area < 1000) {
          result.warnings.push('Very small polygon area may indicate precision issues')
        }
        
      } catch (error) {
        result.warnings.push(`Error calculating metadata: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
    }
    
    return result
  }
  
  // Process geometry for use in application
  static processGeometry(geometry: RegionGeometry, options?: {
    simplify?: boolean
    tolerance?: number
    calculateMetadata?: boolean
  }): ProcessedGeometry {
    const opts = {
      simplify: false,
      tolerance: 0.001,
      calculateMetadata: true,
      ...options
    }
    
    const validation = this.validateGeometry(geometry)
    const bounds = calculateGeometryBounds(geometry)
    
    let simplified: RegionGeometry | undefined
    if (opts.simplify && validation.isValid) {
      try {
        if (geometry.type === 'Polygon') {
          simplified = {
            type: 'Polygon',
            coordinates: simplifyPolygonCoordinates(geometry.coordinates, opts.tolerance)
          }
        } else if (geometry.type === 'MultiPolygon') {
          simplified = {
            type: 'MultiPolygon',
            coordinates: geometry.coordinates.map(coords => 
              simplifyPolygonCoordinates(coords, opts.tolerance)
            )
          }
        }
      } catch (error) {
        console.warn('Failed to simplify geometry:', error)
      }
    }
    
    const metadata = {
      area: 0,
      centroid: [0, 0] as Coordinates,
      coordinateCount: 0,
      ringCount: 0
    }
    
    if (opts.calculateMetadata && validation.isValid) {
      const coordinates = extractCoordinatesFromGeometry(geometry)
      metadata.coordinateCount = coordinates.reduce((sum, ring) => sum + ring.length, 0)
      metadata.ringCount = coordinates.length
      
      if (geometry.type === 'Polygon') {
        metadata.area = calculatePolygonArea(geometry.coordinates)
        metadata.centroid = calculatePolygonCentroid(geometry.coordinates)
      } else if (geometry.type === 'MultiPolygon') {
        // Calculate total area and average centroid
        let totalArea = 0
        const centroidSum = [0, 0] as [number, number]
        let polygonCount = 0
        
        geometry.coordinates.forEach(coords => {
          const area = calculatePolygonArea(coords)
          const centroid = calculatePolygonCentroid(coords)
          totalArea += area
          centroidSum[0] += centroid[0]
          centroidSum[1] += centroid[1]
          polygonCount++
        })
        
        metadata.area = totalArea
        if (polygonCount > 0) {
          metadata.centroid = [
            centroidSum[0] / polygonCount,
            centroidSum[1] / polygonCount
          ]
        }
      }
    }
    
    return {
      original: geometry,
      simplified,
      bounds,
      metadata,
      validation
    }
  }
  
  // Optimize geometry for specific zoom level
  static optimizeForZoom(geometry: RegionGeometry, zoomLevel: number): RegionGeometry {
    return optimizeForZoom(geometry, zoomLevel)
  }
  
  // Spatial query operations
  static performSpatialQuery(geometry: RegionGeometry, query: SpatialQuery) {
    return executeSpatialQuery(geometry, query)
  }
  
  // Find regions containing a point
  static findRegionsContainingPoint(
    point: Coordinates,
    regions: Array<{ id: number; geometry: RegionGeometry | null }>
  ): Array<{ id: number; contained: boolean; distance?: number }> {
    return regions.map(region => {
      if (!region.geometry) {
        return { id: region.id, contained: false }
      }
      
      const contained = pointInGeometry(point, region.geometry)
      let distance: number | undefined
      
      if (!contained) {
        // Calculate approximate distance to region centroid
        const coordinates = extractCoordinatesFromGeometry(region.geometry)
        if (coordinates.length > 0) {
          const centroid = calculatePolygonCentroid(coordinates[0])
          distance = calculateDistance(point, centroid)
        }
      }
      
      return { id: region.id, contained, distance }
    })
  }
  
  // Find intersecting regions
  static findIntersectingRegions(
    targetGeometry: RegionGeometry,
    regions: Array<{ id: number; geometry: RegionGeometry | null }>
  ): Array<{ id: number; intersects: boolean }> {
    return regions.map(region => ({
      id: region.id,
      intersects: region.geometry ? findIntersections(targetGeometry, region.geometry) : false
    }))
  }
  
  // Validate region data from database
  static validateRegionFromDB(region: Tables<'regions'>): {
    isValid: boolean
    issues: string[]
    processedGeometry?: ProcessedGeometry
  } {
    const issues: string[] = []
    let isValid = true
    let processedGeometry: ProcessedGeometry | undefined
    
    // Basic field validation
    if (!region.name || region.name.trim().length === 0) {
      issues.push('Region name is empty')
      isValid = false
    }
    
    if (!region.code || region.code.trim().length === 0) {
      issues.push('Region code is empty')
      isValid = false
    }
    
    if (!['UK', 'Country', 'Crown Dependency', 'County Unitary'].includes(region.type)) {
      issues.push(`Invalid region type: ${region.type}`)
      isValid = false
    }
    
    // Geometry validation
    if (region.geometry) {
      try {
        processedGeometry = this.processGeometry(region.geometry)
        
        if (!processedGeometry.validation.isValid) {
          issues.push(...processedGeometry.validation.errors)
          isValid = false
        }
        
        issues.push(...processedGeometry.validation.warnings)
        
      } catch (error) {
        issues.push(`Geometry processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
        isValid = false
      }
    } else if (region.has_data) {
      issues.push('Region marked as having data but no geometry provided')
    }
    
    // Hierarchy validation
    if (region.type !== 'UK' && !region.parent_id) {
      issues.push('Non-UK region should have a parent')
    }
    
    if (region.type === 'UK' && region.parent_id) {
      issues.push('UK region should not have a parent')
    }
    
    return {
      isValid,
      issues,
      processedGeometry
    }
  }
  
  // Batch process multiple geometries
  static batchProcessGeometries(
    regions: Array<{ id: number; geometry: RegionGeometry | null }>,
    options?: { simplify?: boolean; tolerance?: number }
  ): Map<number, ProcessedGeometry | null> {
    const result = new Map<number, ProcessedGeometry | null>()
    
    regions.forEach(region => {
      if (region.geometry) {
        try {
          const processed = this.processGeometry(region.geometry, options)
          result.set(region.id, processed)
        } catch (error) {
          console.error(`Failed to process geometry for region ${region.id}:`, error)
          result.set(region.id, null)
        }
      } else {
        result.set(region.id, null)
      }
    })
    
    return result
  }
}