"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import { InteractivePieChart, TopLitterItemsChart, LitterBreakdownChart } from "@/components/charts"
import { Info, ExternalLink, PieChart, Users, AlertTriangle } from "lucide-react"
import type { RegionData, SuggestedRegion } from '@/types/region-types'

// Import extracted components
import { AverageLitterKpiCard } from './average-litter-kpi-card'
import { LitterCollectionStats } from './litter-collection-stats'
import { EmptyState } from './empty-state'
import { EngagementStats } from './engagement-stats'
import { LoadingSkeleton } from './loading-skeleton'
import { HistoricalContextInsight } from './historical-context-insight'

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
            {/* Historical Context Insight */}
            <HistoricalContextInsight regionData={regionData} selectedYear={selectedYear} />

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

            {regionData.litterData.sourceBreakdown && regionData.litterData.sourceBreakdown.length > 0 && (
              <div className="p-4 rounded-lg border bg-card">
                <div className="flex items-center space-x-2 mb-2">
                  <Info className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium">Top Litter Source</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  <strong>{regionData.litterData.sourceBreakdown[0].source}</strong> is the primary source
                  ({regionData.litterData.sourceBreakdown[0].avgPer100m.toFixed(1)} per 100m, {regionData.litterData.sourceBreakdown[0].percentage.toFixed(1)}% share)
                </p>
              </div>
            )}

            {regionData.litterData.plasticPolystyreneComparison && (
              <div className="p-4 rounded-lg border bg-card">
                <div className="flex items-center space-x-2 mb-2">
                  <Info className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium">Plastic/Polystyrene</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  <strong>{regionData.litterData.plasticPolystyreneComparison.regionalAvgPer100m.toFixed(1)} per 100m</strong> ({regionData.litterData.plasticPolystyreneComparison.regionalShare.toFixed(1)}% of litter).
                  {regionData.litterData.plasticPolystyreneComparison.shareDifference > 0 ? (
                    <> This is <strong>{Math.abs(regionData.litterData.plasticPolystyreneComparison.shareDifference).toFixed(1)}% higher</strong> than the UK average ({regionData.litterData.plasticPolystyreneComparison.ukShare.toFixed(1)}%).</>
                  ) : regionData.litterData.plasticPolystyreneComparison.shareDifference < 0 ? (
                    <> This is <strong>{Math.abs(regionData.litterData.plasticPolystyreneComparison.shareDifference).toFixed(1)}% lower</strong> than the UK average ({regionData.litterData.plasticPolystyreneComparison.ukShare.toFixed(1)}%).</>
                  ) : (
                    <> This matches the UK average ({regionData.litterData.plasticPolystyreneComparison.ukShare.toFixed(1)}%).</>
                  )}
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

  // Generate breadcrumb hierarchy
  const getBreadcrumbHierarchy = () => {
    if (!regionData) return []

    const hierarchy = []

    // Always start with United Kingdom unless we're already at UK level
    if (regionData.name !== 'United Kingdom') {
      hierarchy.push({ level: 'country', name: 'United Kingdom' })
    }

    if (regionData.level === 'region' && regionData.parentName) {
      // For regions: UK > [Country/County] > Region
      hierarchy.push({ level: 'parent', name: regionData.parentName })
      hierarchy.push({ level: 'region', name: regionData.name })
    } else if (regionData.level === 'county') {
      // For counties: UK > [Country if exists] > County
      if (regionData.parentName && regionData.parentName !== 'United Kingdom') {
        hierarchy.push({ level: 'country', name: regionData.parentName })
      }
      hierarchy.push({ level: 'county', name: regionData.name })
    } else if (regionData.level === 'country' || regionData.level === 'Crown Dependency') {
      // For countries: UK > Country
      hierarchy.push({ level: regionData.level, name: regionData.name })
    } else {
      // For UK itself or other levels: just the region name
      hierarchy.push({ level: regionData.level, name: regionData.name })
    }

    return hierarchy
  }

  const breadcrumbHierarchy = getBreadcrumbHierarchy()

  return (
    <div className="space-y-4 px-6 py-2">
      {/* Header with region name and status badge */}
      <div className="space-y-1">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-baseline gap-2">
            <h2 className="text-lg font-semibold truncate">{regionData.name}</h2>
            {selectedYear && (
              <span className="text-sm text-muted-foreground font-normal">
                {selectedYear}
              </span>
            )}
          </div>
          <Badge variant={regionData.hasData ? "default" : "secondary"} className="text-xs w-fit flex-shrink-0">
            {regionData.hasData ? "Data Available" : "No Data"}
          </Badge>
        </div>

        {/* Regional Breadcrumb */}
        {breadcrumbHierarchy.length > 0 && (
          <Breadcrumb>
            <BreadcrumbList>
              {breadcrumbHierarchy.map((item, index) => (
                <div key={index} className="flex items-center ">
                  {index > 0 && <BreadcrumbSeparator />}
                  <BreadcrumbItem>
                    {index === breadcrumbHierarchy.length - 1 ? (
                      <BreadcrumbPage className="font-medium text-xs">
                        {item.name}
                      </BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink className="text-muted-foreground text-xs">
                        {item.name}
                      </BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                </div>
              ))}
            </BreadcrumbList>
          </Breadcrumb>
        )}
      </div>

      {/* Low survey count warning */}
      {regionData.hasData && regionData.engagementData && regionData.engagementData.surveyCount < 5 && (
        <div className="animate-in fade-in slide-in-from-top-2 duration-300">
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
        </div>
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

        <TabsContent value="overview" className="space-y-4 mt-3">
          <OverviewTab regionData={regionData} selectedYear={selectedYear} />
        </TabsContent>

        <TabsContent value="litter" className="space-y-4 mt-3">
          <LitterStatsTab regionData={regionData} />
        </TabsContent>

        <TabsContent value="engagement" className="space-y-4 mt-3">
          <EngagementTab regionData={regionData} />
        </TabsContent>
      </Tabs>
    </div>
  )
}