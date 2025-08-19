import { ChartDataItem, BarChartData, PieChartData } from './types'

// Format number for display in charts
export function formatChartValue(value: number, showPercentage: boolean = false): string {
  if (showPercentage) {
    return `${value.toFixed(1)}%`
  }
  return value.toLocaleString()
}

// Calculate percentages for chart data
export function calculatePercentages(data: ChartDataItem[]): ChartDataItem[] {
  const total = data.reduce((sum, item) => sum + item.value, 0)
  
  return data.map(item => ({
    ...item,
    percentage: total > 0 ? (item.value / total) * 100 : 0
  }))
}

// Sort data for bar charts (top N items)
export function sortTopItems(data: BarChartData[], maxItems: number = 5): BarChartData[] {
  return data
    .sort((a, b) => b.value - a.value)
    .slice(0, maxItems)
}

// Transform data for pie charts with colors
export function preparePieChartData(data: ChartDataItem[], colors: string[]): PieChartData[] {
  return data.map((item, index) => ({
    ...item,
    fill: colors[index % colors.length]
  }))
}

// Format tooltip labels
export function formatTooltipLabel(label: string, value: number, percentage?: number): string {
  if (percentage !== undefined) {
    return `${label}: ${formatChartValue(value)} (${formatChartValue(percentage, true)})`
  }
  return `${label}: ${formatChartValue(value)}`
}