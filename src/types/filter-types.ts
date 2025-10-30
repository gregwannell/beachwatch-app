
// Extended region interface for filter components
export interface FilterRegion {
  id: number
  name: string
  parent_id: number | null
  type: 'UK' | 'Country' | 'Crown Dependency' | 'County Unitary'
  code: string
  has_data: boolean
  parent_name?: string // Will be populated by joining with parent data
}

// Filter state interfaces
export interface RegionFilter {
  selectedRegionId: number | null
}

export interface YearRangeFilter {
  startYear: number
  endYear: number
  mode: 'single'
}

export interface CategoryFilter {
  // Reserved for future category filters
  [key: string]: unknown
}

export interface DataAvailabilityFilter {
  showNoData: boolean
  highlightLimitedSurveys: boolean
}

// Combined filter state
export interface FilterState {
  region: RegionFilter
  yearRange: YearRangeFilter
  categories: CategoryFilter
  dataAvailability: DataAvailabilityFilter
}

// Available filter options (populated from API)
export interface FilterOptions {
  regions: FilterRegion[]
  availableYears: { min: number; max: number }
}