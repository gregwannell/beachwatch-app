'use client'

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { YearRangeFilter } from "@/types/filter-types"

interface YearRangePickerProps {
  value: YearRangeFilter
  onChange: (value: YearRangeFilter) => void
  availableYears: { min: number; max: number }
  className?: string
}

interface PresetButton {
  label: string
  getValue: (maxYear: number) => YearRangeFilter
}

export function YearRangePicker({
  value,
  onChange,
  availableYears,
  className,
}: YearRangePickerProps) {
  const { min: minYear, max: maxYear } = availableYears

  // Preset buttons for common periods
  const presets: PresetButton[] = [
    {
      label: 'All Time',
      getValue: (max) => ({
        startYear: minYear,
        endYear: max,
        mode: 'range'
      })
    },
    {
      label: 'Last 5 Years',
      getValue: (max) => ({
        startYear: Math.max(minYear, max - 4),
        endYear: max,
        mode: 'range'
      })
    },
    {
      label: 'Last 10 Years',
      getValue: (max) => ({
        startYear: Math.max(minYear, max - 9),
        endYear: max,
        mode: 'range'
      })
    },
    {
      label: 'Current Year',
      getValue: (max) => ({
        startYear: max,
        endYear: max,
        mode: 'single'
      })
    }
  ]

  const handleSliderChange = (newValue: number[]) => {
    const [start, end] = newValue
    onChange({
      startYear: start,
      endYear: end,
      mode: start === end ? 'single' : 'range'
    })
  }

  const handleStartYearChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newStartYear = parseInt(event.target.value)
    if (!isNaN(newStartYear) && newStartYear >= minYear && newStartYear <= maxYear) {
      onChange({
        ...value,
        startYear: Math.min(newStartYear, value.endYear),
      })
    }
  }

  const handleEndYearChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newEndYear = parseInt(event.target.value)
    if (!isNaN(newEndYear) && newEndYear >= minYear && newEndYear <= maxYear) {
      onChange({
        ...value,
        endYear: Math.max(newEndYear, value.startYear),
      })
    }
  }

  const handleModeToggle = () => {
    if (value.mode === 'single') {
      // Switch to range mode, keep the selected year as start
      onChange({
        ...value,
        mode: 'range',
        endYear: Math.min(value.startYear + 1, maxYear)
      })
    } else {
      // Switch to single mode, use the start year
      onChange({
        ...value,
        mode: 'single',
        endYear: value.startYear
      })
    }
  }

  const handlePresetClick = (preset: PresetButton) => {
    onChange(preset.getValue(maxYear))
  }

  return (
    <Card className={className}>
      <CardContent className="p-4 space-y-4">
        <div className="space-y-2">
          <Label className="text-sm font-medium">Time Period</Label>
          
          {/* Mode Toggle */}
          <div className="flex gap-2">
            <Button
              variant={value.mode === 'single' ? 'default' : 'outline'}
              size="sm"
              onClick={handleModeToggle}
              className="text-xs"
            >
              Single Year
            </Button>
            <Button
              variant={value.mode === 'range' ? 'default' : 'outline'}
              size="sm"
              onClick={handleModeToggle}
              className="text-xs"
            >
              Year Range
            </Button>
          </div>
        </div>

        {/* Slider for visual selection */}
        <div className="space-y-3">
          <div className="px-2">
            <Slider
              value={[value.startYear, value.endYear]}
              onValueChange={handleSliderChange}
              min={minYear}
              max={maxYear}
              step={1}
              className="w-full"
            />
          </div>
          
          {/* Year range indicators */}
          <div className="flex justify-between text-xs text-muted-foreground px-2">
            <span>{minYear}</span>
            <span>{maxYear}</span>
          </div>
        </div>

        {/* Input fields for precise selection */}
        <div className="flex gap-2 items-center">
          <div className="flex-1">
            <Label htmlFor="start-year" className="text-xs">
              {value.mode === 'single' ? 'Year' : 'Start Year'}
            </Label>
            <Input
              id="start-year"
              type="number"
              value={value.startYear}
              onChange={handleStartYearChange}
              min={minYear}
              max={maxYear}
              className="text-sm"
            />
          </div>
          
          {value.mode === 'range' && (
            <>
              <div className="text-muted-foreground text-sm pt-5">to</div>
              <div className="flex-1">
                <Label htmlFor="end-year" className="text-xs">End Year</Label>
                <Input
                  id="end-year"
                  type="number"
                  value={value.endYear}
                  onChange={handleEndYearChange}
                  min={minYear}
                  max={maxYear}
                  className="text-sm"
                />
              </div>
            </>
          )}
        </div>

        {/* Current selection display */}
        <div className="text-center">
          <div className="text-sm font-medium">
            {value.mode === 'single' 
              ? `Selected: ${value.startYear}`
              : `Selected: ${value.startYear} - ${value.endYear} (${value.endYear - value.startYear + 1} years)`
            }
          </div>
        </div>

        {/* Preset buttons */}
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Quick Select</Label>
          <div className="grid grid-cols-2 gap-2">
            {presets.map((preset) => (
              <Button
                key={preset.label}
                variant="outline"
                size="sm"
                onClick={() => handlePresetClick(preset)}
                className="text-xs h-8"
              >
                {preset.label}
              </Button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}