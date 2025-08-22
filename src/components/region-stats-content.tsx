"use client"

import * as React from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { HorizontalBarChart, InteractivePieChart } from "@/components/charts"
import type { BarChartData } from "@/components/charts/types"
import { chartColors } from "@/components/charts/chart-config"
import { Database, MapPin, ExternalLink, Info, BarChart3, Users, Ruler, TrendingUp, TrendingDown, Minus } from "lucide-react"
import { cn } from "@/lib/utils"
import { formatNumber, formatBeachLength } from "@/lib/format-number"
import type { RegionData, SuggestedRegion } from "@/components/region-info-panel"

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

function GeographicHierarchy({ regionData }: { regionData: RegionData }) {
  const hierarchy = []
  
  // Build hierarchy chain
  if (regionData.level === 'region' && regionData.parentName) {
    hierarchy.push({ level: 'country', name: 'United Kingdom' })
    hierarchy.push({ level: 'county', name: regionData.parentName })
    hierarchy.push({ level: 'region', name: regionData.name })
  } else if (regionData.level === 'county') {
    hierarchy.push({ level: 'country', name: 'United Kingdom' })
    hierarchy.push({ level: 'county', name: regionData.name })
  } else {
    hierarchy.push({ level: regionData.level, name: regionData.name })
  }
  
  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium text-muted-foreground">Location</h3>
      <div className="flex flex-col space-y-1">
        {hierarchy.map((item, index) => (
          <div key={index} className="flex items-center text-sm">
            <span className={cn(
              "capitalize",
              index === hierarchy.length - 1 
                ? "font-medium text-foreground" 
                : "text-muted-foreground"
            )}>
              {item.name}
            </span>
            {index < hierarchy.length - 1 && (
              <span className="text-muted-foreground mx-2">→</span>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

function DataAvailabilityStatus({ hasData, litterData }: { hasData: boolean, litterData?: RegionData['litterData'] }) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-muted-foreground">Data Status</h3>
      <div className="flex items-center justify-between">
        <Badge variant={hasData ? "default" : "secondary"} className="text-xs">
          {hasData ? "Data Available" : "No Data"}
        </Badge>
        {hasData && litterData && (
          <Badge variant="outline" className="text-xs">
            {litterData.averageLitterPer100m.toFixed(1)} items/100m
          </Badge>
        )}
      </div>
    </div>
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
            onClick={() => window.open('https://www.mcsuk.org/what-we-do/clean-seas-and-beaches/great-british-beach-clean', '_blank')}
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
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-6 w-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-6 w-24" />
      </div>
      <div className="space-y-3">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
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
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <div className="text-muted-foreground">No region selected</div>
        <div className="text-sm text-muted-foreground mt-1">
          Click on a region in the map to view details
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with region name and year-over-year change */}
      <div className="space-y-2">
        <h2 className="text-lg font-semibold truncate">{regionData.name}</h2>
        {regionData.litterData?.yearOverYearChange !== undefined && (
          <YearOverYearBadge change={regionData.litterData.yearOverYearChange} />
        )}
      </div>

      {/* Always show geographic hierarchy and data status */}
      <GeographicHierarchy regionData={regionData} />
      <DataAvailabilityStatus 
        hasData={regionData.hasData} 
        litterData={regionData.litterData} 
      />
      
      {/* Show engagement statistics if available */}
      {regionData.hasData && regionData.engagementData && (
        <EngagementStats 
          engagementData={regionData.engagementData}
        />
      )}
      
      {/* Show charts if data is available */}
      {regionData.hasData && regionData.litterData ? (
        <div className="space-y-6">
          {/* Top 5 Litter Items */}
          {regionData.litterData.topItems.length > 0 && (
            <section className="space-y-4">
              <div className="flex items-center space-x-2">
                <BarChart3 className="h-4 w-4 text-primary" />
                <h3 className="text-sm font-medium">
                  Top Litter Items
                </h3>
              </div>
              <HorizontalBarChart
                data={regionData.litterData.topItems.map(item => ({
                  name: item.category,
                  value: item.count,
                  category: item.category,
                  percentage: item.percentage
                }) as BarChartData)}
                height={180}
                maxItems={5}
                showCount={true}
                showPercentage={false}
                className="w-full"
              />
            </section>
          )}

          {/* Material Breakdown */}
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

          {/* Source Breakdown */}
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
      ) : (
        /* Show empty state with suggestions */
        <EmptyState
          regionName={regionData.name}
          suggestedRegions={regionData.suggestedRegions}
          onRegionSelect={onRegionSelect}
        />
      )}
    </div>
  )
}