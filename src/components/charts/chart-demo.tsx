"use client"

import { HorizontalBarChart } from "./horizontal-bar-chart"
import { PieChart } from "./pie-chart"
import type { BarChartData, PieChartData } from "./types"

// Sample data for testing
const sampleLitterData: BarChartData[] = [
  { name: "Cigarette butts", value: 245, category: "Smoking" },
  { name: "Plastic bottles", value: 189, category: "Plastic" },
  { name: "Food wrappers", value: 134, category: "Food" },
  { name: "Bottle caps", value: 98, category: "Plastic" },
  { name: "Plastic bags", value: 76, category: "Plastic" },
  { name: "Paper cups", value: 45, category: "Paper" },
]

// Sample data for material breakdown
const materialBreakdownData: PieChartData[] = [
  { name: "Plastic", value: 363 },
  { name: "Smoking", value: 245 },
  { name: "Food", value: 134 },
  { name: "Paper", value: 45 },
  { name: "Glass", value: 32 },
]

// Sample data for source breakdown
const sourceBreakdownData: PieChartData[] = [
  { name: "Pedestrians", value: 425 },
  { name: "Beach visitors", value: 234 },
  { name: "Storm drains", value: 156 },
  { name: "Marine sources", value: 98 },
  { name: "Unknown", value: 87 },
]

export function ChartDemo() {
  const [isLoading, setIsLoading] = React.useState(false)
  const [hasError, setHasError] = React.useState(false)

  const simulateLoading = () => {
    setIsLoading(true)
    setTimeout(() => setIsLoading(false), 2000)
  }

  const simulateError = () => {
    setHasError(true)
    setTimeout(() => setHasError(false), 3000)
  }

  return (
    <div className="p-6 space-y-8">
      <div>
        <h3 className="text-lg font-semibold mb-4">Top 5 Litter Items (Count)</h3>
        <HorizontalBarChart 
          data={sampleLitterData}
          maxItems={5}
          showCount={true}
          showPercentage={false}
        />
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-4">Top 5 Litter Items (Percentage)</h3>
        <HorizontalBarChart 
          data={sampleLitterData}
          maxItems={5}
          showCount={false}
          showPercentage={true}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h3 className="text-lg font-semibold mb-4">Material Breakdown</h3>
          <PieChart 
            data={materialBreakdownData}
            showLegend={true}
            showPercentage={true}
          />
        </div>
        
        <div>
          <h3 className="text-lg font-semibold mb-4">Source Breakdown</h3>
          <PieChart 
            data={sourceBreakdownData}
            showLegend={true}
            showPercentage={true}
          />
        </div>
      </div>

      {/* State demonstration */}
      <div className="border-t pt-8">
        <h2 className="text-xl font-bold mb-4">State Demonstrations</h2>
        
        <div className="flex gap-4 mb-6">
          <button
            onClick={simulateLoading}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Show Loading
          </button>
          <button
            onClick={simulateError}
            className="px-4 py-2 bg-destructive text-destructive-foreground rounded-md hover:bg-destructive/90"
          >
            Show Error
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">Loading/Error States</h3>
            <HorizontalBarChart
              data={sampleLitterData}
              loading={isLoading}
              error={hasError ? "Failed to load litter data from server" : undefined}
              onRetry={() => setHasError(false)}
              maxItems={5}
            />
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Empty State</h3>
            <PieChart
              data={[]}
              showLegend={true}
              showPercentage={true}
            />
          </div>
        </div>
      </div>
    </div>
  )
}