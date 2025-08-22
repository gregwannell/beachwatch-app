import type { ChartConfig } from "@/components/ui/chart"

// Modern, vibrant color palette inspired by shadcn charts
// These colors are designed to be visually appealing and distinguishable
export const chartColors = {
  primary: "hsl(221, 83%, 53%)",    // Bright blue like the reference
  secondary: "hsl(212, 95%, 68%)",  // Light blue
  tertiary: "hsl(262, 83%, 58%)",   // Purple
  quaternary: "hsl(142, 76%, 36%)", // Green
  quinary: "hsl(346, 87%, 43%)",    // Red/pink
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