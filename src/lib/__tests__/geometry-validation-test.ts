// Test script for geometry validation
// This file is for testing purposes and can be run to validate the geometry processing

import { RegionGeometryService } from '../region-geometry-service'
import { validateRegionGeometry, calculateGeometryBounds } from '../geometry-utils'
import { pointInGeometry, calculateDistance } from '../spatial-operations'
import type { RegionGeometry } from '../database.types'

// Test data - simplified UK boundary examples
const testPolygon: RegionGeometry = {
  type: 'Polygon',
  coordinates: [[
    [-2.0, 50.0], // SW England
    [1.0, 50.0],  // SE England
    [1.0, 55.0],  // NE England
    [-2.0, 55.0], // NW England
    [-2.0, 50.0]  // Close the ring
  ]]
}

const testMultiPolygon: RegionGeometry = {
  type: 'MultiPolygon',
  coordinates: [
    [[ // England
      [-2.0, 50.0],
      [1.0, 50.0],
      [1.0, 55.0],
      [-2.0, 55.0],
      [-2.0, 50.0]
    ]],
    [[ // Scotland (simplified)
      [-4.0, 55.0],
      [-1.0, 55.0],
      [-1.0, 59.0],
      [-4.0, 59.0],
      [-4.0, 55.0]
    ]]
  ]
}

const invalidGeometry = {
  type: 'Polygon',
  coordinates: [[
    [-2.0, 50.0],
    [1.0, 50.0],
    // Missing closing coordinate - invalid ring
  ]]
}

console.log('=== Geometry Validation Tests ===\n')

// Test 1: Valid Polygon
console.log('Test 1: Valid Polygon')
const validation1 = RegionGeometryService.validateGeometry(testPolygon)
console.log('Is valid:', validation1.isValid)
console.log('Errors:', validation1.errors)
console.log('Warnings:', validation1.warnings)
console.log('Metadata:', validation1.metadata)
console.log()

// Test 2: Valid MultiPolygon
console.log('Test 2: Valid MultiPolygon')
const validation2 = RegionGeometryService.validateGeometry(testMultiPolygon)
console.log('Is valid:', validation2.isValid)
console.log('Errors:', validation2.errors)
console.log('Warnings:', validation2.warnings)
console.log('Metadata:', validation2.metadata)
console.log()

// Test 3: Invalid Geometry
console.log('Test 3: Invalid Geometry')
const validation3 = RegionGeometryService.validateGeometry(invalidGeometry)
console.log('Is valid:', validation3.isValid)
console.log('Errors:', validation3.errors)
console.log()

// Test 4: Geometry Processing
console.log('Test 4: Geometry Processing')
const processed = RegionGeometryService.processGeometry(testPolygon, {
  simplify: true,
  calculateMetadata: true
})
console.log('Original coordinates:', testPolygon.coordinates[0].length)
console.log('Simplified coordinates:', processed.simplified?.type === 'Polygon' ? processed.simplified.coordinates[0].length : 'N/A')
console.log('Area:', processed.metadata.area)
console.log('Centroid:', processed.metadata.centroid)
console.log('Bounds:', processed.bounds)
console.log()

// Test 5: Spatial Operations
console.log('Test 5: Spatial Operations')
const testPoint: [number, number] = [-0.5, 52.0] // Point in England
const containsPoint = pointInGeometry(testPoint, testPolygon)
console.log(`Point ${testPoint} is in polygon:`, containsPoint)

const outsidePoint: [number, number] = [5.0, 45.0] // Point outside UK
const containsOutside = pointInGeometry(outsidePoint, testPolygon)
console.log(`Point ${outsidePoint} is in polygon:`, containsOutside)

const distance = calculateDistance(testPoint, outsidePoint)
console.log('Distance between points (meters):', Math.round(distance))
console.log()

// Test 6: Batch Processing
console.log('Test 6: Batch Processing')
const testRegions = [
  { id: 1, geometry: testPolygon },
  { id: 2, geometry: testMultiPolygon },
  { id: 3, geometry: null }
]

const batchResult = RegionGeometryService.batchProcessGeometries(testRegions)
console.log('Batch processing results:')
batchResult.forEach((result, id) => {
  console.log(`Region ${id}:`, result ? 'Processed successfully' : 'No geometry or failed')
})
console.log()

// Test 7: Find Regions Containing Point
console.log('Test 7: Find Regions Containing Point')
const containmentResults = RegionGeometryService.findRegionsContainingPoint(
  testPoint,
  testRegions
)
containmentResults.forEach(result => {
  console.log(`Region ${result.id}: contained=${result.contained}, distance=${result.distance?.toFixed(0)}m`)
})

console.log('\n=== All Tests Complete ===')

export {
  testPolygon,
  testMultiPolygon,
  invalidGeometry
}