import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Database, MapPin, ExternalLink } from "lucide-react"
import type { SuggestedRegion } from '@/types/region-types'

interface EmptyStateProps {
  regionName: string
  suggestedRegions?: SuggestedRegion[]
  onRegionSelect?: (regionId: string) => void
}

export function EmptyState({
  regionName,
  suggestedRegions,
  onRegionSelect
}: EmptyStateProps) {
  const getAvailabilityBadge = (availability: SuggestedRegion['dataAvailability']) => {
    const config = {
      full: { label: 'Full data', variant: 'default' as const },
      partial: { label: 'Partial data', variant: 'secondary' as const },
      limited: { label: 'Limited data', variant: 'outline' as const }
    }

    const { label, variant } = config[availability]
    return (
      <Badge variant={variant} className="text-xs">
        {label}
      </Badge>
    )
  }

  return (
    <div className="space-y-6">
      {/* Main empty state */}
      <div className="flex flex-col items-center justify-center py-6 text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
          <Database className="w-6 h-6 text-muted-foreground" />
        </div>

        <div className="space-y-2">
          <h4 className="text-base font-semibold">No Data Available</h4>
          <p className="text-muted-foreground text-sm max-w-sm">
            No litter survey data is currently available for <strong>{regionName}</strong>.
          </p>
        </div>

        <div className="flex flex-col items-center space-y-2">
          <Button
            variant="outline"
            size="sm"
            className="text-xs"
            onClick={() => window.open('https://www.mcsuk.org/what-you-can-do/join-a-beach-clean/', '_blank')}
          >
            <ExternalLink className="w-3 h-3 mr-2" />
            Contribute Data
          </Button>
        </div>
      </div>

      {/* Suggested regions */}
      {suggestedRegions && suggestedRegions.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <MapPin className="w-4 h-4 text-muted-foreground" />
            <h4 className="text-sm font-medium">
              Nearby Regions with Data
            </h4>
          </div>

          <div className="space-y-2">
            {suggestedRegions.map((region) => (
              <div
                key={region.id}
                className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent transition-colors"
              >
                <div className="flex-1 space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium">{region.name}</span>
                    {region.distance && (
                      <span className="text-xs text-muted-foreground">
                        ~{region.distance}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    {getAvailabilityBadge(region.dataAvailability)}
                  </div>
                </div>

                {onRegionSelect && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onRegionSelect(region.id)}
                    className="text-xs"
                  >
                    View
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}