import Image from 'next/image'
import { Trash2 } from 'lucide-react'
import type { RegionData } from '@/types/region-types'

interface TopLitterItemCardProps {
  topLitterItems: NonNullable<RegionData['litterData']>['topLitterItems']
}

export function TopLitterItemCard({ topLitterItems }: TopLitterItemCardProps) {
  const topItem = topLitterItems?.[0]
  if (!topItem) return null

  return (
    <div className="bg-gradient-to-br from-mcs-ink to-mcs-navy rounded-2xl border border-white/10 p-6 min-h-[260px] flex flex-col justify-between relative overflow-hidden">
      <Image
        src="/waves-turquoise.png"
        alt=""
        fill
        className="object-cover"
        style={{ opacity: 0.06 }}
      />

      {/* Top section */}
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div className="w-10 h-10 rounded-full bg-mcs-teal/20 flex items-center justify-center">
            <Trash2 className="w-5 h-5 text-mcs-teal" />
          </div>
          <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-mcs-teal/20 text-mcs-teal border border-mcs-teal/30">
            Top Litter Item
          </span>
        </div>
        <p className="text-2xl font-bold text-white leading-tight">{topItem.item.shortName ?? topItem.item.name}</p>
        <div className="mt-3">
          <span className="text-5xl font-bold text-mcs-teal">{topItem.avgPer100m.toFixed(1)}</span>
          <span className="text-base font-semibold text-slate-200 ml-2">per 100m</span>
        </div>
      </div>

      {/* Bottom section */}
      <div className="relative z-10 space-y-1">
        <p className="text-sm text-slate-200">Found on <strong>{topItem.presence.toFixed(1)}%</strong> of surveys with <strong>{topItem.total.toLocaleString()}</strong> items recorded in total</p>
      </div>
    </div>
  )
}
