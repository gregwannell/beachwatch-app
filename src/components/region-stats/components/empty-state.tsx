import { Button } from "@/components/ui/button"
import { Waves, ExternalLink } from "lucide-react"

interface EmptyStateProps {
  regionName: string
}

export function EmptyState({ regionName }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-6 text-center gap-4">
      <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
        <Waves className="w-6 h-6 text-muted-foreground" />
      </div>

      <div className="space-y-1.5">
        <h4 className="text-base font-semibold">No surveys recorded</h4>
        <p className="text-sm text-muted-foreground">
          No beach litter surveys have ever been recorded for <strong>{regionName}</strong>.
        </p>
        <p className="text-xs text-muted-foreground pt-1">
          This may be because the region has no coastline, or it hasn&apos;t yet been included in the MCS survey programme.
        </p>
        <Button
          variant="outline"
          size="sm"
          className="mt-2"
          onClick={() => window.open('https://www.mcsuk.org/what-you-can-do/join-a-beach-clean/', '_blank')}
        >
          Get involved with beach surveys
          <ExternalLink className="w-3 h-3 ml-1.5" />
        </Button>
      </div>
    </div>
  )
}