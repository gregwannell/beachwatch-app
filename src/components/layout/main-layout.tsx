"use client"

import { MobileHeader } from './mobile-header'

interface MainLayoutProps {
  children: React.ReactNode
}

export function MainLayout({
  children,
}: MainLayoutProps) {
  return (
    <div className="flex h-screen bg-background">
      {/* Header - Visible on all screen sizes */}
      <MobileHeader />

      {/* Skip link for keyboard navigation */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 z-[10002] bg-primary text-primary-foreground px-4 py-2 rounded-md"
      >
        Skip to main content
      </a>

      {/* Main Content Area */}
      <div className="flex-1 h-screen relative pt-12" role="main" aria-label="Interactive map">
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
    </div>
  )
}