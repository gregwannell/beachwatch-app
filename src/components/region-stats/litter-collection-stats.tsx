import { formatNumber } from "@/lib/format-number"
import type { RegionData } from '@/types/region-types'

interface LitterCollectionStatsProps {
  litterData: NonNullable<RegionData['litterData']>
}

export function LitterCollectionStats({ litterData }: LitterCollectionStatsProps) {
  const stats = [
    {
      value: formatNumber(litterData.totalLitter, 0),
      description: "Individual pieces of litter collected"
    },
    {
      value: formatNumber(litterData.totalLengthSurveyed, 0),
      description: "Metres of coastline surveyed"
    },
    {
      value: formatNumber(Math.round(litterData.totalBags), 0),
      description: "Bags of litter collected"
    },
    {
      value: formatNumber(litterData.totalWeight, 0),
      description: "Kilograms of litter removed"
    }
  ]

  return (
    <div className="grid grid-cols-2 gap-4 p-4 rounded-lg border bg-card md:grid-cols-4">
      {stats.map((stat, index) => (
        <div
          key={index}
          className="flex flex-col space-y-1 text-center"
        >
          <div className="text-2xl font-bold tabular-nums text-primary">
            {stat.value}
          </div>
          <div className="text-xs text-muted-foreground leading-tight">
            {stat.description}
          </div>
        </div>
      ))}
    </div>
  )
}
