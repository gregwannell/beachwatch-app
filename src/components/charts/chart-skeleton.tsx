"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface ChartSkeletonProps {
  className?: string
  height?: number
  type: 'bar' | 'pie'
}

export function ChartSkeleton({ className, height = 300, type }: ChartSkeletonProps) {
  return (
    <div 
      className={cn("w-full animate-pulse", className)}
      style={{ height }}
      role="status"
      aria-label="Loading chart data"
    >
      {type === 'bar' ? <BarChartSkeleton /> : <PieChartSkeleton />}
    </div>
  )
}

function BarChartSkeleton() {
  return (
    <div className="flex items-end justify-between h-full p-4 space-x-2">
      {Array.from({ length: 5 }).map((_, index) => (
        <div key={index} className="flex-1 space-y-2">
          <div 
            className="bg-muted rounded w-full"
            style={{ 
              height: `${60 + Math.random() * 40}%`,
              animationDelay: `${index * 100}ms`
            }}
          />
          <div className="bg-muted rounded h-3 w-full" />
        </div>
      ))}
    </div>
  )
}

function PieChartSkeleton() {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="relative">
        {/* Outer circle */}
        <div className="w-40 h-40 rounded-full bg-muted animate-pulse" />
        {/* Inner circle (donut hole) */}
        <div className="absolute inset-8 rounded-full bg-background" />
        {/* Legend skeleton */}
        <div className="mt-6 space-y-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-muted" />
              <div className="bg-muted rounded h-3 w-16" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}