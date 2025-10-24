import { Info } from "lucide-react"
import type { RegionData } from '@/types/region-types'

interface TopSourceInsightProps {
  sourceBreakdown: NonNullable<RegionData['litterData']>['sourceBreakdown']
}

export function TopSourceInsight({ sourceBreakdown }: TopSourceInsightProps) {
  if (!sourceBreakdown || sourceBreakdown.length === 0) {
    return null
  }

  const topSource = sourceBreakdown[0]

  return (
    <div className="p-5 rounded-xl border bg-card min-h-[140px] flex flex-col">
      <div className="flex items-center space-x-2 mb-3">
        <Info className="w-4 h-4 text-primary" />
        <span className="text-sm font-medium">Top Litter Source</span>
      </div>
      <p className="text-sm text-muted-foreground flex-1">
        <strong>{topSource.source}</strong> is the primary source
        ({topSource.avgPer100m.toFixed(1)} per 100m, {topSource.percentage.toFixed(1)}% share)
      </p>
    </div>
  )
}
