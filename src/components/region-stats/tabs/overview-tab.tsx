import type { RegionData } from '@/types/region-types'
import { KpiCardsGrid } from '../cards/kpi-cards-grid'
import { SurveyHighlightCard } from '../cards/survey-highlight-card'
import { InsightsCarousel } from '../insights'

interface OverviewTabProps {
  regionData: RegionData
  selectedYear?: number
}

export function OverviewTab({ regionData, selectedYear }: OverviewTabProps) {
  return (
    <div className="space-y-6">
      {/* Survey Highlight Card */}
      {regionData.engagementData && (
        <SurveyHighlightCard engagementData={regionData.engagementData} />
      )}

      {/* KPI Cards Grid - 2x2 collection stats */}
      {regionData.litterData && (
        <KpiCardsGrid litterData={regionData.litterData} />
      )}

      {/* Key Insights Carousel */}
      <InsightsCarousel regionData={regionData} selectedYear={selectedYear} />
    </div>
  )
}
