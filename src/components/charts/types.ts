export interface ChartDataItem {
  name: string
  value: number
  percentage?: number
}

export interface BarChartData extends ChartDataItem {
  category: string
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
}


export type ChartDisplayMode = 'count' | 'percentage' | 'both'