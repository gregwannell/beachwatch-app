'use client'

import * as React from 'react'
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  type ColumnDef,
  type Column,
  type SortingState,
  type Row,
} from '@tanstack/react-table'
import { ArrowUpDown, ArrowUp, ArrowDown, MapPin } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { YearOverYearBadge } from '@/components/region-stats/components/year-over-year-badge'
import { cn } from '@/lib/utils'
import { formatNumber, formatBeachLength, formatWeight } from '@/lib/format-number'
import { useChildRegionStats, type ChildRegionStat } from '@/hooks/use-child-region-stats'
import type { RegionData } from '@/types/region-types'

interface RegionsTabProps {
  regionData: RegionData
  selectedYear?: number
  onRegionSelect?: (regionId: string) => void
}

function SortableHeader({
  column,
  label,
}: {
  column: Column<ChildRegionStat>
  label: string
}) {
  const sorted = column.getIsSorted()
  return (
    <button
      className="flex items-center gap-1 hover:text-foreground transition-colors"
      onClick={() => column.toggleSorting(sorted === 'asc')}
    >
      {label}
      {sorted === 'asc' ? (
        <ArrowUp className="w-3 h-3" />
      ) : sorted === 'desc' ? (
        <ArrowDown className="w-3 h-3" />
      ) : (
        <ArrowUpDown className="w-3 h-3 opacity-50" />
      )}
    </button>
  )
}

function numericSortFn(
  a: Row<ChildRegionStat>,
  b: Row<ChildRegionStat>,
  getValue: (row: Row<ChildRegionStat>) => number | null
): number {
  const aVal = getValue(a) ?? Infinity
  const bVal = getValue(b) ?? Infinity
  return aVal - bVal
}

function pinnedStyle(column: Column<ChildRegionStat>): React.CSSProperties {
  return column.getIsPinned() === 'left'
    ? { left: `${column.getStart('left')}px` }
    : {}
}

