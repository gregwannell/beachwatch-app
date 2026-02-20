// Main component
export { RegionStatsContent } from './region-stats-content'

// Hero components
export { GradientHeroHeader } from './hero'

// Tab components
export { OverviewTab, LitterStatsTab, EngagementTab } from './tabs'

// Card components
export { AverageLitterKpiCard, LitterCollectionStats, EngagementStats, KpiCardsGrid } from './cards'

// Insight components
export {
  HistoricalContextInsight,
  TopLitterMaterialCard,
  TopLitterItemCard,
  TopLitterSourceCard,
  InsightsCarousel,
} from './insights'

// Small reusable components
export { EmptyState, LoadingSkeleton, YearOverYearBadge, UkComparisonText } from './components'

// Charts
export { AverageLitterChart } from './charts'

// Utilities
export {
  calculateHistoricalStats,
  getRankingSuffix,
  getRankingText,
  getBreadcrumbHierarchy,
  type HistoricalStats,
  type BreadcrumbItem
} from './utils'
