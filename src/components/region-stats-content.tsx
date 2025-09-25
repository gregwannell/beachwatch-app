"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { InteractivePieChart, TopLitterItemsChart } from "@/components/charts"
import { chartColors } from "@/components/charts/chart-config"
import { Database, MapPin, ExternalLink, Info, BarChart3, Users, Ruler, TrendingUp, TrendingDown, Minus, PieChart, Calendar, Clock } from "lucide-react"
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

function EnhancedHeroMetric({ regionData }: { regionData: RegionData }) {
  const [timeRange, setTimeRange] = React.useState("10y")

  // Chart configuration
  const chartConfig = {
    litter: {
      label: "Average Litter",
      color: "var(--primary)",
    },
  } satisfies ChartConfig

  // Generate sample data if no trend data available
  const sampleTrendData = React.useMemo(() => {
    if (regionData.litterData?.trendData) {
      return regionData.litterData.trendData
    }

    // Generate sample trend data for demonstration
    const currentYear = new Date().getFullYear()
    const baseValue = regionData.litterData?.averageLitterPer100m || 100
    const years = Array.from({ length: 15 }, (_, i) => currentYear - 14 + i)

    return years.map(year => ({
      year,
      averageLitterPer100m: baseValue + (Math.random() - 0.5) * 40,
      date: `${year}-01-01`
    }))
  }, [regionData.litterData])

  // Filter data based on selected time range
  const filteredData = React.useMemo(() => {
    const currentYear = new Date().getFullYear()
    let yearsToShow = 15 // All years

    if (timeRange === "10y") {
      yearsToShow = 10
    } else if (timeRange === "5y") {
      yearsToShow = 5
    }

    return sampleTrendData
      .filter(item => item.year >= currentYear - yearsToShow + 1)
      .sort((a, b) => a.year - b.year)
  }, [sampleTrendData, timeRange])

  if (!regionData.litterData) return null

  // Time period options
  const timeOptions = [
    { value: 'all', label: 'All Years', icon: Calendar },
    { value: '10y', label: 'Last 10 Years', icon: Clock },
    { value: '5y', label: 'Last 5 Years', icon: Clock }
  ]

  return (
    <div className="bg-gradient-to-r from-primary/5 to-primary/10 rounded-lg p-6 border border-primary/20 @container/card min-h-[320px]">
      {/* Header with time period selector and chart icon */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          {/* Desktop: Toggle Group */}
          <ToggleGroup
            type="single"
            value={timeRange}
            onValueChange={setTimeRange}
            variant="outline"
            className="hidden *:data-[slot=toggle-group-item]:!px-3 *:data-[slot=toggle-group-item]:text-xs @[640px]/card:flex"
            aria-label="Select time period for litter data trend"
          >
            {timeOptions.map(option => (
              <ToggleGroupItem key={option.value} value={option.value}>
                <option.icon className="w-3 h-3 mr-1" />
                {option.label}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>

          {/* Mobile: Select Dropdown */}
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger
              className="flex w-36 @[640px]/card:hidden"
              size="sm"
              aria-label="Select time period"
            >
              <SelectValue placeholder="Time period" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              {timeOptions.map(option => (
                <SelectItem key={option.value} value={option.value} className="rounded-lg">
                  <div className="flex items-center space-x-2">
                    <option.icon className="w-3 h-3" />
                    <span>{option.label}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex-shrink-0 p-3 rounded-full bg-primary/10">
          <BarChart3 className="w-8 h-8 text-primary" />
        </div>
      </div>

      {/* Current metric display */}
      <div className="space-y-2 mb-6">
        <h3 className="text-sm font-medium text-muted-foreground">Current Average Litter</h3>
        <div className="flex items-center space-x-3">
          <span className="text-3xl font-bold text-primary">
            {regionData.litterData.averageLitterPer100m.toFixed(1)}
          </span>
          <div className="text-sm text-muted-foreground">
            <div>items per 100m</div>
            {regionData.litterData.yearOverYearChange !== undefined && (
              <YearOverYearBadge change={regionData.litterData.yearOverYearChange} />
            )}
          </div>
        </div>
      </div>

      {/* Area Chart */}
      <div className="bg-background/50 rounded-lg p-4 shadow-sm">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[180px] w-full @[640px]/card:h-[180px] @[480px]/card:h-[160px] @max-[480px]/card:h-[140px]"
        >
          <AreaChart
            data={filteredData}
            margin={{ top: 10, right: 10, left: 10, bottom: 10 }}
          >
            <defs>
              <linearGradient id="fillLitter" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-litter)"
                  stopOpacity={0.3}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-litter)"
                  stopOpacity={0.05}
                />
              </linearGradient>
            </defs>
            <CartesianGrid
              vertical={false}
              strokeDasharray="3 3"
              stroke="var(--muted-foreground)"
              strokeOpacity={0.2}
            />
            <XAxis
              dataKey="year"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => value.toString()}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => `Year ${value}`}
                  formatter={(value: number | string) => [
                    `${Number(value).toFixed(1)} items per 100m`,
                    "Average Litter"
                  ]}
                  indicator="dot"
                />
              }
            />
            <Area
              dataKey="averageLitterPer100m"
              type="monotone"
              fill="url(#fillLitter)"
              stroke="var(--color-litter)"
              strokeWidth={2}
              dot={false}
            />
          </AreaChart>
        </ChartContainer>
      </div>
    </div>
  )
}

function OverviewTab({ regionData }: { regionData: RegionData }) {
  return (
    <div className="space-y-6">
      {/* Enhanced Hero Metric - Average Litter with Trend Chart */}
      {regionData.litterData && (
        <EnhancedHeroMetric regionData={regionData} />
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