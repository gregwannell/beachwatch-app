"use client"

import * as React from "react"
import { HorizontalBarChart, PieChart } from "./index"
import type { BarChartData, PieChartData } from "./types"

/**
 * Simple test component to verify chart functionality
 * This can be used for manual testing and validation
 */
export function ChartTest() {
  // Test data
  const barData: BarChartData[] = [
    { name: "Test Item 1", value: 100, category: "Category A" },
    { name: "Test Item 2", value: 75, category: "Category B" },
    { name: "Test Item 3", value: 50, category: "Category C" },
  ]

  const pieData: PieChartData[] = [
    { name: "Section A", value: 40 },
    { name: "Section B", value: 30 },
    { name: "Section C", value: 20 },
    { name: "Section D", value: 10 },
  ]

  const [testLoading, setTestLoading] = React.useState(false)
  const [testError, setTestError] = React.useState<string | undefined>()

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold mb-6">Chart Component Tests</h1>
      </div>

      {/* Basic functionality tests */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Basic Functionality</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <h3 className="text-lg font-medium mb-3">Horizontal Bar Chart</h3>
            <HorizontalBarChart
              data={barData}
              maxItems={3}
              height={250}
            />
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-3">Pie Chart</h3>
            <PieChart
              data={pieData}
              height={250}
              showLegend={true}
            />
          </div>
        </div>
      </section>

      {/* State tests */}
      <section>
        <h2 className="text-xl font-semibold mb-4">State Management</h2>
        
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => {
              setTestLoading(true)
              setTimeout(() => setTestLoading(false), 2000)
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Test Loading
          </button>
          
          <button
            onClick={() => {
              setTestError("Test error message")
              setTimeout(() => setTestError(undefined), 3000)
            }}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Test Error
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div>
            <h3 className="text-lg font-medium mb-3">Loading/Error State</h3>
            <HorizontalBarChart
              data={barData}
              loading={testLoading}
              error={testError}
              onRetry={() => setTestError(undefined)}
              height={200}
            />
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-3">Empty State (Bar)</h3>
            <HorizontalBarChart
              data={[]}
              height={200}
            />
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-3">Empty State (Pie)</h3>
            <PieChart
              data={[]}
              height={200}
            />
          </div>
        </div>
      </section>

      {/* Accessibility test info */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Accessibility Features</h2>
        <div className="bg-muted/50 rounded-lg p-4 text-sm space-y-2">
          <p>✓ ARIA labels and descriptions</p>
          <p>✓ Screen reader compatible</p>
          <p>✓ Keyboard navigation support</p>
          <p>✓ Colorblind-safe color palette</p>
          <p>✓ High contrast support</p>
          <p>✓ Reduced motion preferences</p>
        </div>
      </section>
    </div>
  )
}