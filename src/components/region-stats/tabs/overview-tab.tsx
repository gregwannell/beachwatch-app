import type { RegionData } from '@/types/region-types'
import { AverageLitterKpiCard } from '../cards/average-litter-kpi-card'
import { LitterCollectionStats } from '../cards/litter-collection-stats'
import { InsightsCarousel } from '../insights'

interface OverviewTabProps {
  regionData: RegionData
  selectedYear?: number
}

export function OverviewTab({ regionData, selectedYear }: OverviewTabProps) {
  return (
    <div className="space-y-6">
      {/* Primary KPI Card - Main focal point */}
      {regionData.litterData && (
        <AverageLitterKpiCard regionData={regionData} selectedYear={selectedYear} />
      )}

      {/* Collection Stats - Compact summary */}
      {regionData.litterData && (
        <LitterCollectionStats litterData={regionData.litterData} />
      )}

      {/* Key Insights Carousel */}
      <InsightsCarousel regionData={regionData} selectedYear={selectedYear} />
    </div>
  )
}
