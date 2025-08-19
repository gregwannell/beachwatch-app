import type { 
  RegionGeometry, 
  GeoJSONPolygon, 
  GeoJSONMultiPolygon,
  Coordinates,
  CoordinateRing,
  PolygonCoordinates,
  BoundaryData
} from './database.types'

// Type guards for geometry validation
export function isGeoJSONPolygon(geometry: RegionGeometry): geometry is GeoJSONPolygon {
  return geometry.type === 'Polygon'
}

export function isGeoJSONMultiPolygon(geometry: RegionGeometry): geometry is GeoJSONMultiPolygon {
  return geometry.type === 'MultiPolygon'
}

export function isValidCoordinate(coord: unknown): coord is Coordinates {
  return Array.isArray(coord) && 
         coord.length === 2 && 
         typeof coord[0] === 'number' && 
         typeof coord[1] === 'number' &&
         coord[0] >= -180 && coord[0] <= 180 && // longitude bounds
         coord[1] >= -90 && coord[1] <= 90      // latitude bounds
}

export function isValidCoordinateRing(ring: unknown): ring is CoordinateRing {
  return Array.isArray(ring) && 
         ring.length >= 4 && 
         ring.every(isValidCoordinate) &&
         // First and last coordinates should be the same (closed ring)
         ring[0][0] === ring[ring.length - 1][0] &&
         ring[0][1] === ring[ring.length - 1][1]
}

// Validation functions for JSONB geometry data
export function validateJsonbPolygon(geometry: unknown): geometry is GeoJSONPolygon {
  if (!geometry || typeof geometry !== 'object') return false
  
  const geo = geometry as Record<string, unknown>
  
  if (geo.type !== 'Polygon') return false
  
  const coordinates = geo.coordinates
  if (!Array.isArray(coordinates) || coordinates.length === 0) return false
  
  return coordinates.every(isValidCoordinateRing)
}

export function validateJsonbMultiPolygon(geometry: unknown): geometry is GeoJSONMultiPolygon {
  if (!geometry || typeof geometry !== 'object') return false
  
  const geo = geometry as Record<string, unknown>
  
  if (geo.type !== 'MultiPolygon') return false
  
  const coordinates = geo.coordinates
  if (!Array.isArray(coordinates) || coordinates.length === 0) return false
  
  return coordinates.every((polygon: unknown) => 
    Array.isArray(polygon) && polygon.every(isValidCoordinateRing)
  )
}

export function validateRegionGeometry(geometry: unknown): geometry is RegionGeometry {
  return validateJsonbPolygon(geometry) || validateJsonbMultiPolygon(geometry)
}

// Coordinate bounds calculation
export function calculatePolygonBounds(coordinates: PolygonCoordinates): BoundaryData['bounds'] {
  if (!coordinates || coordinates.length === 0) return undefined
  
  let north = -90, south = 90, east = -180, west = 180
  
  // Check all rings of the polygon
  coordinates.forEach(ring => {
    ring.forEach(([lng, lat]) => {
      north = Math.max(north, lat)
      south = Math.min(south, lat)
      east = Math.max(east, lng)
      west = Math.min(west, lng)
    })
  })
  
  return { north, south, east, west }
}

export function calculateGeometryBounds(geometry: RegionGeometry): BoundaryData['bounds'] {
  if (isGeoJSONPolygon(geometry)) {
    return calculatePolygonBounds(geometry.coordinates)
  }
  
  if (isGeoJSONMultiPolygon(geometry)) {
    let north = -90, south = 90, east = -180, west = 180
    
    geometry.coordinates.forEach(polygon => {
      const bounds = calculatePolygonBounds(polygon)
      if (bounds) {
        north = Math.max(north, bounds.north)
        south = Math.min(south, bounds.south)
        east = Math.max(east, bounds.east)
        west = Math.min(west, bounds.west)
      }
    })
    
    return { north, south, east, west }
  }
  
  return undefined
}

// Polygon simplification for different zoom levels
export function simplifyPolygonCoordinates(
  coordinates: PolygonCoordinates,
  tolerance: number = 0.001
): PolygonCoordinates {
  // Douglas-Peucker simplification algorithm
  return coordinates.map(ring => simplifyRing(ring, tolerance))
}

