"use client"

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Menu, Waves, Map } from 'lucide-react'
import { useState } from 'react'
import { SidebarProvider, SidebarInset, SidebarTrigger, Sidebar, SidebarContent, SidebarHeader } from '@/components/ui/sidebar'
import { Separator } from '@/components/ui/separator'
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb'

interface MainLayoutProps {
  children: React.ReactNode
  sidebar?: React.ReactNode
}

export function MainLayout({
  children,
  sidebar
}: MainLayoutProps) {
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)

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
            <h2 className="font-semibold text-xl flex items-center gap-2">
              <Waves className="h-8 w-8 text-primary" />
              Beachwatch Date Explorer
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
                    <div className="hidden sm:flex items-center space-x-2">
                      <img 
                        src="https://www.mcsuk.org/static/images/logos/bubbles-light.gif"
                        alt="Marine Conservation Society"
                        className="h-8 w-auto"
                      />
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
                </div>
              </div>
            </div>
          </header>

          {/* Main Content Area - Map */}
          <div className="h-[calc(100vh-4rem)]">
            <div className="h-full relative" role="main" aria-label="Interactive map">
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
          </div>
        </SidebarInset>
      </SidebarProvider>
    </div>
  )
}