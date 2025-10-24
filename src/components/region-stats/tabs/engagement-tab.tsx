import { Button } from "@/components/ui/button"
import { ExternalLink, Users } from "lucide-react"
import type { RegionData } from '@/types/region-types'
import { EngagementStats } from '../cards/engagement-stats'

interface EngagementTabProps {
  regionData: RegionData
}

export function EngagementTab({ regionData }: EngagementTabProps) {
  if (!regionData.hasData || !regionData.engagementData) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
          <Users className="w-6 h-6 text-muted-foreground" />
        </div>
        <div className="space-y-2">
          <h4 className="text-base font-semibold">No Engagement Data Available</h4>
          <p className="text-muted-foreground text-sm">
            Community engagement statistics are not available for this region.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => window.open('https://www.mcsuk.org/what-you-can-do/join-a-beach-clean/', '_blank')}
        >
          <ExternalLink className="w-4 h-4 mr-2" />
          Get Involved
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <EngagementStats engagementData={regionData.engagementData} />

      {/* Call to Action */}
      <div className="p-4 rounded-lg border bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950/20 dark:to-blue-950/20">
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Join the Community</h4>
          <p className="text-sm text-muted-foreground">
            Help expand beach litter data by participating in local surveys and beach clean events.
          </p>
          <Button
            variant="outline"
            size="sm"
            className="mt-2"
            onClick={() => window.open('https://www.mcsuk.org/what-you-can-do/join-a-beach-clean/', '_blank')}
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Contribute Data
          </Button>
        </div>
      </div>
    </div>
  )
}
