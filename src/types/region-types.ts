export interface SuggestedRegion {
  id: string
  name: string
  level: 'country' | 'county' | 'region'
  distance?: string
  dataAvailability: 'full' | 'partial' | 'limited'
}

export interface RegionData {
  id: string
  name: string
  level: 'country' | 'county' | 'region'
  parentId?: string
  parentName?: string
  hasData: boolean
  hasDataForYear?: boolean   // false when region has data overall but not for the selected year
  lastDataYear?: number      // most recent year that had data (used in no-data-for-year UI)
  suggestedRegions?: SuggestedRegion[]
  litterData?: {
    topItems: Array<{
      category: string
      count: number
      percentage: number
    }>
    materialBreakdown: Array<{
      material: string
      count: number
      avgPer100m: number
      percentage: number
      presence: number
      yearOverYearChange?: number
    }>
    sourceBreakdown: Array<{
      source: string
      count: number
      avgPer100m: number
      percentage: number
      presence: number
      yearOverYearChange?: number
    }>
    topLitterItems?: Array<{
      item: {
        id: number
        name: string
        shortName?: string
      }
      total: number
      avgPer100m: number
      presence: number
    }>
    averageLitterPer100m: number
    yearOverYearChange?: number
    ukAverageComparison?: {
      ukAverage: number
      percentDifference: number
      multiplier: number
    }
    plasticFragmentsItem?: {
      avgPer100m: number
      presence: number
    }
    plasticPolystyreneComparison?: {
      regionalAvgPer100m: number
      regionalShare: number
      ukShare: number
      shareDifference: number
    }
    trendData?: Array<{
      year: number
      averageLitterPer100m: number
      date: string // ISO format for chart
    }>
    totalLitter: number
    totalLengthSurveyed: number
    totalBags: number
    totalWeight: number
  }
  engagementData?: {
    surveyCount: number
    volunteerCount: number  
    totalBeachLength: number
    yearOverYearChanges?: {
      surveys: number
      volunteers: number
      beachLength: number
    }
  }
}