"use client"

import { Trash2, Waves, ShoppingBag, Weight, Info } from "lucide-react"
import type { RegionData } from '@/types/region-types'

interface KpiCardsGridProps {
  litterData: NonNullable<RegionData['litterData']>
}

// Static decorative sparkline SVGs for visual interest
function Sparkline({ color }: { color: string }) {
  return (
    <svg className={`w-16 h-8 ${color}`} fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="2" viewBox="0 0 100 40">
      <path d="M5,35 Q15,10 25,25 T45,15 T65,30 T85,10 T100,20" />
    </svg>
  )
}

function SparklineWave({ color }: { color: string }) {
  return (
    <svg className={`w-16 h-8 ${color}`} fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="2" viewBox="0 0 100 40">
      <path d="M0,20 Q10,15 20,25 T40,20 T60,15 T80,25 T100,20" />
    </svg>
  )
}

function SparklineUp({ color }: { color: string }) {
  return (
    <svg className={`w-16 h-8 ${color}`} fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="2" viewBox="0 0 100 40">
      <path d="M0,35 L20,30 L40,32 L60,15 L80,10 L100,5" />
    </svg>
  )
}

function SparklineCurve({ color }: { color: string }) {
  return (
    <svg className={`w-16 h-8 ${color}`} fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="2" viewBox="0 0 100 40">
      <path d="M0,10 Q20,30 40,20 T80,30 L100,25" />
    </svg>
  )
}

const cardConfigs = [
  {
    id: "total-litter",
    label: "Total Litter Items",
    icon: Trash2,
    iconBg: "bg-blue-50 dark:bg-blue-900/30",
    iconColor: "text-blue-500",
    sparklineColor: "text-blue-400/60",
    SparklineComponent: Sparkline,
    statusIcon: Info,
    statusText: "Every piece counted",
    statusColor: "text-muted-foreground",
    getValue: (data: NonNullable<RegionData['litterData']>) => data.totalLitter.toLocaleString(),
  },
  {
    id: "coastline-surveyed",
    label: "Coastline Surveyed",
    icon: Waves,
    iconBg: "bg-emerald-50 dark:bg-emerald-900/30",
    iconColor: "text-emerald-500",
    sparklineColor: "text-emerald-400/60",
    SparklineComponent: SparklineWave,
    statusIcon: Info,
    statusText: "Including cleaning distance",
    statusColor: "text-muted-foreground",
    getValue: (data: NonNullable<RegionData['litterData']>) => `${data.totalLengthSurveyed.toLocaleString()}m`,
  },
  {
    id: "bags-collected",
    label: "Bags Collected",
    icon: ShoppingBag,
    iconBg: "bg-amber-50 dark:bg-amber-900/30",
    iconColor: "text-amber-500",
    sparklineColor: "text-amber-400/60",
    SparklineComponent: SparklineUp,
    statusIcon: Info,
    statusText: "Variable bag density",
    statusColor: "text-muted-foreground",
    getValue: (data: NonNullable<RegionData['litterData']>) => Math.round(data.totalBags).toLocaleString(),
  },
  {
    id: "weight-removed",
    label: "Weight Removed",
    icon: Weight,
    iconBg: "bg-rose-50 dark:bg-rose-900/30",
    iconColor: "text-rose-500",
    sparklineColor: "text-rose-400/60",
    SparklineComponent: SparklineCurve,
    statusIcon: Info,
    statusText: "Influenced by wet weight",
    statusColor: "text-muted-foreground",
    getValue: (data: NonNullable<RegionData['litterData']>) => `${Math.round(data.totalWeight).toLocaleString()}kg`,
  },
]

export function KpiCardsGrid({ litterData }: KpiCardsGridProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {cardConfigs.map((config) => {
        const IconComponent = config.icon
        const StatusIcon = config.statusIcon
        const SparklineComp = config.SparklineComponent

        return (
          <div
            key={config.id}
            className="bg-card p-4 rounded-2xl shadow-sm hover:shadow-lg transition-shadow border group"
          >
            <div className="flex justify-between items-start mb-3">
              <div className={`p-2 rounded-xl ${config.iconBg}`}>
                <IconComponent className={`w-4 h-4 ${config.iconColor}`} />
              </div>
              <SparklineComp color={config.sparklineColor} />
            </div>

            <h3 className="text-muted-foreground font-medium text-xs">{config.label}</h3>
            <p className="text-xl font-bold mt-0.5 tabular-nums">{config.getValue(litterData)}</p>

            <div className="mt-2 flex items-center gap-1 text-[10px] font-medium text-muted-foreground/70">
              <StatusIcon className="w-3 h-3" />
              <span>{config.statusText}</span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
