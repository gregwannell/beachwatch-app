'use client'

import { Sun, Moon } from 'lucide-react'
import { Switch } from '@/components/ui/switch'
import { type MapTheme } from '@/lib/map-themes'

interface MapThemeToggleProps {
  theme: MapTheme
  onThemeChange: (theme: MapTheme) => void
  className?: string
}

export function MapThemeToggle({
  theme,
  onThemeChange,
  className = ""
}: MapThemeToggleProps) {
  const handleToggle = (checked: boolean) => {
    onThemeChange(checked ? 'dark' : 'light')
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Sun className="h-4 w-4 text-muted-foreground" />
      <Switch
        id="map-theme-toggle"
        checked={theme === 'dark'}
        onCheckedChange={handleToggle}
        aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} map theme`}
      />
      <Moon className="h-4 w-4 text-muted-foreground" />
    </div>
  )
}