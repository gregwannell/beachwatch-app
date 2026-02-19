import { Info } from "lucide-react"
import type { RegionData } from '@/types/region-types'
import { CardWithBackground } from './card-with-background'

interface TopLitterItemSourceCardProps {
  topLitterItems: NonNullable<RegionData['litterData']>['topLitterItems']
  sourceBreakdown: NonNullable<RegionData['litterData']>['sourceBreakdown']
}

export function TopLitterItemSourceCard({ topLitterItems, sourceBreakdown }: TopLitterItemSourceCardProps) {
  const topItem = topLitterItems?.[0]
  const topSource = sourceBreakdown?.[0]

  if (!topItem && !topSource) return null

  return (
    <CardWithBackground backgroundImage="/waves-turquoise.svg">
      <div className="flex flex-col gap-4 flex-1">
        {topItem && (
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <Info className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">Top Litter Item</span>
            </div>
            <p className="text-sm text-muted-foreground">
              <strong>{topItem.item.name}</strong> — {topItem.avgPer100m.toFixed(1)} per 100m
            </p>
          </div>
        )}

        {topItem && topSource && (
          <hr className="border-border" />
        )}

        {topSource && (
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <Info className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">Top Litter Source</span>
            </div>
            <p className="text-sm text-muted-foreground">
              <strong>{topSource.source}</strong> — {topSource.avgPer100m.toFixed(1)} per 100m ({topSource.percentage.toFixed(1)}% of total)
            </p>
          </div>
        )}
      </div>
    </CardWithBackground>
  )
}