export function RegionsTab({ regionData, selectedYear, onRegionSelect }: RegionsTabProps) {
  const { data: children, isLoading, isError } = useChildRegionStats(
    regionData.id,
    selectedYear
  )

  const withData = React.useMemo(() => children?.filter(c => c.hasData) ?? [], [children])
  const excludedCount = (children?.length ?? 0) - withData.length

  const [sorting, setSorting] = React.useState<SortingState>([
    { id: 'avgPer100m', desc: false },
  ])

  const columns: ColumnDef<ChildRegionStat>[] = [
    {
      id: 'rank',
      size: 36,
      header: '#',
      cell: ({ row, table }) => {
        const idx = table.getSortedRowModel().rows.findIndex(r => r.id === row.id)
        return (
          <span className="text-muted-foreground text-xs font-mono tabular-nums">{idx + 1}</span>
        )
      },
      enableSorting: false,
    },
    {
      accessorKey: 'name',
      size: 160,
      header: 'Region',
      cell: ({ row }) => (
        <span className={cn('font-medium text-xs', !row.original.hasData && 'text-muted-foreground')}>
          {row.original.name}
        </span>
      ),
      enableSorting: false,
    },
    {
      accessorKey: 'avgPer100m',
      header: ({ column }) => <SortableHeader column={column} label="Avg / 100m" />,
      cell: ({ row }) => {
        const val = row.original.avgPer100m
        return val != null ? (
          <div className="flex items-center gap-1.5">
            <span className="tabular-nums text-xs">{val.toFixed(1)}</span>
            <YearOverYearBadge change={row.original.avgPer100mYoY ?? undefined} variant="plain" className="text-[11px]"/>
          </div>
        ) : (
          <span className="text-muted-foreground">—</span>
        )
      },
      sortingFn: (a, b) => numericSortFn(a, b, r => r.original.avgPer100m),
    },
    {
      accessorKey: 'totalSurveys',
      header: ({ column }) => <SortableHeader column={column} label="Surveys" />,
      cell: ({ row }) => {
        const val = row.original.totalSurveys
        return val != null ? (
          <div className="flex items-center gap-1.5">
            <span className="tabular-nums">{formatNumber(val, 0)}</span>
            <YearOverYearBadge change={row.original.totalSurveysYoY ?? undefined} increaseIsGood variant="plain" className="text-[11px]" />
          </div>
        ) : (
          <span className="text-muted-foreground">—</span>
        )
      },
      sortingFn: (a, b) => numericSortFn(a, b, r => r.original.totalSurveys),
    },
    {
      accessorKey: 'totalVolunteers',
      header: ({ column }) => <SortableHeader column={column} label="Volunteers" />,
      cell: ({ row }) => {
        const val = row.original.totalVolunteers
        return val != null ? (
          <div className="flex items-center gap-1.5">
            <span className="tabular-nums">{formatNumber(val, 0)}</span>
            <YearOverYearBadge change={row.original.totalVolunteersYoY ?? undefined} increaseIsGood variant="plain" className="text-[11px]" />
          </div>
        ) : (
          <span className="text-muted-foreground">—</span>
        )
      },
      sortingFn: (a, b) => numericSortFn(a, b, r => r.original.totalVolunteers),
    },
    {
      accessorKey: 'totalLitter',
      header: ({ column }) => <SortableHeader column={column} label="Total litter" />,
      cell: ({ row }) => {
        const val = row.original.totalLitter
        return val != null ? (
          <span className="tabular-nums">{formatNumber(val, 0)}</span>
        ) : (
          <span className="text-muted-foreground">—</span>
        )
      },
      sortingFn: (a, b) => numericSortFn(a, b, r => r.original.totalLitter),
    },
    {
      accessorKey: 'totalWeightKg',
      header: ({ column }) => <SortableHeader column={column} label="Weight" />,
      cell: ({ row }) => {
        const val = row.original.totalWeightKg
        return val != null ? (
          <span className="tabular-nums">{formatWeight(val)}</span>
        ) : (
          <span className="text-muted-foreground">—</span>
        )
      },
      sortingFn: (a, b) => numericSortFn(a, b, r => r.original.totalWeightKg),
    },
    {
      accessorKey: 'totalLengthM',
      header: ({ column }) => <SortableHeader column={column} label="Coastline" />,
      cell: ({ row }) => {
        const m = row.original.totalLengthM
        return m != null ? (
          <span className="tabular-nums">{formatBeachLength(m)}</span>
        ) : (
          <span className="text-muted-foreground">—</span>
        )
      },
      sortingFn: (a, b) => numericSortFn(a, b, r => r.original.totalLengthM),
    },
  ]

  const table = useReactTable({
    data: withData,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    initialState: {
      columnPinning: { left: ['rank', 'name'] },
    },
  })

  if (isLoading) {
    return (
      <div className="space-y-1.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full rounded-md" />
        ))}
      </div>
    )
  }

  if (isError) {
    return (
      <p className="text-sm text-muted-foreground py-6 text-center">
        Failed to load region breakdown.
      </p>
    )
  }

  if (children?.length === 0 || withData.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center space-y-2">
        <MapPin className="w-5 h-5 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">
          Sub-region data for{' '}
          <span className="font-medium text-foreground">{regionData.name}</span>{' '}
          is not yet available.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Regional Breakdown</h3>
        {excludedCount > 0 && (
          <p className="text-xs text-muted-foreground">
            {excludedCount} {excludedCount === 1 ? 'region' : 'regions'} without data not shown.
          </p>
        )}
      </div>
      <div className="rounded-lg border overflow-auto max-h-[400px]">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map(headerGroup => (
              <TableRow key={headerGroup.id} className="hover:bg-transparent">
                {headerGroup.headers.map(header => {
                  const isPinned = header.column.getIsPinned()
                  return (
                    <TableHead
                      key={header.id}
                      style={pinnedStyle(header.column)}
                      className={cn(
                        'text-xs text-muted-foreground/50 h-9 px-3 bg-background sticky top-0 z-10',
                        isPinned && 'z-20',
                      )}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.map(row => (
              <TableRow
                key={row.id}
                onClick={() => {
                  if (row.original.hasData && onRegionSelect) {
                    onRegionSelect(row.original.id)
                  }
                }}
                className={cn(
                  'group text-xs',
                  row.original.hasData && onRegionSelect
                    ? 'cursor-pointer'
                    : 'opacity-50 cursor-default'
                )}
              >
                {row.getVisibleCells().map(cell => {
                  const isPinned = cell.column.getIsPinned()
                  return (
                    <TableCell
                      key={cell.id}
                      style={pinnedStyle(cell.column)}
                      className={cn(
                        'px-3 py-2.5',
                        isPinned && 'sticky z-10 bg-background group-hover:bg-accent',
                      )}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  )
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
