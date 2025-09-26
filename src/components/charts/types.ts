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

export interface TrendDataPoint {
  year: number
  averageLitterPer100m: number
  date: string
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

export interface TrendChartProps extends Omit<ChartProps, 'data'> {
  data: TrendDataPoint[]
  title?: string
  description?: string
  averageLitterValue?: number // Current average value to display
  yearOverYearChange?: number // Year-over-year change percentage
}


export type ChartDisplayMode = 'count' | 'percentage' | 'both'