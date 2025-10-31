import { Info } from "lucide-react"
import type { RegionData } from '@/types/region-types'
import { CardWithBackground } from './card-with-background'

interface TopLitterItemInsightProps {
  topLitterItems: NonNullable<RegionData['litterData']>['topLitterItems']
}

export function TopLitterItemInsight({ topLitterItems }: TopLitterItemInsightProps) {
  if (!topLitterItems || topLitterItems.length === 0) {
    return null
  }

  const topItem = topLitterItems[0]

  return (
    <CardWithBackground backgroundImage="/waves-turquoise.svg">
      <div className="flex items-center space-x-2 mb-3">
        <Info className="w-4 h-4 text-primary" />
        <span className="text-sm font-medium">Top Litter Item</span>
      </div>
      <p className="text-sm text-muted-foreground flex-1">
        <strong>{topItem.item.name}</strong> is the most common item
        ({topItem.avgPer100m.toFixed(1)} per 100m)
      </p>
    </CardWithBackground>
  )
}
