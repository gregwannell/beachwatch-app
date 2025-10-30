'use client'

import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'

interface DataAvailabilityFilterProps {
  showNoData: boolean
  highlightLimitedSurveys: boolean
  onChange: (filters: { showNoData: boolean; highlightLimitedSurveys: boolean }) => void
  className?: string
}

export function DataAvailabilityFilter({
  showNoData,
  highlightLimitedSurveys,
  onChange,
  className = '',
}: DataAvailabilityFilterProps) {
  return (
    <div className={`space-y-3 ${className}`}>
      <Label className="text-sm font-medium">Data Availability</Label>

      <div className="space-y-3">
        {/* Show No Data Toggle */}
        <div className="flex items-center justify-between">
          <label
            htmlFor="show-no-data"
            className="text-sm font-normal cursor-pointer"
          >
            Show regions with no data
          </label>
          <Switch
            id="show-no-data"
            checked={showNoData}
            onCheckedChange={(checked) => onChange({ showNoData: checked, highlightLimitedSurveys })}
          />
        </div>

        {/* Highlight Limited Surveys Toggle */}
        <div className="flex items-center justify-between">
          <label
            htmlFor="highlight-limited"
            className="text-sm font-normal cursor-pointer"
          >
            Highlight limited surveys (&lt;5)
          </label>
          <Switch
            id="highlight-limited"
            checked={highlightLimitedSurveys}
            onCheckedChange={(checked) => onChange({ showNoData, highlightLimitedSurveys: checked })}
          />
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        Toggle map visibility and highlighting options for data quality
      </p>
    </div>
  )
}
