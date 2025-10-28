'use client'

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Palette } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"

interface FilterSidebarProps {
  className?: string
}

export function FilterSidebar({
  className,
}: FilterSidebarProps) {
  return (
    <div className={`p-3 sm:p-4 ${className}`}>
      {/* Theme Toggle */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Palette className="h-4 w-4 text-primary" />
            Theme
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex items-center justify-center">
            <ThemeToggle />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}