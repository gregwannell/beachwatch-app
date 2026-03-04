"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { cn } from "@/lib/utils"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ExternalLink, AlertTriangle, LayoutDashboard, Trash2, Layers } from "lucide-react"
import type { RegionData } from '@/types/region-types'

// Import extracted components
import { EmptyState, LoadingSkeleton, NoDataForYear } from './components'
import { OverviewTab, LitterStatsTab, RegionsTab } from './tabs'
import { GradientHeroHeader } from './hero'

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
  const isLimitedSurvey = Boolean(
    regionData?.hasData &&
    regionData?.engagementData &&
    regionData.engagementData.surveyCount < 5
  )

  const [dialogOpen, setDialogOpen] = React.useState(false)

  React.useEffect(() => {
    setDialogOpen(isLimitedSurvey)
  }, [regionData?.id, isLimitedSurvey])

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

  return (
    <Tabs defaultValue="overview" className="flex flex-col h-full">
      {/* Gradient Hero Header + Floating Tab Strip — never scrolls */}
      <div className="flex-shrink-0">
        {/* Gradient Hero with Average Litter/100m */}
        <GradientHeroHeader
          regionData={regionData}
          selectedYear={selectedYear}
          hideHeader={hideHeader}
          onRegionSelect={onRegionSelect}
        />

        {/* Tab Strip */}
        <div className="px-4 py-2 bg-background">
          <TabsList id="region-stats-tabs" className="grid w-full grid-cols-3">
            <TabsTrigger value="overview" className="text-sm">
              <LayoutDashboard /> Overview
            </TabsTrigger>
            <TabsTrigger value="litter" className="text-sm">
              <Trash2 /> Litter Stats
            </TabsTrigger>
            <TabsTrigger value="regions" className="text-sm">
              <Layers /> Regions
            </TabsTrigger>
          </TabsList>
        </div>
      </div>

      {/* Scrollable tab content */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {/* Low survey count warning — alert dialog + persistent indicator */}
        {isLimitedSurvey && (
          <>
            <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <AlertDialogContent
                className="border-amber-900 bg-amber-100 text-amber-900"
              >
                <AlertDialogHeader>
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-amber-600" />
                    <AlertDialogTitle>Limited Survey Data</AlertDialogTitle>
                  </div>
                  <AlertDialogDescription className="text-amber-900">
                    This region has fewer than 5 surveys. Statistics should be
                    interpreted with caution as they may not be representative.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <Button
                    variant="plain"
                    onClick={() =>
                      window.open(
                        "https://www.mcsuk.org/what-you-can-do/join-a-beach-clean/",
                        "_blank"
                      )
                    }
                  >
                    Contribute Data
                    <ExternalLink className="w-4 h-4 mr-2" />
                  </Button>
                  <AlertDialogAction>
                    I understand
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <button
              type="button"
              onClick={() => setDialogOpen(true)}
              className={cn(
                "flex items-center gap-2 w-full px-3 py-2 rounded-md text-sm",
                "border border-amber-200 bg-amber-50 text-amber-900",
                "dark:border-amber-900 dark:bg-amber-950 dark:text-amber-50",
                "hover:bg-amber-100 dark:hover:bg-amber-900/50",
                "transition-colors cursor-pointer"
              )}
            >
              <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
              <span className="font-medium">Limited survey data</span>
            </button>
          </>
        )}

        <TabsContent value="overview" className="space-y-4 mt-0">
          {!regionData.hasData
            ? <EmptyState regionName={regionData.name} />
            : regionData.hasDataForYear === false
            ? <NoDataForYear regionData={regionData} selectedYear={selectedYear} />
            : <OverviewTab regionData={regionData} selectedYear={selectedYear} />}
        </TabsContent>

        <TabsContent value="litter" className="space-y-4 mt-0">
          {!regionData.hasData
            ? <EmptyState regionName={regionData.name} />
            : regionData.hasDataForYear === false
            ? <NoDataForYear regionData={regionData} selectedYear={selectedYear} />
            : <LitterStatsTab regionData={regionData} />}
        </TabsContent>

        <TabsContent value="regions" className="space-y-4 mt-0">
          {!regionData.hasData
            ? <EmptyState regionName={regionData.name} />
            : regionData.hasDataForYear === false
            ? <NoDataForYear regionData={regionData} selectedYear={selectedYear} />
            : <RegionsTab regionData={regionData} selectedYear={selectedYear} onRegionSelect={onRegionSelect} />}
        </TabsContent>
      </div>
    </Tabs>
  )
}
