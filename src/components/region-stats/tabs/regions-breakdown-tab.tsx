import type { RegionData } from '@/types/region-types'

interface RegionsTabProps {
  regionData: RegionData
}

export function RegionsTab(_: RegionsTabProps) {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground text-sm">
      Region breakdown coming soon.
    </div>
  )
}
