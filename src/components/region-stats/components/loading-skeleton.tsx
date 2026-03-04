import React from "react"
import { Skeleton } from "@/components/ui/skeleton"

export function LoadingSkeleton() {
  return (
    <div className="space-y-0">
      {/* Gradient Hero */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-mcs-clear-blue/60 to-mcs-teal/60" />

        <div className="relative z-10 px-6 pt-10 pb-8 text-center">
          {/* Region name + year */}
          <Skeleton className="h-6 w-48 mx-auto bg-white/20" />
          {/* Breadcrumbs */}
          <Skeleton className="h-3 w-32 mx-auto mt-2 bg-white/15" />
          {/* Divider */}
          <div className="w-16 h-0.5 bg-white/20 mx-auto mt-3 rounded-full" />
          {/* "Average Litter/100m" label */}
          <Skeleton className="h-4 w-36 mx-auto mt-4 bg-white/20" />
          {/* Large number */}
          <Skeleton className="h-14 w-24 mx-auto mt-1 bg-white/25" />
          {/* YoY badge */}
          <Skeleton className="h-5 w-40 mx-auto mt-2 rounded-full bg-white/15" />
          {/* View Trend button */}
          <Skeleton className="h-8 w-28 mx-auto mt-6 rounded-full bg-white/20" />
        </div>

        {/* Curved bottom edge */}
        <div
          className="absolute bottom-0 left-0 right-0 h-12 bg-background"
          style={{ clipPath: "ellipse(60% 100% at 50% 100%)" }}
        />
      </div>

      {/* Tab strip */}
      <div className="px-4 py-2 bg-background">
        <Skeleton className="h-10 w-full rounded-lg" />
      </div>

      {/* Overview tab content */}
      <div className="px-4 py-4 space-y-6">
        {/* Survey Highlight Card */}
        <Skeleton className="h-[120px] w-full rounded-2xl" />

        {/* KPI Cards Grid — 2-col, 2 rows */}
        <div className="grid grid-cols-2 gap-3">
          <Skeleton className="h-[76px] rounded-2xl" />
          <Skeleton className="h-[76px] rounded-2xl" />
          <Skeleton className="h-[76px] rounded-2xl" />
          <Skeleton className="h-[76px] rounded-2xl" />
        </div>

        {/* Key Insights section header */}
        <div className="flex items-center justify-between">
          <Skeleton className="h-7 w-32" />
          <div className="flex gap-2">
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>
        </div>

        {/* Insights carousel card */}
        <Skeleton className="h-40 w-full rounded-2xl" />
      </div>
    </div>
  )
}
