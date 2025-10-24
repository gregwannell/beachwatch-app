import { Alert, AlertDescription } from "@/components/ui/alert"
import { TopLitterItemsChart, LitterBreakdownChart } from "@/components/charts"
import { Info, PieChart } from "lucide-react"
import type { RegionData } from '@/types/region-types'

interface LitterStatsTabProps {
  regionData: RegionData
}

export function LitterStatsTab({ regionData }: LitterStatsTabProps) {
  if (!regionData.hasData || !regionData.litterData) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
          <PieChart className="w-6 h-6 text-muted-foreground" />
        </div>
        <div className="space-y-2">
          <h4 className="text-base font-semibold">No Litter Data Available</h4>
          <p className="text-muted-foreground text-sm">
            Litter statistics are not available for this region.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Top Litter Items */}
      {regionData.litterData.topLitterItems && regionData.litterData.topLitterItems.length > 0 && (
        <TopLitterItemsChart
          data={regionData.litterData.topLitterItems}
          height={220}
          maxItems={5}
          showAvgPer100m={true}
          className="w-full"
          barThickness={30}
        />
      )}

      {/* Litter Breakdown - Material and Source Tabs */}
      {(regionData.litterData.materialBreakdown.length > 0 || regionData.litterData.sourceBreakdown.length > 0) && (
        <LitterBreakdownChart
          materialBreakdown={regionData.litterData.materialBreakdown}
          sourceBreakdown={regionData.litterData.sourceBreakdown}
          height={250}
          className="w-full"
        />
      )}

      {/* Partial data notification */}
      {(!regionData.litterData.topItems.length &&
        !regionData.litterData.materialBreakdown.length &&
        !regionData.litterData.sourceBreakdown.length) && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            <div>
              <p className="font-medium">Limited Data Available</p>
              <p className="text-sm text-muted-foreground mt-1">
                Some metrics are available but detailed breakdowns are not yet processed.
              </p>
            </div>
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}
