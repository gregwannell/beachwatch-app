'use client'

import * as React from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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

  // Generate array of all available years
  const yearOptions = []
  for (let year = maxYear; year >= minYear; year--) {
    yearOptions.push(year)
  }

  const handleYearChange = (yearString: string) => {
    const year = parseInt(yearString)
    onChange({
      startYear: year,
      endYear: year,
      mode: 'single'
    })
  }

  return (
    <div className={className}>
      <Select
        value={value.startYear.toString()}
        onValueChange={handleYearChange}
      >
        <SelectTrigger className="w-full">
          <div className="flex items-center justify-between w-full">
            <span className="text-sm font-medium text-foreground">Year</span>
            <span className="text-sm text-muted-foreground">
              {value.startYear}
            </span>
          </div>
        </SelectTrigger>
        <SelectContent position="popper" className="max-h-[300px]">
          {yearOptions.map((year) => (
            <SelectItem key={year} value={year.toString()}>
              {year} {year === maxYear && '(Latest)'}
              {year === minYear && '(Oldest)'}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}