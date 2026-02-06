import { Recycle } from "lucide-react"
import type { RegionData } from '@/types/region-types'

interface TopLitterTypeCardProps {
  plasticPolystyreneComparison: NonNullable<RegionData['litterData']>['plasticPolystyreneComparison']
}

export function TopLitterTypeCard({ plasticPolystyreneComparison }: TopLitterTypeCardProps) {
  if (!plasticPolystyreneComparison) return null

  const { regionalShare } = plasticPolystyreneComparison
  const targetPercent = 50

  return (
    <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-6 rounded-2xl shadow-xl text-white relative overflow-hidden min-h-[200px] flex flex-col">
      {/* Background watermark icon */}
      <div className="absolute -bottom-6 -right-6 opacity-10">
        <Recycle className="w-32 h-32" />
      </div>

      <div className="relative z-10 flex flex-col h-full">
        <div className="flex items-center gap-2 text-mcs-teal font-bold mb-3">
          <Recycle className="w-4 h-4" />
          <span className="text-xs uppercase tracking-widest">Top Litter Type</span>
        </div>

        <h3 className="text-xl font-bold mb-2 leading-tight">Plastic &amp; Polystyrene</h3>
        <p className="text-slate-400 text-sm mb-4 flex-1">
          Consistently makes up {Math.round(regionalShare)}%+ of items found. Focus on source reduction required.
        </p>

        <div className="mt-auto">
          <div className="w-full bg-white/10 rounded-full h-2.5 mb-1.5">
            <div
              className="bg-mcs-teal h-2.5 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(regionalShare, 100)}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            <span>Target: {targetPercent}%</span>
            <span>Current: {Math.round(regionalShare)}%</span>
          </div>
        </div>
      </div>
    </div>
  )
}
