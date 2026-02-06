'use client'

import { useEffect, useState, useRef } from 'react'
import { Progress } from '@/components/ui/progress'

interface MapLoadingOverlayProps {
  /** When true, the data has finished loading — progress jumps to 100% and overlay fades out */
  isComplete?: boolean
  /** Optional className for the outer container */
  className?: string
}

export function MapLoadingOverlay({ isComplete = false, className }: MapLoadingOverlayProps) {
  const [progress, setProgress] = useState(0)
  const [visible, setVisible] = useState(true)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (isComplete) {
      // Jump to 100% then fade out
      if (intervalRef.current) clearInterval(intervalRef.current)
      setProgress(100)
      const timeout = setTimeout(() => setVisible(false), 400)
      return () => clearTimeout(timeout)
    }

    // Simulated progress: fast to 60%, then slow crawl toward 90%
    intervalRef.current = setInterval(() => {
      setProgress(prev => {
        if (prev < 60) return prev + 4
        if (prev < 85) return prev + 0.5
        if (prev < 92) return prev + 0.1
        return prev
      })
    }, 100)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [isComplete])

  if (!visible) return null

  const displayPercent = Math.round(progress)

  return (
    <div
      className={`absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-[9999] transition-opacity duration-300 ${
        progress === 100 ? 'opacity-0' : 'opacity-100'
      } ${className ?? ''}`}
    >
      <div className="w-56 space-y-3 text-center">
        <p className="text-sm font-medium text-foreground">Loading map data</p>
        <Progress value={progress} className="h-2.5" />
        <p className="text-xs text-muted-foreground tabular-nums">{displayPercent}%</p>
      </div>
    </div>
  )
}
