"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import { ExternalLink, AlertTriangle } from "lucide-react"
import type { RegionData } from '@/types/region-types'

// Import extracted components
import { EmptyState, LoadingSkeleton } from './components'
import { OverviewTab, LitterStatsTab, EngagementTab } from './tabs'
import { getBreadcrumbHierarchy } from './utils'

interface RegionStatsContentProps {
  regionData?: RegionData
  isLoading?: boolean
  onRegionSelect?: (regionId: string) => void
  selectedYear?: number
  hideHeader?: boolean
}

export function RegionStatsContent({
  regionData,
  isLoading = false,
  onRegionSelect,
  selectedYear,
  hideHeader = false,
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
  const breadcrumbHierarchy = getBreadcrumbHierarchy(regionData)

  return (
    <div className="space-y-4 px-6 py-2">
      {/* Header with region name and status badge */}
      {!hideHeader && (
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
      )}

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
