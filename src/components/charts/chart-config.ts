import type { ChartConfig } from "@/components/ui/chart"

// Colorblind-safe color palette using existing CSS variables
// These colors are designed to be distinguishable for all types of color vision
export const chartColors = {
  primary: "hsl(var(--chart-1))",    // Orange-ish - distinct for deuteranopia/protanopia
  secondary: "hsl(var(--chart-2))",  // Blue - safe for all types
  tertiary: "hsl(var(--chart-3))",   // Purple/violet - good contrast
  quaternary: "hsl(var(--chart-4))", // Green-yellow - distinguishable 
  quinary: "hsl(var(--chart-5))",    // Red-orange - colorblind safe
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