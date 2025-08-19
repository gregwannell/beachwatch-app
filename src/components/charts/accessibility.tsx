"use client"

import * as React from "react"

// SVG pattern definitions for colorblind accessibility
export function ChartPatterns() {
  return (
    <svg width="0" height="0" style={{ position: "absolute" }}>
      <defs>
        {/* Dots pattern */}
        <pattern
          id="dots"
          patternUnits="userSpaceOnUse"
          width="8"
          height="8"
          patternTransform="rotate(0)"
        >
          <circle
            cx="4"
            cy="4"
            r="1.5"
            fill="currentColor"
            opacity="0.3"
          />
        </pattern>

        {/* Vertical stripes */}
        <pattern
          id="stripes"
          patternUnits="userSpaceOnUse"
          width="6"
          height="6"
          patternTransform="rotate(90)"
        >
          <rect
            width="3"
            height="6"
            fill="currentColor"
            opacity="0.2"
          />
        </pattern>

        {/* Diagonal stripes */}
        <pattern
          id="diagonals"
          patternUnits="userSpaceOnUse"
          width="8"
          height="8"
          patternTransform="rotate(45)"
        >
          <rect
            width="4"
            height="8"
            fill="currentColor"
            opacity="0.2"
          />
        </pattern>

        {/* Crosshatch pattern */}
        <pattern
          id="crosshatch"
          patternUnits="userSpaceOnUse"
          width="8"
          height="8"
        >
          <path
            d="M0,4 L8,4 M4,0 L4,8"
            stroke="currentColor"
            strokeWidth="1"
            opacity="0.3"
          />
        </pattern>
      </defs>
    </svg>
  )
}

// Hook for managing accessibility preferences
export function useChartAccessibility() {
  const [highContrast, setHighContrast] = React.useState(false)
  const [usePatterns, setUsePatterns] = React.useState(false)
  const [reducedMotion, setReducedMotion] = React.useState(false)

  React.useEffect(() => {
    // Check for user preferences
    const prefersHighContrast = window.matchMedia('(prefers-contrast: high)').matches
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    
    setHighContrast(prefersHighContrast)
    setReducedMotion(prefersReducedMotion)
  }, [])

  return {
    highContrast,
    usePatterns,
    reducedMotion,
    setHighContrast,
    setUsePatterns,
    setReducedMotion,
  }
}

// Generate ARIA label for charts
export function generateChartAriaLabel(
  data: Array<{ name: string; value: number; percentage?: number }>,
  chartType: 'bar' | 'pie'
): string {
  const totalItems = data.length
  const totalValue = data.reduce((sum, item) => sum + item.value, 0)
  
  if (chartType === 'bar') {
    const topItem = data[0]
    return `Bar chart showing ${totalItems} items. Top item is ${topItem.name} with ${topItem.value} items. Total of ${totalValue} items across all categories.`
  } else {
    return `Pie chart showing ${totalItems} categories. Total of ${totalValue} items with breakdown by category.`
  }
}

// Generate description for screen readers
export function generateChartDescription(
  data: Array<{ name: string; value: number; percentage?: number }>,
  showPercentage: boolean = false
): string {
  return data
    .map((item, index) => {
      const value = showPercentage && item.percentage 
        ? `${item.percentage.toFixed(1)}%` 
        : `${item.value} items`
      return `${index + 1}. ${item.name}: ${value}`
    })
    .join('. ')
}