import type { 
  Coordinates, 
  CoordinateRing, 
  PolygonCoordinates, 
  RegionGeometry,
  GeoJSONPolygon,
  GeoJSONMultiPolygon
} from './database.types'
import { isGeoJSONPolygon, isGeoJSONMultiPolygon } from './geometry-utils'

// Point-in-polygon algorithm using ray casting
export function pointInPolygon(point: Coordinates, polygon: CoordinateRing): boolean {
  const [x, y] = point
  let inside = false
  
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [xi, yi] = polygon[i]
    const [xj, yj] = polygon[j]
    
    if (((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi)) {
      inside = !inside
    }
  }
  
  return inside
}

// Check if point is inside any polygon in a multi-polygon or polygon geometry
export function pointInGeometry(point: Coordinates, geometry: RegionGeometry): boolean {
  if (isGeoJSONPolygon(geometry)) {
    // For polygons, first ring is exterior, subsequent rings are holes
    const [exteriorRing, ...holes] = geometry.coordinates
    
    // Point must be inside exterior ring
    if (!pointInPolygon(point, exteriorRing)) {
      return false
    }
    
    // Point must not be inside any hole
    for (const hole of holes) {
      if (pointInPolygon(point, hole)) {
        return false
      }
    }
    
    return true
  }
  
  if (isGeoJSONMultiPolygon(geometry)) {
    // Check if point is in any of the polygons
    return geometry.coordinates.some(polygonCoords => {
      const [exteriorRing, ...holes] = polygonCoords
      
      if (!pointInPolygon(point, exteriorRing)) {
        return false
      }
      
      for (const hole of holes) {
        if (pointInPolygon(point, hole)) {
          return false
        }
      }
      
      return true
    })
  }
  
  return false
}

// Calculate distance between two points using Haversine formula (in meters)
export function calculateDistance(point1: Coordinates, point2: Coordinates): number {
  const [lon1, lat1] = point1
  const [lon2, lat2] = point2
  
  const R = 6371000 // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180
  const φ2 = (lat2 * Math.PI) / 180
  const Δφ = ((lat2 - lat1) * Math.PI) / 180
  const Δλ = ((lon2 - lon1) * Math.PI) / 180
  
  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
           Math.cos(φ1) * Math.cos(φ2) *
           Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  
  return R * c
}

// Calculate the area of a polygon using Shoelace formula (in square meters, approximate)
export function calculatePolygonArea(coordinates: PolygonCoordinates): number {
  if (coordinates.length === 0) return 0
  
  const [exteriorRing, ...holes] = coordinates
  let area = calculateRingArea(exteriorRing)
  
  // Subtract hole areas
  for (const hole of holes) {
    area -= calculateRingArea(hole)
  }
  
  return Math.abs(area)
}

function calculateRingArea(ring: CoordinateRing): number {
  if (ring.length < 3) return 0
  
  let area = 0
  
  // Convert to approximate meters using simple equirectangular projection
  const toMeters = (coord: Coordinates): [number, number] => {
    const [lon, lat] = coord
    const latRad = (lat * Math.PI) / 180
    const lonRad = (lon * Math.PI) / 180
    const R = 6371000 // Earth radius in meters
    
    return [
      R * lonRad * Math.cos(latRad),
      R * latRad
    ]
  }
  
  const meterCoords = ring.map(toMeters)
  
  // Shoelace formula
  for (let i = 0; i < meterCoords.length - 1; i++) {
    const [x1, y1] = meterCoords[i]
    const [x2, y2] = meterCoords[i + 1]
    area += (x1 * y2) - (x2 * y1)
  }
  
  return area / 2
}

// Find the centroid of a polygon
export function calculatePolygonCentroid(coordinates: PolygonCoordinates): Coordinates {
  if (coordinates.length === 0) return [0, 0]
  
  const exteriorRing = coordinates[0]
  if (exteriorRing.length === 0) return [0, 0]
  
  let totalLon = 0
  let totalLat = 0
  let count = 0
  
  // Simple arithmetic mean of all coordinates (excluding duplicate last coordinate)
  for (let i = 0; i < exteriorRing.length - 1; i++) {
    const [lon, lat] = exteriorRing[i]
    totalLon += lon
    totalLat += lat
    count++
  }
  
  return count > 0 ? [totalLon / count, totalLat / count] : [0, 0]
}

// Check if two polygons intersect (basic bounding box check)
export function polygonIntersects(poly1: PolygonCoordinates, poly2: PolygonCoordinates): boolean {
  const bounds1 = getPolygonBounds(poly1)
  const bounds2 = getPolygonBounds(poly2)
  
  if (!bounds1 || !bounds2) return false
  
  // Bounding box intersection check
  return !(bounds1.east < bounds2.west || 
          bounds2.east < bounds1.west || 
          bounds1.north < bounds2.south || 
          bounds2.north < bounds1.south)
}

