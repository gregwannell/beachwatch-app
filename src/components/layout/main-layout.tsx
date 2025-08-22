"use client"

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Menu, PanelRightOpen, Waves, Map } from 'lucide-react'
import { useState } from 'react'
import { SidebarProvider, SidebarInset, SidebarTrigger, Sidebar, SidebarContent, SidebarHeader } from '@/components/ui/sidebar'
import { Separator } from '@/components/ui/separator'
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb'

interface MainLayoutProps {
  children: React.ReactNode
  sidebar?: React.ReactNode
  statsPanel?: React.ReactNode
}

export function MainLayout({ 
  children, 
  sidebar, 
  statsPanel
}: MainLayoutProps) {
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)
  const [rightSidebarOpen, setRightSidebarOpen] = useState(true)

  return (
    <div className="flex h-screen bg-background">
      {/* Skip link for keyboard navigation */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 z-[10002] bg-primary text-primary-foreground px-4 py-2 rounded-md"
      >
        Skip to main content
      </a>
      
      {/* Left Sidebar Provider */}
      <SidebarProvider>
        <Sidebar side="left" className="border-r bg-gradient-subtle" aria-label="Data filters">
          <SidebarHeader className="border-b p-4 bg-background/50 backdrop-blur-sm">
            <h2 className="font-semibold text-sm flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary"></div>
              Filters
            </h2>
          </SidebarHeader>
          <SidebarContent className="overflow-auto" role="region" aria-label="Filter controls">
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

        <SidebarInset className="flex-1">
          {/* Header */}
          <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm" role="banner">
            <div className="flex h-16 items-center gap-2 sm:gap-4 px-4 sm:px-6">
              <SidebarTrigger className="-ml-1" />
              <Separator orientation="vertical" className="mr-2 h-4" />
              
              <div className="flex items-center justify-between flex-1">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 ring-1 ring-primary/20 hover-lift">
                      <Waves className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h1 className="text-lg sm:text-xl font-bold tracking-tight">
                        <span className="hidden sm:inline">Beachwatch Data Explorer</span>
                        <span className="sm:hidden">Beachwatch</span>
                      </h1>
                      <div className="hidden sm:flex items-center space-x-2 mt-0.5">
                        <Breadcrumb>
                          <BreadcrumbList>
                            <BreadcrumbItem>
                              <BreadcrumbLink href="#" className="text-xs text-muted-foreground flex items-center gap-1">
                                <Map className="h-3 w-3" />
                                UK Coastal Survey
                              </BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator />
                            <BreadcrumbItem>
                              <BreadcrumbPage className="text-xs">Interactive Map</BreadcrumbPage>
                            </BreadcrumbItem>
                          </BreadcrumbList>
                        </Breadcrumb>
                        <Badge variant="secondary" className="text-xs">
                          2024 Data
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="md:hidden"
                    onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
                    aria-label="Toggle mobile filters"
                    aria-expanded={mobileFiltersOpen}
                  >
                    <Menu className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setRightSidebarOpen(!rightSidebarOpen)}
                    aria-label={rightSidebarOpen ? "Hide statistics panel" : "Show statistics panel"}
                    aria-expanded={rightSidebarOpen}
                  >
                    <PanelRightOpen className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </header>

          {/* Main Content Area - Map with Right Sidebar */}
          <div className="flex h-[calc(100vh-4rem)]">
            {/* Map Content */}
            <div className={cn(
              "flex-1 relative transition-all duration-300",
              rightSidebarOpen ? "mr-0" : "mr-0"
            )} role="main" aria-label="Interactive map">
              <div className="absolute inset-0" id="main-content">
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
            
            {/* Right Sidebar - Stats Panel */}
            <div className={cn(
              "border-l bg-gradient-subtle transition-all duration-300 ease-in-out overflow-hidden",
              "hidden lg:block",
              rightSidebarOpen ? "w-[35%] xl:w-[30%]" : "w-0 border-l-0"
            )} role="complementary" aria-label="Statistics panel">
              <div className={cn(
                "h-full flex flex-col transition-opacity duration-300",
                rightSidebarOpen ? "opacity-100" : "opacity-0"
              )}>
                <div className="border-b p-4 flex-shrink-0 bg-background/50 backdrop-blur-sm">
                  <h2 className="font-semibold text-sm flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-primary"></div>
                    Region Statistics
                  </h2>
                </div>
                <div className="flex-1 overflow-auto">
                  {rightSidebarOpen && (statsPanel || (
                    <div className="p-4">
                      <div className="space-y-4">
                        <div className="text-sm">Statistics will display here</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </div>
  )
}