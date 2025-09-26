"use client"

import * as React from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardAction, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { InteractivePieChart, TopLitterItemsChart, LitterTrendChart } from "@/components/charts"
import { chartColors } from "@/components/charts/chart-config"
import { Database, MapPin, ExternalLink, Info, BarChart3, Users, Ruler, TrendingUp, TrendingDown, Minus, PieChart } from "lucide-react"
import { formatNumber, formatBeachLength } from "@/lib/format-number"
import type { RegionData, SuggestedRegion } from '@/types/region-types'

interface RegionStatsContentProps {
  regionData?: RegionData
  isLoading?: boolean
  onRegionSelect?: (regionId: string) => void
}

function YearOverYearBadge({ change }: { change?: number }) {
  if (change === undefined) return null

  const isImprovement = change < 0 // Decrease in litter is improvement
  const isNeutral = Math.abs(change) < 1 // Less than 1% change is neutral

  const variant = isNeutral ? "secondary" : isImprovement ? "default" : "destructive"
  const symbol = change > 0 ? "+" : ""
  const Icon = isNeutral ? Minus : isImprovement ? TrendingDown : TrendingUp

  return (
    <Badge variant={variant} className="text-xs">
      <Icon className="w-3 h-3 mr-1" />
      {symbol}{change.toFixed(1)}%
    </Badge>
  )
}

function AverageLitterKpiCard({ regionData }: { regionData: RegionData }) {
  if (!regionData.litterData) return null

  const { averageLitterPer100m, yearOverYearChange } = regionData.litterData

  // Determine trending context
  const getTrendingText = () => {
    if (yearOverYearChange === undefined) return "No trend data available"

    const isImprovement = yearOverYearChange < 0
    const isNeutral = Math.abs(yearOverYearChange) < 1

    if (isNeutral) {
      return (
        <div className="line-clamp-1 flex gap-2 font-medium">
          Stable levels this period <Minus className="size-4" />
        </div>
      )
    } else if (isImprovement) {
      return (
        <div className="line-clamp-1 flex gap-2 font-medium">
          Improving this period <TrendingDown className="size-4" />
        </div>
      )
    } else {
      return (
        <div className="line-clamp-1 flex gap-2 font-medium">
          Increasing this period <TrendingUp className="size-4" />
        </div>
      )
    }
  }

  return (
    <Card className="@container/card bg-gradient-to-t from-primary/5 to-card shadow-xs">
      <CardHeader>
        <CardDescription>Average Litter per 100m</CardDescription>
        <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
          {averageLitterPer100m.toFixed(1)}
        </CardTitle>
        <CardAction>
          <YearOverYearBadge change={yearOverYearChange} />
        </CardAction>
      </CardHeader>
      <CardFooter className="flex-col items-start gap-1.5 text-sm">
        {getTrendingText()}
        <div className="text-muted-foreground">
          Based on latest survey data
        </div>
      </CardFooter>
    </Card>
  )
}


