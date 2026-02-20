import Image from 'next/image'
import { Users } from 'lucide-react'
import type { RegionData } from '@/types/region-types'

interface TopLitterSourceCardProps {
  sourceBreakdown: NonNullable<RegionData['litterData']>['sourceBreakdown']
}

export function TopLitterSourceCard({ sourceBreakdown }: TopLitterSourceCardProps) {
  const topSource = sourceBreakdown?.[0]
  if (!topSource) return null

  return (
    <div className="bg-gradient-to-br from-mcs-ink to-mcs-navy rounded-2xl border border-white/10 p-6 min-h-[260px] flex flex-col justify-between relative overflow-hidden">
      <Image
        src="/topography-light.svg"
        alt=""
        fill
        className="object-cover"
        style={{ opacity: 1 }}
      />

      {/* Top section */}
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div className="w-10 h-10 rounded-full bg-mcs-clear-blue/20 flex items-center justify-center">
            <Users className="w-5 h-5 text-mcs-clear-blue" />
          </div>
          <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-mcs-clear-blue/20 text-mcs-clear-blue border border-mcs-clear-blue/30">
            Top Source
          </span>
        </div>
        <p className="text-2xl font-bold text-white leading-tight">{topSource.source}</p>
        <div className="mt-3">
          <span className="text-5xl font-bold text-mcs-clear-blue">{Math.round(topSource.percentage)}%</span>
          <span className="text-base font-semibold text-slate-200 ml-2">of total litter</span>
        </div>
      </div>

      {/* Bottom section */}
      <div className="relative z-10">
        <div className="w-full bg-white/10 rounded-full h-2 mb-3">
          <div
            className="bg-mcs-clear-blue h-2 rounded-full transition-all duration-500"
            style={{ width: `${Math.min(topSource.percentage, 100)}%` }}
          />
        </div>
        <p className="text-sm text-slate-200">Found on <strong>{topSource.presence.toFixed(1)}%</strong> of surveys, averaging <strong>{topSource.avgPer100m.toFixed(1)}</strong> per 100m with <strong>{topSource.count.toLocaleString()}</strong> items recorded in total.</p>
      </div>
    </div>
  )
}
