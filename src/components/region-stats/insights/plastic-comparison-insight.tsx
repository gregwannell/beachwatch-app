import { Info } from "lucide-react"
import type { RegionData } from '@/types/region-types'

interface PlasticComparisonInsightProps {
  plasticPolystyreneComparison: NonNullable<RegionData['litterData']>['plasticPolystyreneComparison']
}

export function PlasticComparisonInsight({ plasticPolystyreneComparison }: PlasticComparisonInsightProps) {
  if (!plasticPolystyreneComparison) {
    return null
  }

  const { regionalAvgPer100m, regionalShare, ukShare, shareDifference } = plasticPolystyreneComparison

  return (
    <div className="p-4 rounded-lg border bg-card">
      <div className="flex items-center space-x-2 mb-2">
        <Info className="w-4 h-4 text-primary" />
        <span className="text-sm font-medium">Plastic/Polystyrene</span>
      </div>
      <p className="text-sm text-muted-foreground">
        <strong>{regionalAvgPer100m.toFixed(1)} per 100m</strong> ({regionalShare.toFixed(1)}% of litter).
        {shareDifference > 0 ? (
          <> This is <strong>{Math.abs(shareDifference).toFixed(1)}% higher</strong> than the UK average ({ukShare.toFixed(1)}%).</>
        ) : shareDifference < 0 ? (
          <> This is <strong>{Math.abs(shareDifference).toFixed(1)}% lower</strong> than the UK average ({ukShare.toFixed(1)}%).</>
        ) : (
          <> This matches the UK average ({ukShare.toFixed(1)}%).</>
        )}
      </p>
    </div>
  )
}
