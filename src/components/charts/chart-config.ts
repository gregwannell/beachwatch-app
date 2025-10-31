import type { ChartConfig } from "@/components/ui/chart"

// MCS brand colors from globals.css
// These colors align with Marine Conservation Society branding
export const chartColors = {
  primary: "var(--mcs-clear-blue)",
  secondary: "var(--mcs-orange)",
  tertiary: "var(--mcs-teal)",
  quaternary: "var(--mcs-purple)",
  quinary: "var(--mcs-red)",
} as const

// Pattern definitions for additional accessibility
export const chartPatterns = {
  dots: "url(#dots)",
  stripes: "url(#stripes)", 
  diagonals: "url(#diagonals)",
  crosshatch: "url(#crosshatch)",
  solid: "none"
} as const

// Default chart configuration for consistent theming
export const defaultChartConfig: ChartConfig = {
  value: {
    label: "Value",
  },
  item1: {
    label: "Item 1",
    color: chartColors.primary,
  },
  item2: {
    label: "Item 2", 
    color: chartColors.secondary,
  },
  item3: {
    label: "Item 3",
    color: chartColors.tertiary,
  },
  item4: {
    label: "Item 4",
    color: chartColors.quaternary,
  },
  item5: {
    label: "Item 5",
    color: chartColors.quinary,
  },
}

// Utility function to create chart config from data
export function createChartConfig(items: string[]): ChartConfig {
  const colors = Object.values(chartColors)
  const config: ChartConfig = {}
  
  items.forEach((item, index) => {
    config[item] = {
      label: item,
      color: colors[index % colors.length],
    }
  })
  
  return config
}