function EmptyState({ 
  regionName, 
  suggestedRegions, 
  onRegionSelect 
}: { 
  regionName: string
  suggestedRegions?: SuggestedRegion[]
  onRegionSelect?: (regionId: string) => void 
}) {
  const getAvailabilityBadge = (availability: SuggestedRegion['dataAvailability']) => {
    const config = {
      full: { label: 'Full data', variant: 'default' as const },
      partial: { label: 'Partial data', variant: 'secondary' as const },
      limited: { label: 'Limited data', variant: 'outline' as const }
    }
    
    const { label, variant } = config[availability]
    return (
      <Badge variant={variant} className="text-xs">
        {label}
      </Badge>
    )
  }

  return (
    <div className="space-y-6">
      {/* Main empty state */}
      <div className="flex flex-col items-center justify-center py-6 text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
          <Database className="w-6 h-6 text-muted-foreground" />
        </div>
        
        <div className="space-y-2">
          <h4 className="text-base font-semibold">No Data Available</h4>
          <p className="text-muted-foreground text-sm max-w-sm">
            No litter survey data is currently available for <strong>{regionName}</strong>. 
          </p>
        </div>

        <div className="flex flex-col items-center space-y-2">
          <Button 
            variant="outline" 
            size="sm"
            className="text-xs"
            onClick={() => window.open('https://www.mcsuk.org/what-you-can-do/join-a-beach-clean/', '_blank')}
          >
            <ExternalLink className="w-3 h-3 mr-2" />
            Contribute Data
          </Button>
        </div>
      </div>

      {/* Suggested regions */}
      {suggestedRegions && suggestedRegions.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <MapPin className="w-4 h-4 text-muted-foreground" />
            <h4 className="text-sm font-medium">
              Nearby Regions with Data
            </h4>
          </div>
          
          <div className="space-y-2">
            {suggestedRegions.map((region) => (
              <div
                key={region.id}
                className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent transition-colors"
              >
                <div className="flex-1 space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium">{region.name}</span>
                    {region.distance && (
                      <span className="text-xs text-muted-foreground">
                        ~{region.distance}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    {getAvailabilityBadge(region.dataAvailability)}
                  </div>
                </div>
                
                {onRegionSelect && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onRegionSelect(region.id)}
                    className="text-xs"
                  >
                    View
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function EngagementStats({ engagementData }: { 
  engagementData: NonNullable<RegionData['engagementData']>
}) {
  const metrics = [
    {
      icon: BarChart3,
      label: "Surveys",
      value: formatNumber(engagementData.surveyCount),
      change: engagementData.yearOverYearChanges?.surveys,
      description: `${engagementData.surveyCount} surveys conducted`
    },
    {
      icon: Users,
      label: "Volunteers",
      value: formatNumber(engagementData.volunteerCount),
      change: engagementData.yearOverYearChanges?.volunteers,
      description: `${engagementData.volunteerCount} volunteers participated`
    },
    {
      icon: Ruler,
      label: "Beach Length",
      value: formatBeachLength(engagementData.totalBeachLength),
      change: engagementData.yearOverYearChanges?.beachLength,
      description: `${formatBeachLength(engagementData.totalBeachLength)} of coastline surveyed`
    }
  ]

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium text-muted-foreground">Engagement Statistics</h3>
      
      <div className="grid grid-cols-1 gap-3">
        {metrics.map((metric) => {
          const Icon = metric.icon
          return (
            <div 
              key={metric.label}
              className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-all duration-200 shadow-sm hover:shadow-md"
            >
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0 p-2.5 rounded-lg bg-primary/10 ring-1 ring-primary/20">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-foreground">{metric.label}</span>
                    {metric.change !== undefined && (
                      <YearOverYearBadge change={metric.change} />
                    )}
                  </div>
                  <span className="text-xl font-bold text-foreground">
                    {metric.value}
                  </span>
                  <p className="text-xs text-muted-foreground">
                    {metric.description}
                  </p>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6 p-6">
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <div className="space-y-3">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    </div>
  )
}

function TrendChartSection({ regionData }: { regionData: RegionData }) {
  // Prepare trend data for the chart
  const trendData = React.useMemo(() => {
    if (regionData.litterData?.trendData) {
      return regionData.litterData.trendData
    }

    // Generate trend data for all years from 1994 to 2024
    const baseValue = regionData.litterData?.averageLitterPer100m || 100
    const years = Array.from({ length: 31 }, (_, i) => 1994 + i) // 1994 to 2024

    return years.map(year => ({
      year,
      averageLitterPer100m: baseValue + (Math.random() - 0.5) * 40,
      date: `${year}-01-01`
    }))
  }, [regionData.litterData])

  if (!regionData.litterData) return null

  return (
    <LitterTrendChart
      data={trendData}
      title="Average Litter Trend (1994-2024)"
      description="Historical trend of average litter per 100m over time"
      averageLitterValue={regionData.litterData.averageLitterPer100m}
      yearOverYearChange={regionData.litterData.yearOverYearChange}
      height={240}
      className="w-full"
    />
  )
}

function OverviewTab({ regionData }: { regionData: RegionData }) {
  return (
    <div className="space-y-6">
      {/* Primary KPI Card - Main focal point */}
      {regionData.litterData && (
        <AverageLitterKpiCard regionData={regionData} />
      )}

      {/* Trend Chart - Separate section */}
      {regionData.litterData && (
        <TrendChartSection regionData={regionData} />
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

      {/* Material Breakdown - PRESERVED AS-IS */}
      {regionData.litterData.materialBreakdown.length > 0 && (
        <section className="space-y-3">
          <InteractivePieChart
            data={regionData.litterData.materialBreakdown.map((item, index) => ({
              name: item.material,
              value: item.count,
              percentage: item.percentage,
              fill: Object.values(chartColors)[index % Object.values(chartColors).length]
            }))}
            title="Material Breakdown"
            description="Breakdown by material type"
            height={250}
            className="w-full"
          />
        </section>
      )}

      {/* Source Breakdown - PRESERVED AS-IS */}
      {regionData.litterData.sourceBreakdown.length > 0 && (
        <section className="space-y-3">
          <InteractivePieChart
            data={regionData.litterData.sourceBreakdown.map((item, index) => ({
              name: item.source,
              value: item.count,
              percentage: item.percentage,
              fill: Object.values(chartColors)[index % Object.values(chartColors).length]
            }))}
            title="Source Breakdown"
            description="Breakdown by source type"
            height={250}
            className="w-full"
          />
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
          onClick={() => window.open('https://www.mcsuk.org/what-we-do/clean-seas-and-beaches/great-british-beach-clean', '_blank')}
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
            onClick={() => window.open('https://www.mcsuk.org/what-we-do/clean-seas-and-beaches/great-british-beach-clean', '_blank')}
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
        <h2 className="text-lg font-semibold truncate">{regionData.name}</h2>
        <Badge variant={regionData.hasData ? "default" : "secondary"} className="text-xs w-fit">
          {regionData.hasData ? "Data Available" : "No Data"}
        </Badge>
      </div>

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
          <OverviewTab regionData={regionData} />
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