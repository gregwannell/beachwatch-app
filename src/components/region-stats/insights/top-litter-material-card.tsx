import Image from 'next/image'
import { Hammer } from 'lucide-react'
import type { RegionData } from '@/types/region-types'

interface TopLitterMaterialCardProps {
  materialBreakdown: NonNullable<RegionData['litterData']>['materialBreakdown']
}

export function TopLitterMaterialCard({ materialBreakdown }: TopLitterMaterialCardProps) {
  if (!materialBreakdown || materialBreakdown.length === 0) return null

  const topMaterial = [...materialBreakdown].sort((a, b) => b.percentage - a.percentage)[0]

  return (
    <div className="bg-gradient-to-br from-mcs-ink to-mcs-navy rounded-2xl border border-white/10 p-6 min-h-[260px] flex flex-col justify-between relative overflow-hidden">
      <Image
        src="/topography-dark.svg"
        alt=""
        fill
        className="object-cover"
        style={{ opacity: 1 }}
      />

      {/* Top section */}
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div className="w-10 h-10 rounded-full bg-mcs-orange/20 flex items-center justify-center">
            <Hammer className="w-5 h-5 text-mcs-orange" />
          </div>
          <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-mcs-orange/20 text-mcs-orange border border-mcs-orange/30">
            Top Material Type
          </span>
        </div>
        <p className="text-2xl font-bold text-white leading-tight">{topMaterial.material}</p>
      </div>

      {/* Bottom section */}
      <div className="relative z-10 mt-1">
        <div className="flex items-end gap-2 mb-3">
          <span className="text-5xl font-bold text-mcs-orange">{Math.round(topMaterial.percentage)}%</span>
          <span className="text-sm text-slate-200 mb-1.5">of total items</span>
        </div>
        <div className="w-full bg-white/10 rounded-full h-2 mb-3">
          <div
            className="bg-mcs-orange h-2 rounded-full transition-all duration-500"
            style={{ width: `${Math.min(topMaterial.percentage, 100)}%` }}
          />
        </div>
        <p className="text-sm text-slate-200 leading-relaxed">
          Found on <strong>{topMaterial.presence.toFixed(1)}%</strong> of surveys, averaging <strong>{topMaterial.avgPer100m.toFixed(1)}</strong> per 100m with <strong>{topMaterial.count.toLocaleString()}</strong> items recorded in total.
        </p>
      </div>
    </div>
  )
}
