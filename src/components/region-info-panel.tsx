"use client"

import * as React from "react"
import { 
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { InteractivePieChart } from "@/components/charts"
import { chartColors } from "@/components/charts/chart-config"
import { Database, MapPin, ExternalLink, Info, BarChart3, Users, Ruler } from "lucide-react"
import { cn } from "@/lib/utils"
import { formatNumber, formatBeachLength } from "@/lib/format-number"

export interface SuggestedRegion {
  id: string
  name: string
  level: 'country' | 'county' | 'region'
  distance?: string
  dataAvailability: 'full' | 'partial' | 'limited'
}

export interface RegionData {
  id: string
  name: string
  level: 'country' | 'county' | 'region'
  parentId?: string
  parentName?: string
  hasData: boolean
  suggestedRegions?: SuggestedRegion[]
  litterData?: {
    topItems: Array<{
      category: string
      count: number
      percentage: number
    }>
    materialBreakdown: Array<{
      material: string
      count: number
      percentage: number
    }>
    sourceBreakdown: Array<{
      source: string
      count: number
      percentage: number
    }>
    averageLitterPer100m: number
    yearOverYearChange?: number
  }
  engagementData?: {
    surveyCount: number
    volunteerCount: number  
    totalBeachLength: number
    yearOverYearChanges?: {
      surveys: number
      volunteers: number
      beachLength: number
    }
  }
}

interface RegionInfoPanelProps {
  isOpen: boolean
  onClose: () => void
  regionData?: RegionData
  isLoading?: boolean
  onRegionSelect?: (regionId: string) => void
}

function YearOverYearBadge({ change }: { change?: number }) {
  if (change === undefined) return null
  
  const isImprovement = change < 0 // Decrease in litter is improvement
  const isNeutral = Math.abs(change) < 1 // Less than 1% change is neutral
  
  const colorClass = isNeutral 
    ? "bg-gray-100 text-gray-700 border-gray-200" 
    : isImprovement 
      ? "bg-green-100 text-green-700 border-green-200"
      : "bg-red-100 text-red-700 border-red-200"
  
  const symbol = change > 0 ? "+" : ""
  
  return (
    <span className={cn(
      "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border",
      colorClass
    )}>
      {symbol}{change.toFixed(1)}%
    </span>
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
    <div className="space-y-2">
      <h3 className="text-sm font-medium text-muted-foreground">Data Status</h3>
      <div className="flex items-center space-x-2">
        <div className={cn(
          "w-2 h-2 rounded-full",
          hasData ? "bg-green-500" : "bg-gray-400"
        )} />
        <span className="text-sm">
          {hasData ? "Data available" : "No data available"}
        </span>
      </div>
      {hasData && litterData && (
        <div className="text-sm text-muted-foreground">
          {litterData.averageLitterPer100m.toFixed(1)} items per 100m average
        </div>
      )}
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
      full: { label: 'Full data', class: 'bg-green-100 text-green-700 border-green-200' },
      partial: { label: 'Partial data', class: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
      limited: { label: 'Limited data', class: 'bg-orange-100 text-orange-700 border-orange-200' }
    }
    
    const { label, class: className } = config[availability]
    return (
      <span className={cn(
        "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border",
        className
      )}>
        {label}
      </span>
    )
  }

  return (
    <div className="space-y-6">
      {/* Main empty state */}
      <div className="flex flex-col items-center justify-center py-8 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
          <Database className="w-8 h-8 text-muted-foreground" />
        </div>
        
        <div className="space-y-2">
          <h4 className="text-lg font-semibold">No Data Available</h4>
          <p className="text-muted-foreground text-sm max-w-sm">
            No litter survey data is currently available for <strong>{regionName}</strong>. 
            This could mean the area hasn&apos;t been surveyed recently or data collection is in progress.
          </p>
        </div>

        <div className="flex flex-col items-center space-y-2 pt-2">
          <Button 
            variant="outline" 
            size="sm"
            className="text-xs"
            onClick={() => window.open('https://www.mcsuk.org/what-we-do/clean-seas-and-beaches/great-british-beach-clean', '_blank')}
            aria-label={`Open Marine Conservation Society website to contribute litter data for ${regionName}`}
          >
            <ExternalLink className="w-3 h-3 mr-2" aria-hidden="true" />
            Contribute Data
          </Button>
          <p className="text-xs text-muted-foreground">
            Help by participating in beach clean surveys
          </p>
        </div>
      </div>

      {/* Suggested regions */}
      {suggestedRegions && suggestedRegions.length > 0 && (
        <div className="space-y-4" role="region" aria-labelledby="suggested-regions-heading">
          <div className="flex items-center space-x-2">
            <MapPin className="w-4 h-4 text-muted-foreground" aria-hidden="true" />
            <h4 id="suggested-regions-heading" className="text-sm font-medium">
              Nearby Regions with Data
            </h4>
          </div>
          
          <div className="space-y-3" role="list" aria-label="Suggested regions with available data">
            {suggestedRegions.map((region, index) => (
              <div
                key={region.id}
                role="listitem"
                className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent transition-colors"
                aria-label={`Region ${index + 1} of ${suggestedRegions.length}: ${region.name}${region.distance ? `, approximately ${region.distance} away` : ''}, ${region.dataAvailability} data available`}
              >
                <div className="flex-1 space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium">{region.name}</span>
                    {region.distance && (
                      <span className="text-xs text-muted-foreground" aria-label={`Distance: ${region.distance}`}>
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
                    aria-label={`View data for ${region.name}`}
                  >
                    View
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Information section */}
      <div className="border-t pt-4">
        <div className="flex items-start space-x-3">
          <Info className="w-4 h-4 text-muted-foreground mt-0.5" />
          <div className="space-y-2">
            <p className="text-sm font-medium">About Data Collection</p>
            <p className="text-xs text-muted-foreground">
              Beach litter data is collected through regular volunteer surveys coordinated by the 
              Marine Conservation Society. Coverage varies by region and survey frequency.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

function EngagementStats({ engagementData, regionName }: { 
  engagementData: NonNullable<RegionData['engagementData']>
  regionName: string 
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
    <div className="space-y-4" role="region" aria-label={`Engagement statistics for ${regionName}`}>
      <h3 className="text-sm font-medium text-muted-foreground">Engagement Statistics</h3>
      
      <div className="grid grid-cols-1 gap-4">
        {metrics.map((metric) => {
          const Icon = metric.icon
          return (
            <div 
              key={metric.label}
              className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
              role="group"
              aria-label={metric.description}
            >
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0 p-2 rounded-md bg-primary/10">
                  <Icon className="w-4 h-4 text-primary" aria-hidden="true" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium">{metric.label}</span>
                    {metric.change !== undefined && (
                      <YearOverYearBadge change={metric.change} />
                    )}
                  </div>
                  <span className="text-lg font-semibold" aria-label={metric.description}>
                    {metric.value}
                  </span>
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
        <Skeleton className="h-8 w-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-6 w-24" />
      </div>
      <div className="space-y-3">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
      </div>
    </div>
  )
}

export function RegionInfoPanel({
  isOpen,
  onClose,
  regionData,
  isLoading = false,
  onRegionSelect,
}: RegionInfoPanelProps) {
  // Handle keyboard navigation
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Only handle keyboard events when panel is open
      if (!isOpen) return

      switch (event.key) {
        case 'Escape':
          event.preventDefault()
          onClose()
          break
        case 'Tab':
          // Let the browser handle tab navigation within the panel
          // The Sheet component already manages focus trapping
          break
      }
    }

    // Add event listener when panel is open
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
    }

    // Cleanup
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose])

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent 
        side="right" 
        className="w-full sm:max-w-md"
        aria-labelledby="region-info-title"
        aria-describedby="region-info-content"
        role="dialog"
        aria-modal="true"
      >
        <SheetHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex-1 pr-8">
              <SheetTitle id="region-info-title" className="text-left truncate">
                {isLoading ? "Loading..." : regionData?.name || "Region Information"}
              </SheetTitle>
              {regionData?.litterData?.yearOverYearChange !== undefined && (
                <div className="mt-2">
                  <YearOverYearBadge change={regionData.litterData.yearOverYearChange} />
                </div>
              )}
            </div>
          </div>
        </SheetHeader>
        
        <div 
          id="region-info-content" 
          className="flex-1 overflow-y-auto space-y-6 pr-1"
          style={{ maxHeight: 'calc(100vh - 120px)' }}
        >
          {isLoading ? (
            <LoadingSkeleton />
          ) : regionData ? (
            <>
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
                  regionName={regionData.name}
                />
              )}
              
              {/* Show charts if data is available */}
              {regionData.hasData && regionData.litterData ? (
                <div className="space-y-6" role="region" aria-label="Litter data visualizations">

                  {/* Material Breakdown */}
                  {regionData.litterData.materialBreakdown.length > 0 && (
                    <section className="space-y-3" aria-labelledby="material-heading">
                      <h3 id="material-heading" className="text-sm font-medium text-muted-foreground">
                        Material Breakdown
                      </h3>
                      <div role="img" aria-labelledby="material-heading" aria-describedby="material-description">
                        <InteractivePieChart
                          data={regionData.litterData.materialBreakdown.map((item, index) => ({
                            name: item.material,
                            value: item.count,
                            percentage: item.percentage,
                            fill: Object.values(chartColors)[index % Object.values(chartColors).length]
                          }))}
                          title="Material Breakdown"
                          description="Breakdown by material type"
                          height={200}
                          className="w-full"
                        />
                        <p id="material-description" className="sr-only">
                          Interactive pie chart showing the distribution of litter by material type in {regionData.name}
                        </p>
                      </div>
                    </section>
                  )}

                  {/* Source Breakdown */}
                  {regionData.litterData.sourceBreakdown.length > 0 && (
                    <section className="space-y-3" aria-labelledby="source-heading">
                      <h3 id="source-heading" className="text-sm font-medium text-muted-foreground">
                        Source Breakdown
                      </h3>
                      <div role="img" aria-labelledby="source-heading" aria-describedby="source-description">
                        <InteractivePieChart
                          data={regionData.litterData.sourceBreakdown.map((item, index) => ({
                            name: item.source,
                            value: item.count,
                            percentage: item.percentage,
                            fill: Object.values(chartColors)[index % Object.values(chartColors).length]
                          }))}
                          title="Source Breakdown"
                          description="Breakdown by source type"
                          height={200}
                          className="w-full"
                        />
                        <p id="source-description" className="sr-only">
                          Interactive pie chart showing the distribution of litter by source type in {regionData.name}
                        </p>
                      </div>
                    </section>
                  )}

                  {/* Partial data notification */}
                  {(!regionData.litterData.topItems.length && 
                    !regionData.litterData.materialBreakdown.length && 
                    !regionData.litterData.sourceBreakdown.length) && (
                    <div className="p-4 bg-muted rounded-lg">
                      <div className="flex items-start space-x-3">
                        <Info className="w-4 h-4 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="text-sm font-medium">Limited Data Available</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Some metrics are available but detailed breakdowns are not yet processed.
                          </p>
                        </div>
                      </div>
                    </div>
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
            </>
          ) : (
            /* Initial state - no region selected */
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="text-muted-foreground">No region selected</div>
              <div className="text-sm text-muted-foreground mt-1">
                Click on a region in the map to view details
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}