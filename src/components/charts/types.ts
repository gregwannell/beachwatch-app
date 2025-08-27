export interface ChartDataItem {
  name: string
  value: number
  percentage?: number
}

export interface BarChartData extends ChartDataItem {
  category: string
  fill?: string // Optional color for individual bars
}

export interface PieChartData extends ChartDataItem {
  fill: string
}


export interface ChartProps {
  data: ChartDataItem[]
  className?: string
  height?: number
  showPercentage?: boolean
  showCount?: boolean
  loading?: boolean
  error?: string
  onRetry?: () => void
}

export interface BarChartProps extends ChartProps {
  data: BarChartData[]
  maxItems?: number
  barThickness?: number // Controls the thickness/height of individual bars
}


export type ChartDisplayMode = 'count' | 'percentage' | 'both'