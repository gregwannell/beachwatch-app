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
          <SelectValue placeholder="Select a year" />
        </SelectTrigger>
        <SelectContent>
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