function getPolygonBounds(coordinates: PolygonCoordinates) {
  if (coordinates.length === 0 || coordinates[0].length === 0) return null
  
  const ring = coordinates[0] // Use exterior ring
  let north = -90, south = 90, east = -180, west = 180
  
  ring.forEach(([lon, lat]) => {
    north = Math.max(north, lat)
    south = Math.min(south, lat)
    east = Math.max(east, lon)
    west = Math.min(west, lon)
  })
  
  return { north, south, east, west }
}

// Find intersections between geometries (basic implementation)
export function findIntersections(geom1: RegionGeometry, geom2: RegionGeometry): boolean {
  const coords1 = extractPolygonCoordinates(geom1)
  const coords2 = extractPolygonCoordinates(geom2)
  
  // Check each polygon pair for intersection
  for (const poly1 of coords1) {
    for (const poly2 of coords2) {
      if (polygonIntersects(poly1, poly2)) {
        return true
      }
    }
  }
  
  return false
}

function extractPolygonCoordinates(geometry: RegionGeometry): PolygonCoordinates[] {
  if (isGeoJSONPolygon(geometry)) {
    return [geometry.coordinates]
  }
  
  if (isGeoJSONMultiPolygon(geometry)) {
    return geometry.coordinates
  }
  
  return []
}

// Buffer calculation (simplified - creates a rough buffer around coordinates)
export function createBuffer(coordinates: PolygonCoordinates, bufferDistance: number): PolygonCoordinates {
  if (coordinates.length === 0) return coordinates
  
  const exteriorRing = coordinates[0]
  const bufferedRing: CoordinateRing = []
  
  // Simple buffer implementation - offset each point by buffer distance
  for (const [lon, lat] of exteriorRing) {
    // Convert buffer distance from meters to degrees (very approximate)
    const deltaLat = (bufferDistance / 111000) // ~111km per degree latitude
    const deltaLon = deltaLat / Math.cos((lat * Math.PI) / 180) // Adjust for latitude
    
    // Create a simple square buffer around each point
    bufferedRing.push([lon - deltaLon, lat - deltaLat])
    bufferedRing.push([lon + deltaLon, lat - deltaLat])
    bufferedRing.push([lon + deltaLon, lat + deltaLat])
    bufferedRing.push([lon - deltaLon, lat + deltaLat])
  }
  
  // Close the ring
  if (bufferedRing.length > 0) {
    bufferedRing.push(bufferedRing[0])
  }
  
  return [bufferedRing]
}

// Spatial query helpers
export interface SpatialQuery {
  point?: Coordinates
  geometry?: RegionGeometry
  buffer?: number
  operation: 'intersects' | 'contains' | 'within' | 'distance'
}

export function executeSpatialQuery(
  targetGeometry: RegionGeometry,
  query: SpatialQuery
): { matches: boolean; distance?: number; area?: number } {
  switch (query.operation) {
    case 'contains':
      if (query.point) {
        return { matches: pointInGeometry(query.point, targetGeometry) }
      }
      break
      
    case 'intersects':
      if (query.geometry) {
        return { matches: findIntersections(targetGeometry, query.geometry) }
      }
      break
      
    case 'distance':
      if (query.point) {
        // Calculate distance to polygon centroid (simplified)
        const coords = extractPolygonCoordinates(targetGeometry)
        if (coords.length > 0) {
          const centroid = calculatePolygonCentroid(coords[0])
          const distance = calculateDistance(query.point, centroid)
          return { 
            matches: query.buffer ? distance <= query.buffer : true, 
            distance 
          }
        }
      }
      break
      
    case 'within':
      if (query.geometry && query.point) {
        return { 
          matches: pointInGeometry(query.point, query.geometry) && 
                  pointInGeometry(query.point, targetGeometry)
        }
      }
      break
  }
  
  return { matches: false }
}

// Coordinate transformation utilities for different map projections
export class CoordinateTransformations {
  // Web Mercator (EPSG:3857) transformations
  static toWebMercator(coordinates: CoordinateRing): Array<[number, number]> {
    return coordinates.map(([lon, lat]) => {
      const x = (lon * 20037508.34) / 180
      let y = Math.log(Math.tan(((90 + lat) * Math.PI) / 360)) / (Math.PI / 180)
      y = (y * 20037508.34) / 180
      return [x, y]
    })
  }
  
  static fromWebMercator(coordinates: Array<[number, number]>): CoordinateRing {
    return coordinates.map(([x, y]) => {
      const lon = (x / 20037508.34) * 180
      let lat = (y / 20037508.34) * 180
      lat = (180 / Math.PI) * (2 * Math.atan(Math.exp((lat * Math.PI) / 180)) - Math.PI / 2)
      return [lon, lat] as Coordinates
    })
  }
  
  // British National Grid (EPSG:27700) - simplified conversion
  static toBritishNationalGrid(coordinates: CoordinateRing): Array<[number, number]> {
    // This is a very simplified conversion - for production use a proper library
    return coordinates.map(([lon, lat]) => {
      // Approximate conversion to BNG (not geodetically accurate)
      const x = (lon + 2) * 100000 // Very rough approximation
      const y = (lat - 49) * 100000 // Very rough approximation
      return [x, y]
    })
  }
}