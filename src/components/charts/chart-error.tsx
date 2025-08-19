"use client"

import * as React from "react"
import { AlertCircle, RefreshCw } from "lucide-react"
import { cn } from "@/lib/utils"

interface ChartErrorProps {
  className?: string
  height?: number
  error?: string
  onRetry?: () => void
  type?: 'bar' | 'pie'
}

export function ChartError({ 
  className, 
  height = 300, 
  error = "Failed to load chart data",
  onRetry,
  type = 'bar'
}: ChartErrorProps) {
  return (
    <div 
      className={cn(
        "flex flex-col items-center justify-center border-2 border-dashed border-muted rounded-lg bg-muted/20",
        className
      )}
      style={{ height }}
      role="alert"
      aria-live="polite"
    >
      <AlertCircle className="h-8 w-8 text-muted-foreground mb-3" />
      <h3 className="font-medium text-foreground mb-2">
        Unable to display {type} chart
      </h3>
      <p className="text-sm text-muted-foreground mb-4 text-center max-w-sm">
        {error}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
          aria-label="Retry loading chart data"
        >
          <RefreshCw className="h-4 w-4" />
          Retry
        </button>
      )}
    </div>
  )
}

export function ChartEmptyState({ 
  className, 
  height = 300, 
  message = "No data available",
  type = 'bar'
}: Omit<ChartErrorProps, 'error' | 'onRetry'> & { message?: string }) {
  return (
    <div 
      className={cn(
        "flex flex-col items-center justify-center border-2 border-dashed border-muted rounded-lg bg-muted/10",
        className
      )}
      style={{ height }}
      role="status"
      aria-label={`Empty ${type} chart: ${message}`}
    >
      <div className="h-8 w-8 text-muted-foreground mb-3">
        {type === 'bar' ? (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
            <rect x="7" y="8" width="3" height="8"/>
            <rect x="14" y="6" width="3" height="10"/>
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/>
            <path d="M12 2 A10 10 0 0 1 12 22 A10 10 0 0 1 12 2"/>
          </svg>
        )}
      </div>
      <h3 className="font-medium text-foreground mb-2">
        No {type === 'bar' ? 'items' : 'data'} to display
      </h3>
      <p className="text-sm text-muted-foreground text-center max-w-sm">
        {message}
      </p>
    </div>
  )
}