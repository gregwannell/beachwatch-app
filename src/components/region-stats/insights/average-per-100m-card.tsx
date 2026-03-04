"use client"

import Image from 'next/image'
import type { RegionData } from '@/types/region-types'
import { calculateHistoricalStats, getRankingText } from '../utils'

interface AveragePer100mCardProps {
  regionData: RegionData
  selectedYear?: number
}

export function AveragePer100mCard({ regionData, selectedYear }: AveragePer100mCardProps) {
  if (!regionData.litterData?.trendData || regionData.litterData.trendData.length === 0) {
    return null
  }

  const stats = calculateHistoricalStats(
    regionData.litterData.trendData,
    regionData.litterData.averageLitterPer100m,
    selectedYear
  )

  if (!stats) return null

  const isGoodPerformance = !stats.isAboveAverage || stats.isBestEver
  const accentClass = isGoodPerformance ? 'text-mcs-teal' : 'text-mcs-red'

  let badgeText: string | null = null
  let badgeClass = ''
  if (stats.isBestEver) {
    badgeText = 'REGIONS BEST YEAR'
    badgeClass = 'bg-mcs-teal/20 text-mcs-teal border border-mcs-teal/30'
  } else if (stats.isWorstEver) {
    badgeText = 'REGIONS WORST YEAR'
    badgeClass = 'bg-mcs-red/20 text-mcs-red border border-mcs-red/30'
  } else if (!stats.isAboveAverage) {
    badgeText = 'BELOW REGION AVERAGE'
    badgeClass = 'bg-mcs-teal/20 text-mcs-teal border border-mcs-teal/30'
  } else if (stats.isAboveAverage) {
    badgeText = 'ABOVE REGION AVERAGE'
    badgeClass = 'bg-mcs-red/20 text-mcs-red border border-mcs-red/30'
  }

  const avgLabel =
    stats.percentDifference === 0
      ? 'matches the average'
      : `${stats.isAboveAverage ? 'above' : 'below'} 10 year average`

  return (
    <div className="bg-gradient-to-br from-mcs-ink to-mcs-navy rounded-2xl border border-white/10 p-6 min-h-[13rem] flex flex-col justify-between relative overflow-hidden">
      <Image
        src="/waves-turquoise.png"
        alt=""
        fill
        className="object-cover"
        style={{ opacity: 0.06 }}
      />

      {/* Top section */}
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-2">
          <p className="text-l font-bold text-white leading-tight">Average items/100m</p>
          {badgeText && (
            <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${badgeClass}`}>
              {badgeText}
            </span>
          )}
        </div>
        <div className="mt-1">
          <span className={`text-5xl font-bold ${accentClass}`}>
            {stats.percentDifference === 0 ? '—' : `${stats.percentDifference}%`} <span className="font-normal text-sm text-slate-200 mt-1">{avgLabel}</span>
          </span>
        </div>
      </div>

      {/* Bottom section */}
      <div className="relative z-10">
        <p className="text-sm text-slate-200">
          {(() => {
            const rankingText = getRankingText(stats)
            if (stats.isBestEver) return <>🏆 {rankingText}</>
            if (stats.isWorstEver) {
              return stats.totalYears > 1
                ? <>⚠️ {rankingText} — Previous low: <strong>{stats.bestYear.value.toFixed(1)}/100m</strong> in <strong>{stats.bestYear.year}</strong></>
                : <>⚠️ {rankingText}</>
            }
            const midpoint = Math.ceil(stats.totalYears / 2)
            const isInBetterHalf = stats.ranking <= midpoint
            return isInBetterHalf
              ? <>{rankingText}. The lowest recorded over this period was <strong>{stats.bestYear.value.toFixed(1)}/100m</strong> in <strong>{stats.bestYear.year}</strong></>
              : <>{rankingText}. The highest recorded over this period was <strong>{stats.worstYear.value.toFixed(1)}/100m</strong> in <strong>{stats.worstYear.year}</strong></>
          })()}
        </p>
      </div>
    </div>
  )
}
