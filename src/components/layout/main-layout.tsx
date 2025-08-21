"use client"

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Menu, X, ChevronRight, ChevronLeft } from 'lucide-react'

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
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center px-4">
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          >
            {sidebarCollapsed ? <Menu className="h-4 w-4" /> : <X className="h-4 w-4" />}
          </Button>
          <div className="flex items-center space-x-2 md:ml-0 ml-2">
            <h1 className="text-lg font-semibold text-ocean-700 dark:text-ocean-300">
              Beachwatch Data Explorer
            </h1>
          </div>
        </div>
      </header>

      {/* Main Grid Layout */}
      <div className="container-fluid p-0">
        <div className={cn(
          "grid h-[calc(100vh-3.5rem)] grid-cols-1 transition-all duration-300 ease-in-out",
          // Mobile: always single column
          "md:grid-cols-[280px_1fr_320px] lg:grid-cols-[320px_1fr_360px]",
          // When stats panel is collapsed, adjust the grid
          statsPanelCollapsed && "md:grid-cols-[280px_1fr] lg:grid-cols-[320px_1fr]"
        )}>
          {/* Left Sidebar - Filters */}
          <aside
            className={cn(
              "border-r bg-sidebar transition-transform duration-200 ease-in-out md:translate-x-0",
              sidebarCollapsed ? "-translate-x-full" : "translate-x-0",
              "absolute md:relative z-40 h-full w-80 md:w-auto"
            )}
          >
            <div className="flex h-full flex-col">
              <div className="flex items-center justify-between border-b p-4 md:hidden">
                <h2 className="font-semibold">Filters</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSidebarCollapsed(true)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex-1 overflow-auto">
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
              </div>
            </div>
          </aside>

          {/* Main Content Area - Map */}
          <main className="relative overflow-hidden">
            <div className="h-full w-full">
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
          </main>

          {/* Right Sidebar - Stats Panel */}
          <aside className={cn(
            "border-l bg-sidebar transition-all duration-300 ease-in-out hidden md:block relative",
            statsPanelCollapsed && "hidden"
          )}>
            <div className="flex h-full flex-col">
              <div className="border-b p-4">
                <div className="flex items-center justify-between">
                  <h2 className="font-semibold text-sm">Region Statistics</h2>
                  {onStatsPanelToggle && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={onStatsPanelToggle}
                      className="h-8 w-8 p-0"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
              <div className="flex-1 overflow-auto">
                {statsPanel || (
                  <div className="p-4">
                    <div className="space-y-4">
                      <div className="text-sm">Statistics will display here</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </aside>

          {/* Collapsed Stats Panel Toggle Button */}
          {statsPanelCollapsed && onStatsPanelToggle && (
            <div className="fixed right-0 top-1/2 -translate-y-1/2 z-10 hidden md:block">
              <Button
                variant="secondary"
                size="sm"
                onClick={onStatsPanelToggle}
                className="rounded-l-md rounded-r-none h-12 w-8 p-0 shadow-lg border-r-0"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile overlay */}
      {!sidebarCollapsed && (
        <div
          className="fixed inset-0 z-30 bg-background/80 backdrop-blur-sm md:hidden"
          onClick={() => setSidebarCollapsed(true)}
        />
      )}
    </div>
  )
}