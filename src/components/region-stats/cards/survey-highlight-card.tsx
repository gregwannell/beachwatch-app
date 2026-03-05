"use client"

import { ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { YearOverYearBadge } from "../components"

import type { RegionData } from '@/types/region-types'

function SurveyYoYText({ change }: { change?: number }) {
  if (change === undefined || Math.abs(change) < 1) return null
  return change > 0
    ? <>, a <strong className="text-mcs-green">{change.toFixed(1)}% increase</strong> compared to last year</>
    : <>, a <strong className="text-mcs-red">{Math.abs(change).toFixed(1)}% decrease</strong> compared to last year</>
}

interface SurveyHighlightCardProps {
  engagementData: NonNullable<RegionData['engagementData']>
  selectedYear?: number
}

export function SurveyHighlightCard({ engagementData, selectedYear }: SurveyHighlightCardProps) {
  return (
    <div className="bg-card bg-topography rounded-2xl shadow-sm hover:shadow-lg transition-shadow border overflow-hidden">
      <div className="flex items-stretch">
        {/* Left content */}
        <div className="basis-3/5 p-4 flex flex-col justify-between gap-3">
          <div className="flex items-baseline gap-2 mt-1">
            <p className="text-4xl font-bold tabular-nums">
              {engagementData.volunteerCount.toLocaleString()}
              <span className="text-xs font-medium ml-1">volunteers</span>
            </p>
            <YearOverYearBadge change={engagementData.yearOverYearChanges?.volunteers} increaseIsGood />
          </div>
          <p className="text-xs leading-relaxed">
            participated in <strong className="text-sm">{engagementData.surveyCount.toLocaleString()}</strong> surveys{selectedYear ? ` in ${selectedYear}` : ''}<SurveyYoYText change={engagementData.yearOverYearChanges?.surveys} />. Help expand beach litter data by joining a local clean.
          </p>
          <Button variant="cta" size="sm" className="h-auto py-1.5 text-xs w-fit" asChild>
            <a
              href="https://www.mcsuk.org/what-you-can-do/join-a-beach-clean/find-a-beach-clean/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Join a Clean
              <ExternalLink className="w-4 h-4" />
            </a>
          </Button>
        </div>

        {/* Right image */}
        <div className="basis-2/5">
          <img
            src="/mcs-survey-form.jpg"
            alt="MCS volunteer holding a beach survey form"
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    </div>
  )
}
