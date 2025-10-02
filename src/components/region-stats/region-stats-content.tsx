"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { InteractivePieChart, DonutPieChart, TopLitterItemsChart } from "@/components/charts"
import { chartColors } from "@/components/charts/chart-config"
import { Info, ExternalLink, PieChart, Users, AlertTriangle } from "lucide-react"
import { motion } from "motion/react"
import type { RegionData, SuggestedRegion } from '@/types/region-types'

// Import extracted components
import { AverageLitterKpiCard } from './average-litter-kpi-card'
import { LitterCollectionStats } from './litter-collection-stats'
import { EmptyState } from './empty-state'
import { EngagementStats } from './engagement-stats'
import { LoadingSkeleton } from './loading-skeleton'

interface RegionStatsContentProps {
  regionData?: RegionData
  isLoading?: boolean
  onRegionSelect?: (regionId: string) => void
  selectedYear?: number
}


function OverviewTab({ regionData, selectedYear }: { regionData: RegionData; selectedYear?: number }) {
  return (
    <div className="space-y-6">
      {/* Primary KPI Card - Main focal point */}
      {regionData.litterData && (
        <AverageLitterKpiCard regionData={regionData} selectedYear={selectedYear} />
      )}

      {/* Collection Stats - Compact summary */}
      {regionData.litterData && (
        <LitterCollectionStats litterData={regionData.litterData} />
      )}

      {/* Key Insights */}
      {regionData.hasData && regionData.litterData && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground">Key Insights</h3>
          <div className="grid gap-3">
            {regionData.litterData.topLitterItems && regionData.litterData.topLitterItems.length > 0 && (
              <div className="p-4 rounded-lg border bg-card">
                <div className="flex items-center space-x-2 mb-2">
                  <Info className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium">Top Litter Item</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  <strong>{regionData.litterData.topLitterItems[0].item.name}</strong> is the most common item
                  ({regionData.litterData.topLitterItems[0].avgPer100m.toFixed(1)} per 100m)
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function LitterStatsTab({ regionData }: { regionData: RegionData }) {
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
        <section className="space-y-3">
          <TopLitterItemsChart
            data={regionData.litterData.topLitterItems}
            title="Top Litter Items"
            description="Most common litter items by average per 100m"
            height={220}
            maxItems={5}
            showAvgPer100m={true}
            className="w-full"
            barThickness={30}
          />
        </section>
      )}

      {/* Litter Breakdown - Material and Source Tabs */}
      {(regionData.litterData.materialBreakdown.length > 0 || regionData.litterData.sourceBreakdown.length > 0) && (
        <section className="space-y-3">
          <div className="space-y-1">
            <h3 className="text-sm font-medium text-muted-foreground">
              Litter Breakdown
            </h3>
            <p className="text-xs text-muted-foreground">
              Breakdown by material type and source
            </p>
          </div>

          <Tabs defaultValue="material" className="w-full">
            <TabsList>
              <TabsTrigger value="material">By Material</TabsTrigger>
              <TabsTrigger value="source">By Source</TabsTrigger>
            </TabsList>

            <TabsContent value="material" className="mt-4">
              {regionData.litterData.materialBreakdown.length > 0 ? (
                <DonutPieChart
                  data={regionData.litterData.materialBreakdown.map((item, index) => ({
                    name: item.material,
                    value: item.avgPer100m,
                    percentage: item.percentage,
                    fill: Object.values(chartColors)[index % Object.values(chartColors).length],
                    yearOverYearChange: item.yearOverYearChange
                  }))}
                  title="Material Breakdown"
                  description="Breakdown by material type"
                  height={250}
                  centerLabel="Avg/100m"
                  className="w-full"
                />
              ) : (
                <div className="text-sm text-muted-foreground text-center py-8">
                  No material breakdown data available
                </div>
              )}
            </TabsContent>

            <TabsContent value="source" className="mt-4">
              {regionData.litterData.sourceBreakdown.length > 0 ? (
                <DonutPieChart
                  data={regionData.litterData.sourceBreakdown.map((item, index) => ({
                    name: item.source,
                    value: item.avgPer100m,
                    percentage: item.percentage,
                    fill: Object.values(chartColors)[index % Object.values(chartColors).length],
                    yearOverYearChange: item.yearOverYearChange
                  }))}
                  title="Source Breakdown"
                  description="Breakdown by source type"
                  height={250}
                  centerLabel="Avg/100m"
                  className="w-full"
                />
              ) : (
                <div className="text-sm text-muted-foreground text-center py-8">
                  No source breakdown data available
                </div>
              )}
            </TabsContent>
          </Tabs>
        </section>
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

function EngagementTab({ regionData }: { regionData: RegionData }) {
  if (!regionData.hasData || !regionData.engagementData) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
          <Users className="w-6 h-6 text-muted-foreground" />
        </div>
        <div className="space-y-2">
          <h4 className="text-base font-semibold">No Engagement Data Available</h4>
          <p className="text-muted-foreground text-sm">
            Community engagement statistics are not available for this region.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => window.open('https://www.mcsuk.org/what-you-can-do/join-a-beach-clean/', '_blank')}
        >
          <ExternalLink className="w-4 h-4 mr-2" />
          Get Involved
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <EngagementStats engagementData={regionData.engagementData} />

      {/* Call to Action */}
      <div className="p-4 rounded-lg border bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950/20 dark:to-blue-950/20">
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Join the Community</h4>
          <p className="text-sm text-muted-foreground">
            Help expand beach litter data by participating in local surveys and beach clean events.
          </p>
          <Button
            variant="outline"
            size="sm"
            className="mt-2"
            onClick={() => window.open('https://www.mcsuk.org/what-you-can-do/join-a-beach-clean/', '_blank')}
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Contribute Data
          </Button>
        </div>
      </div>
    </div>
  )
}

export function RegionStatsContent({
  regionData,
  isLoading = false,
  onRegionSelect,
  selectedYear,
}: RegionStatsContentProps) {
  if (isLoading) {
    return <LoadingSkeleton />
  }

  if (!regionData) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center p-6">
        <div className="text-muted-foreground">No region selected</div>
        <div className="text-sm text-muted-foreground mt-1">
          Click on a region in the map to view details
        </div>
      </div>
    )
  }

  // Show empty state if no data is available
  if (!regionData.hasData) {
    return (
      <div className="p-6">
        <div className="space-y-2 mb-6">
          <h2 className="text-lg font-semibold truncate">{regionData.name}</h2>
          <Badge variant="secondary" className="text-xs w-fit">
            No Data
          </Badge>
        </div>
        <EmptyState
          regionName={regionData.name}
          suggestedRegions={regionData.suggestedRegions}
          onRegionSelect={onRegionSelect}
        />
      </div>
    )
  }

  return (
    <div className="space-y-4 p-6">
      {/* Header with region name and status badge */}
      <div className="space-y-2">
        <div className="flex items-baseline gap-2">
          <h2 className="text-lg font-semibold truncate">{regionData.name}</h2>
          {selectedYear && (
            <span className="text-sm text-muted-foreground font-normal">
              {selectedYear}
            </span>
          )}
        </div>
        <Badge variant={regionData.hasData ? "default" : "secondary"} className="text-xs w-fit">
          {regionData.hasData ? "Data Available" : "No Data"}
        </Badge>
      </div>

      {/* Low survey count warning */}
      {regionData.hasData && regionData.engagementData && regionData.engagementData.surveyCount < 5 && (
        <motion.div
          initial={{ opacity: 0, y: -10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          <Alert className="border-orange-500/50 bg-orange-50 dark:bg-orange-950/20 border-2 p-4">
            <AlertTriangle className="h-5 w-5 text-orange-600" />
            <AlertDescription>
              <div className="space-y-2">
                <p className="font-medium">Limited Survey Data</p>
                <p className="text-sm text-muted-foreground">
                  This region has fewer than 5 surveys. Statistics should be interpreted with caution as they may not be representative.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={() => window.open('https://www.mcsuk.org/what-you-can-do/join-a-beach-clean/', '_blank')}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Contribute Data
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        </motion.div>
      )}

      {/* Tabbed Interface */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview" className="text-sm">
            Overview
          </TabsTrigger>
          <TabsTrigger value="litter" className="text-sm">
            Litter Stats
          </TabsTrigger>
          <TabsTrigger value="engagement" className="text-sm">
            Engagement
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4 mt-6">
          <OverviewTab regionData={regionData} selectedYear={selectedYear} />
        </TabsContent>

        <TabsContent value="litter" className="space-y-4 mt-6">
          <LitterStatsTab regionData={regionData} />
        </TabsContent>

        <TabsContent value="engagement" className="space-y-4 mt-6">
          <EngagementTab regionData={regionData} />
        </TabsContent>
      </Tabs>
    </div>
  )
}