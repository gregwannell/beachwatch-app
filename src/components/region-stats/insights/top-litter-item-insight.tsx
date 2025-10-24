import { Info } from "lucide-react"
import type { RegionData } from '@/types/region-types'

interface TopLitterItemInsightProps {
  topLitterItems: NonNullable<RegionData['litterData']>['topLitterItems']
}

export function TopLitterItemInsight({ topLitterItems }: TopLitterItemInsightProps) {
  if (!topLitterItems || topLitterItems.length === 0) {
    return null
  }

  const topItem = topLitterItems[0]

  return (
    <div className="p-4 rounded-lg border bg-card">
      <div className="flex items-center space-x-2 mb-2">
        <Info className="w-4 h-4 text-primary" />
        <span className="text-sm font-medium">Top Litter Item</span>
      </div>
      <p className="text-sm text-muted-foreground">
        <strong>{topItem.item.name}</strong> is the most common item
        ({topItem.avgPer100m.toFixed(1)} per 100m)
      </p>
    </div>
  )
}
