"use client"

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Menu, PanelRightClose, PanelRightOpen } from 'lucide-react'
import { useState } from 'react'
import { SidebarProvider, SidebarInset, SidebarTrigger, Sidebar, SidebarContent, SidebarHeader } from '@/components/ui/sidebar'
import { Separator } from '@/components/ui/separator'

interface MainLayoutProps {
  children: React.ReactNode
  sidebar?: React.ReactNode
  statsPanel?: React.ReactNode
  statsPanelCollapsed?: boolean
  onStatsPanelToggle?: () => void
}

export function MainLayout({ 
  children, 
  sidebar, 
  statsPanel,
  statsPanelCollapsed = false,
  onStatsPanelToggle
}: MainLayoutProps) {
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)

  return (
    <SidebarProvider>
      {/* Left Sidebar - Filters */}
      <Sidebar side="left" className="border-r-0">
        <SidebarHeader className="border-b p-4">
          <h2 className="font-semibold text-sm">Filters</h2>
        </SidebarHeader>
        <SidebarContent className="overflow-auto">
          {sidebar || (
            <div className="p-4">
              <h3 className="font-medium text-sm text-muted-foreground mb-3">
                Data Filters
              </h3>
              <div className="space-y-4">
                <div className="text-sm">Filter controls will go here</div>
              </div>
            </div>
          )}
        </SidebarContent>
      </Sidebar>

      <SidebarInset className="min-h-screen">
        {/* Header */}
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex h-14 items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
            >
              <Menu className="h-4 w-4" />
            </Button>
            <div className="flex items-center justify-between flex-1">
              <div className="flex items-center space-x-2">
                <h1 className="text-lg font-semibold text-ocean-700 dark:text-ocean-300">
                  Beachwatch Data Explorer
                </h1>
              </div>
              {onStatsPanelToggle && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onStatsPanelToggle}
                  className="h-8 w-8 p-0"
                >
                  {statsPanelCollapsed ? (
                    <PanelRightOpen className="h-4 w-4" />
                  ) : (
                    <PanelRightClose className="h-4 w-4" />
                  )}
                  <span className="sr-only">
                    {statsPanelCollapsed ? 'Open sidebar' : 'Close sidebar'}
                  </span>
                </Button>
              )}
            </div>
          </div>
        </header>

        {/* Main Content Area - Map */}
        <div className="flex-1 relative min-w-0 h-[calc(100vh-3.5rem)]">
          <div className="absolute inset-0">
            {children || (
              <div className="flex h-full items-center justify-center bg-ocean-50 dark:bg-ocean-950">
                <div className="text-center">
                  <div className="text-2xl font-semibold text-ocean-600 dark:text-ocean-400 mb-2">
                    Interactive Map
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Map component will be rendered here
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </SidebarInset>

      {/* Right Sidebar - Stats Panel */}
      <Sidebar 
        side="right" 
        className={cn(
          "border-l-0 hidden md:flex",
          statsPanelCollapsed ? "w-0" : "w-[35%]"
        )}
        collapsible="none"
      >
        <SidebarHeader className="border-b p-4">
          <h2 className="font-semibold text-sm">Region Statistics</h2>
        </SidebarHeader>
        <SidebarContent className="overflow-auto">
          {statsPanel || (
            <div className="p-4">
              <div className="space-y-4">
                <div className="text-sm">Statistics will display here</div>
              </div>
            </div>
          )}
        </SidebarContent>
      </Sidebar>
    </SidebarProvider>
  )
}