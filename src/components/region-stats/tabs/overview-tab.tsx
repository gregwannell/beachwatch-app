import type { RegionData } from '@/types/region-types'
import { AverageLitterKpiCard } from '../cards/average-litter-kpi-card'
import { LitterCollectionStats } from '../cards/litter-collection-stats'
import {
  HistoricalContextInsight,
  TopLitterItemInsight,
  TopSourceInsight,
  PlasticComparisonInsight
} from '../insights'

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

      {/* Key Insights */}
      {regionData.hasData && regionData.litterData && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground">Key Insights</h3>
          <div className="grid gap-3">
            {/* Historical Context Insight */}
            <HistoricalContextInsight regionData={regionData} selectedYear={selectedYear} />

            {/* Top Litter Item */}
            <TopLitterItemInsight topLitterItems={regionData.litterData.topLitterItems} />

            {/* Top Litter Source */}
            <TopSourceInsight sourceBreakdown={regionData.litterData.sourceBreakdown} />

            {/* Plastic/Polystyrene Comparison */}
            <PlasticComparisonInsight plasticPolystyreneComparison={regionData.litterData.plasticPolystyreneComparison} />
          </div>
        </div>
      )}
    </div>
  )
}
