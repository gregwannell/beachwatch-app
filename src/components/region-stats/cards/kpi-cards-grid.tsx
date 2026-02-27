"use client"

import { useState } from "react"
import { Trash2, Waves, ShoppingBag, Weight, Info, X } from "lucide-react"
import type { RegionData } from '@/types/region-types'

interface KpiCardsGridProps {
  litterData: NonNullable<RegionData['litterData']>
}

const cardConfigs = [
  {
    id: "total-litter",
    label: "Total Litter",
    icon: Trash2,
    iconBg: "bg-blue-50 dark:bg-blue-900/30",
    iconColor: "text-blue-500",
    getValue: (data: NonNullable<RegionData['litterData']>) => data.totalLitter.toLocaleString(),
    unit: "Items",
    description: "Every individual piece of litter that was identified, counted, and recorded",
  },
  {
    id: "coastline-surveyed",
    label: "Coastline Surveyed",
    icon: Waves,
    iconBg: "bg-emerald-50 dark:bg-emerald-900/30",
    iconColor: "text-emerald-500",
    getValue: (data: NonNullable<RegionData['litterData']>) => data.totalLengthSurveyed.toLocaleString(),
    unit: "metres",
    description: "The total linear distance of beach that has been surveyed and cleaned",
  },
  {
    id: "bags-collected",
    label: "Bags Collected",
    icon: ShoppingBag,
    iconBg: "bg-amber-50 dark:bg-amber-900/30",
    iconColor: "text-amber-500",
    getValue: (data: NonNullable<RegionData['litterData']>) => Math.round(data.totalBags).toLocaleString(),
    unit: "bags",
    description: "The number of bags filled during surveys. Bag sizes and packing density will vary between surveys.",
  },
  {
    id: "weight-removed",
    label: "Weight Removed",
    icon: Weight,
    iconBg: "bg-rose-50 dark:bg-rose-900/30",
    iconColor: "text-rose-500",
    getValue: (data: NonNullable<RegionData['litterData']>) => Math.round(data.totalWeight).toLocaleString(),
    unit: "kg",
    description: "The total weight of all litter collected. Weight is highly influenced by litter type and whether items are wet.",
  },
]

function KpiCard({ config, litterData }: { config: typeof cardConfigs[number]; litterData: KpiCardsGridProps['litterData'] }) {
  const [showInfo, setShowInfo] = useState(false)
  const IconComponent = config.icon

  return (
    <div className="bg-card p-4 rounded-2xl shadow-sm hover:shadow-lg transition-shadow border group min-h-[76px]">
      <div className="flex items-center gap-3">
        <div className={`p-2.5 rounded-xl ${config.iconBg} shrink-0`}>
          <IconComponent className={`w-5 h-5 ${config.iconColor}`} />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-muted-foreground font-medium text-xs">{config.label}</h3>
          {showInfo ? (
            <p className="text-xs leading-relaxed text-muted-foreground mt-1">{config.description}</p>
          ) : (
            <p className="text-xl font-bold mt-0.5 tabular-nums">
              {config.getValue(litterData)}
              {config.unit && <span className="text-xs font-medium text-muted-foreground ml-0.5">{config.unit}</span>}
            </p>
          )}
        </div>
        <button
          id={`${config.id}-info-button`}
          onClick={() => setShowInfo(!showInfo)}
          className="shrink-0 rounded-full p-0.5 text-muted-foreground/40 hover:text-muted-foreground hover:bg-muted transition-colors"
          aria-label={showInfo ? `Hide info for ${config.label}` : `Show info for ${config.label}`}
        >
          {showInfo ? <X className="h-3.5 w-3.5" /> : <Info className="h-3.5 w-3.5" />}
        </button>
      </div>
    </div>
  )
}

export function KpiCardsGrid({ litterData }: KpiCardsGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {cardConfigs.map((config) => (
        <KpiCard key={config.id} config={config} litterData={litterData} />
      ))}
    </div>
  )
}
