import { Skeleton } from "@/components/ui/skeleton"

export function LoadingSkeleton() {
  return (
    <div className="space-y-0">
      {/* Gradient hero skeleton */}
      <div className="bg-gradient-to-br from-mcs-clear-blue/60 to-mcs-teal/60 px-6 pt-6 pb-14 space-y-4">
        <Skeleton className="h-5 w-48 mx-auto bg-white/20" />
        <Skeleton className="h-12 w-32 mx-auto bg-white/20" />
        <Skeleton className="h-4 w-56 mx-auto bg-white/20" />
      </div>

      {/* Tab strip skeleton */}
      <div className="mx-4 -mt-5 mb-2">
        <Skeleton className="h-12 w-full rounded-2xl" />
      </div>

      {/* KPI cards grid skeleton */}
      <div className="px-4 py-4 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Skeleton className="h-28 rounded-2xl" />
          <Skeleton className="h-28 rounded-2xl" />
          <Skeleton className="h-28 rounded-2xl" />
          <Skeleton className="h-28 rounded-2xl" />
        </div>

        {/* Insights skeleton */}
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-48 w-full rounded-2xl" />
        <Skeleton className="h-48 w-full rounded-2xl" />
      </div>
    </div>
  )
}