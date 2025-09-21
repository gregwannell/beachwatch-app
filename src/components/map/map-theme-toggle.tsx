'use client'

import { Sun, Moon } from 'lucide-react'
import { Button } from '@/components/ui/button'
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
  const handleToggle = () => {
    onThemeChange(theme === 'light' ? 'dark' : 'light')
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleToggle}
      className={className}
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} map theme`}
      title={`Switch to ${theme === 'light' ? 'dark' : 'light'} map theme`}
    >
      {theme === 'light' ? (
        <Moon className="h-4 w-4" />
      ) : (
        <Sun className="h-4 w-4" />
      )}
    </Button>
  )
}