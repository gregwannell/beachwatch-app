'use client'

import { useCallback, useEffect, useState } from 'react'
import { MoonIcon, SunIcon } from 'lucide-react'
import { useTheme } from 'next-themes'
import { Switch } from '@/components/ui/switch'
import { cn } from '@/lib/utils'

export function ThemeToggle({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  const { resolvedTheme, setTheme } = useTheme()
  const [checked, setChecked] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])
  useEffect(() => setChecked(resolvedTheme === 'dark'), [resolvedTheme])

  const handleCheckedChange = useCallback(
    (isChecked: boolean) => {
      setChecked(isChecked)
      setTheme(isChecked ? 'dark' : 'light')
    },
    [setTheme],
  )

  if (!mounted) return null

  return (
    <div
      className={cn(
        'relative flex items-center justify-center',
        'h-7 w-16',
        className
      )}
      {...props}
    >
      <Switch
        checked={checked}
        onCheckedChange={handleCheckedChange}
        aria-label="Toggle dark mode"
        className={cn(
          'peer absolute inset-0 h-full w-full rounded-full bg-input/50 transition-colors',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          '[&>span]:h-5 [&>span]:w-5 [&>span]:rounded-full [&>span]:bg-background [&>span]:shadow [&>span]:z-10',
          'data-[state=unchecked]:[&>span]:translate-x-1',
          'data-[state=checked]:[&>span]:translate-x-[34px]'
        )}
      />

      <span
        className={cn(
          'pointer-events-none absolute left-2 inset-y-0 z-0',
          'flex items-center justify-center'
        )}
      >
        <SunIcon
          size={12}
          className={cn(
            'transition-all duration-200 ease-out',
            checked ? 'text-muted-foreground/70' : 'text-foreground scale-110'
          )}
        />
      </span>

      <span
        className={cn(
          'pointer-events-none absolute right-2 inset-y-0 z-0',
          'flex items-center justify-center'
        )}
      >
        <MoonIcon
          size={12}
          className={cn(
            'transition-all duration-200 ease-out',
            checked ? 'text-foreground scale-110' : 'text-muted-foreground/70'
          )}
        />
      </span>
    </div>
  )
}
