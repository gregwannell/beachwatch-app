'use client'

import * as React from "react"
import { Button } from "@/components/ui/button"
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


export function YearRangePicker({
  value,
  onChange,
  availableYears,
  className,
}: YearRangePickerProps) {
  const { min: minYear, max: maxYear } = availableYears

  // Preset years for quick selection
  const presetYears = [
    { label: 'Latest Year', year: maxYear },
    { label: 'Previous Year', year: maxYear - 1 },
    { label: 'Oldest Data', year: minYear }
  ]

  const handleYearChange = (year: number) => {
    onChange({
      startYear: year,
      endYear: year,
      mode: 'single'
    })
  }

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newYear = parseInt(event.target.value)
    if (!isNaN(newYear) && newYear >= minYear && newYear <= maxYear) {
      handleYearChange(newYear)
    }
  }



  const handlePresetClick = (year: number) => {
    handleYearChange(year)
  }

  return (
    <Card className={className}>
      <CardContent className="p-4 space-y-4">
        <div className="space-y-2">
          <Label className="text-sm font-medium">Year</Label>
        </div>


        {/* Year input */}
        <div>
          <Label htmlFor="year" className="text-xs">Select Year</Label>
          <Input
            id="year"
            type="number"
            value={value.startYear}
            onChange={handleInputChange}
            min={minYear}
            max={maxYear}
            className="text-sm"
          />
        </div>

        {/* Current selection display */}
        <div className="text-center">
          <div className="text-sm font-medium">
            Selected: {value.startYear}
          </div>
        </div>

        {/* Preset buttons */}
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Quick Select</Label>
          <div className="grid grid-cols-1 gap-2">
            {presetYears.map((preset) => (
              <Button
                key={preset.label}
                variant="outline"
                size="sm"
                onClick={() => handlePresetClick(preset.year)}
                className="text-xs h-8"
              >
                {preset.label} ({preset.year})
              </Button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}