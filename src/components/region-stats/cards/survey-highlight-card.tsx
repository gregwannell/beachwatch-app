"use client"

import { ExternalLink } from "lucide-react"
import { YearOverYearBadge } from "../components"
import type { RegionData } from '@/types/region-types'

interface SurveyHighlightCardProps {
  engagementData: NonNullable<RegionData['engagementData']>
}

export function SurveyHighlightCard({ engagementData }: SurveyHighlightCardProps) {
  return (
    <div className="bg-card bg-topography rounded-2xl shadow-sm hover:shadow-lg transition-shadow border overflow-hidden">
      <div className="flex items-stretch">
        {/* Left content */}
        <div className="basis-3/5 p-4 flex flex-col justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mt-1">
              <p className="text-5xl font-bold tabular-nums">
                {engagementData.surveyCount.toLocaleString()}
                <span className="text-xs font-medium ml-1">surveys</span>
              </p>
              <YearOverYearBadge change={engagementData.yearOverYearChanges?.surveys} />
            </div>
          </div>
          <p className="text-xs leading-relaxed">
            Our volunteers are making a measurable difference to the UK coastline. You can help too by signing up to a beach clean near you.
          </p>
          <a
            href="https://www.mcsuk.org/what-you-can-do/join-a-beach-clean/find-a-beach-clean/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-semibold bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors rounded-md px-3 py-1.5 w-fit"
          >
            Join a Clean
            <ExternalLink className="w-3 h-3" />
          </a>
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
