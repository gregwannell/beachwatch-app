import { BarChart3, Users, Ruler } from "lucide-react"
import { formatNumber, formatBeachLength } from "@/lib/format-number"
import { YearOverYearBadge } from "../components"
import type { RegionData } from '@/types/region-types'

interface EngagementStatsProps {
  engagementData: NonNullable<RegionData['engagementData']>
}

export function EngagementStats({ engagementData }: EngagementStatsProps) {
  const metrics = [
    {
      icon: BarChart3,
      label: "Surveys",
      value: formatNumber(engagementData.surveyCount),
      change: engagementData.yearOverYearChanges?.surveys,
      description: `${engagementData.surveyCount} surveys conducted`
    },
    {
      icon: Users,
      label: "Volunteers",
      value: formatNumber(engagementData.volunteerCount),
      change: engagementData.yearOverYearChanges?.volunteers,
      description: `${engagementData.volunteerCount} volunteers participated`
    },
    {
      icon: Ruler,
      label: "Beach Length",
      value: formatBeachLength(engagementData.totalBeachLength),
      change: engagementData.yearOverYearChanges?.beachLength,
      description: `${formatBeachLength(engagementData.totalBeachLength)} of coastline surveyed`
    }
  ]

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium text-muted-foreground">Engagement Statistics</h3>

      <div className="grid grid-cols-1 gap-3">
        {metrics.map((metric) => {
          const Icon = metric.icon
          return (
            <div
              key={metric.label}
              className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-all duration-200 shadow-sm hover:shadow-md"
            >
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0 p-2.5 rounded-lg bg-primary/10 ring-1 ring-primary/20">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-foreground">{metric.label}</span>
                    {metric.change !== undefined && (
                      <YearOverYearBadge change={metric.change} />
                    )}
                  </div>
                  <span className="text-xl font-bold text-foreground">
                    {metric.value}
                  </span>
                  <p className="text-xs text-muted-foreground">
                    {metric.description}
                  </p>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}