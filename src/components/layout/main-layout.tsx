"use client"

import { Waves } from 'lucide-react'
import Image from 'next/image'
import { SidebarProvider, SidebarInset, SidebarTrigger, Sidebar, SidebarContent, SidebarHeader, SidebarFooter } from '@/components/ui/sidebar'
import type { RegionData } from '@/types/region-types'

interface MainLayoutProps {
  children: React.ReactNode
  sidebar?: React.ReactNode
  regionData?: RegionData
}

export function MainLayout({
  children,
  sidebar,
  regionData
}: MainLayoutProps) {
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
        <Sidebar side="left" variant="inset" aria-label="Data filters">
          <SidebarHeader className="bg-background/50 backdrop-blur-sm">
            <h2 className="font-semibold text-xl flex items-center gap-2">
              <img src="/MCS_logo_Stacked_Ink.png" alt="Marine Conservation Society" className="h-8" />
              Beachwatch Data Explorer
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
          <SidebarFooter className="border-t p-4">
            <div className="flex justify-left">
              <Image
                src="/mcs-logo.png"
                alt="Marine Conservation Society"
                width={200}
                height={60}
                className="h-15 w-auto opacity-80"
              />
            </div>
          </SidebarFooter>
        </Sidebar>

        <SidebarInset className="flex-1">
          {/* Main Content Area - Map */}
          <div className="h-screen relative" role="main" aria-label="Interactive map">
            {/* Floating Sidebar Trigger */}
            <div className="absolute top-4 left-4 z-[1000]">
              <SidebarTrigger className="bg-background border border-border shadow-lg hover:bg-accent" />
            </div>

            <div className="h-full" id="main-content">
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
      </SidebarProvider>
    </div>
  )
}