function simplifyRing(ring: CoordinateRing, tolerance: number): CoordinateRing {
  if (ring.length <= 2) return ring
  
  // Simple implementation - for production, consider using a library like simplify-js
  const simplified: CoordinateRing = [ring[0]]
  
  for (let i = 1; i < ring.length - 1; i++) {
    const prev = simplified[simplified.length - 1]
    const curr = ring[i]
    const next = ring[i + 1]
    
    // Calculate perpendicular distance from current point to line between prev and next
    const distance = perpendicularDistance(curr, prev, next)
    
    if (distance > tolerance) {
      simplified.push(curr)
    }
  }
  
  // Always include the last point (which should be same as first for closed ring)
  simplified.push(ring[ring.length - 1])
  
  return simplified
}

function perpendicularDistance(
  point: Coordinates,
  lineStart: Coordinates,
  lineEnd: Coordinates
): number {
  const [x0, y0] = point
  const [x1, y1] = lineStart
  const [x2, y2] = lineEnd
  
  const A = x0 - x1
  const B = y0 - y1
  const C = x2 - x1
  const D = y2 - y1
  
  const dot = A * C + B * D
  const lenSq = C * C + D * D
  
  if (lenSq === 0) {
    // Line start and end are the same point
    return Math.sqrt(A * A + B * B)
  }
  
  const param = dot / lenSq
  
  let xx: number, yy: number
  
  if (param < 0) {
    xx = x1
    yy = y1
  } else if (param > 1) {
    xx = x2
    yy = y2
  } else {
    xx = x1 + param * C
    yy = y1 + param * D
  }
  
  const dx = x0 - xx
  const dy = y0 - yy
  
  return Math.sqrt(dx * dx + dy * dy)
}

// Optimization for different zoom levels
export function optimizeForZoom(geometry: RegionGeometry, zoomLevel: number): RegionGeometry {
  // Tolerance increases as zoom level decreases (more simplification for lower zoom)
  const tolerance = Math.max(0.0001, (15 - zoomLevel) * 0.001)
  
  if (isGeoJSONPolygon(geometry)) {
    return {
      type: 'Polygon',
      coordinates: simplifyPolygonCoordinates(geometry.coordinates, tolerance)
    }
  }
  
  if (isGeoJSONMultiPolygon(geometry)) {
    return {
      type: 'MultiPolygon',
      coordinates: geometry.coordinates.map(polygon => 
        simplifyPolygonCoordinates(polygon, tolerance)
      )
    }
  }
  
  return geometry
}

// Utility to create BoundaryData from geometry
export function createBoundaryData(geometry: RegionGeometry | null): BoundaryData {
  return {
    geometry,
    bounds: geometry ? calculateGeometryBounds(geometry) : undefined
  }
}

// Extract coordinates from geometry for map rendering
export function extractCoordinatesFromGeometry(geometry: RegionGeometry): CoordinateRing[] {
  if (isGeoJSONPolygon(geometry)) {
    return geometry.coordinates
  }
  
  if (isGeoJSONMultiPolygon(geometry)) {
    return geometry.coordinates.flat()
  }
  
  return []
}

// Coordinate transformations (basic Web Mercator support)
export function lonLatToWebMercator(lon: number, lat: number): [number, number] {
  const x = (lon * 20037508.34) / 180
  let y = Math.log(Math.tan(((90 + lat) * Math.PI) / 360)) / (Math.PI / 180)
  y = (y * 20037508.34) / 180
  return [x, y]
}

export function webMercatorToLonLat(x: number, y: number): [number, number] {
  const lon = (x / 20037508.34) * 180
  let lat = (y / 20037508.34) * 180
  lat = (180 / Math.PI) * (2 * Math.atan(Math.exp((lat * Math.PI) / 180)) - Math.PI / 2)
  return [lon, lat]
}

// Additional validation helpers
export function validateCoordinateBounds(coord: Coordinates, bounds?: { 
  minLon?: number, maxLon?: number, minLat?: number, maxLat?: number 
}): boolean {
  const [lon, lat] = coord
  
  if (!isValidCoordinate(coord)) return false
  
  if (bounds) {
    if (bounds.minLon !== undefined && lon < bounds.minLon) return false
    if (bounds.maxLon !== undefined && lon > bounds.maxLon) return false
    if (bounds.minLat !== undefined && lat < bounds.minLat) return false
    if (bounds.maxLat !== undefined && lat > bounds.maxLat) return false
  }
  
  return true
}

// UK-specific bounds for validation
export const UK_BOUNDS = {
  minLon: -8.5,
  maxLon: 2.0,
  minLat: 49.5,
  maxLat: 61.0
}

export function validateUKCoordinate(coord: Coordinates): boolean {
  return validateCoordinateBounds(coord, UK_BOUNDS)
}