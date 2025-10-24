/**
 * Breadcrumb generation utilities for region hierarchy
 */

import type { RegionData } from '@/types/region-types'

export interface BreadcrumbItem {
  level: string
  name: string
}

/**
 * Generate breadcrumb hierarchy for a region
 * @param regionData - Region data object
 * @returns Array of breadcrumb items representing the hierarchy
 */
export function getBreadcrumbHierarchy(regionData: RegionData | undefined): BreadcrumbItem[] {
  if (!regionData) return []

  const hierarchy: BreadcrumbItem[] = []

  // Always start with United Kingdom unless we're already at UK level
  if (regionData.name !== 'United Kingdom') {
    hierarchy.push({ level: 'country', name: 'United Kingdom' })
  }

  if (regionData.level === 'region' && regionData.parentName) {
    // For regions: UK > [Country/County] > Region
    hierarchy.push({ level: 'parent', name: regionData.parentName })
    hierarchy.push({ level: 'region', name: regionData.name })
  } else if (regionData.level === 'county') {
    // For counties: UK > [Country if exists] > County
    if (regionData.parentName && regionData.parentName !== 'United Kingdom') {
      hierarchy.push({ level: 'country', name: regionData.parentName })
    }
    hierarchy.push({ level: 'county', name: regionData.name })
  } else if (regionData.level === 'country') {
    // For countries: UK > Country
    hierarchy.push({ level: regionData.level, name: regionData.name })
  } else {
    // For UK itself or other levels: just the region name
    hierarchy.push({ level: regionData.level, name: regionData.name })
  }

  return hierarchy
}
