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
import { ChevronRight, ArrowUpDown, ArrowUp, ArrowDown, MapPin } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { formatNumber, formatBeachLength } from '@/lib/format-number'
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

// Pushes rows with no data to the bottom regardless of sort direction
function noDataLastSortFn(
  a: Row<ChildRegionStat>,
  b: Row<ChildRegionStat>,
  getValue: (row: Row<ChildRegionStat>) => number | null
): number {
  if (!a.original.hasData && !b.original.hasData) return 0
  if (!a.original.hasData) return 1
  if (!b.original.hasData) return -1
  const aVal = getValue(a) ?? Infinity
  const bVal = getValue(b) ?? Infinity
  return aVal - bVal
}

export function RegionsTab({ regionData, selectedYear, onRegionSelect }: RegionsTabProps) {
  const { data: children, isLoading, isError } = useChildRegionStats(
    regionData.id,
    selectedYear
  )

  const [sorting, setSorting] = React.useState<SortingState>([
    { id: 'avgPer100m', desc: false },
  ])

  const columns: ColumnDef<ChildRegionStat>[] = [
    {
      id: 'rank',
      header: '#',
      cell: ({ row, table }) => {
        const sorted = table.getSortedRowModel().rows
        const withData = sorted.filter(r => r.original.hasData)
        const idx = withData.findIndex(r => r.id === row.id)
        return idx >= 0 ? (
          <span className="text-muted-foreground text-xs font-mono tabular-nums">{idx + 1}</span>
        ) : null
      },
      enableSorting: false,
    },
    {
      accessorKey: 'name',
      header: 'Region',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <span className={cn('font-medium text-sm', !row.original.hasData && 'text-muted-foreground')}>
            {row.original.name}
          </span>
          {!row.original.hasData && (
            <Badge variant="secondary" className="text-xs px-1.5 py-0 h-4">
              No data
            </Badge>
          )}
        </div>
      ),
      enableSorting: false,
    },
    {
      accessorKey: 'avgPer100m',
      header: ({ column }) => <SortableHeader column={column} label="Avg / 100m" />,
      cell: ({ row }) => {
        const val = row.original.avgPer100m
        return val != null ? (
          <span className="tabular-nums">{val.toFixed(1)}</span>
        ) : (
          <span className="text-muted-foreground">—</span>
        )
      },
      sortingFn: (a, b) => noDataLastSortFn(a, b, r => r.original.avgPer100m),
    },
    {
      accessorKey: 'totalSurveys',
      header: ({ column }) => <SortableHeader column={column} label="Surveys" />,
      cell: ({ row }) => {
        const val = row.original.totalSurveys
        return val != null ? (
          <span className="tabular-nums">{formatNumber(val, 0)}</span>
        ) : (
          <span className="text-muted-foreground">—</span>
        )
      },
      sortingFn: (a, b) => noDataLastSortFn(a, b, r => r.original.totalSurveys),
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
      sortingFn: (a, b) => noDataLastSortFn(a, b, r => r.original.totalLengthM),
    },
    {
      id: 'navigate',
      header: '',
      cell: ({ row }) =>
        row.original.hasData ? (
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        ) : null,
      enableSorting: false,
    },
  ]

  const table = useReactTable({
    data: children ?? [],
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
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

  if (children?.length === 0) {
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
    <div className="rounded-lg border overflow-hidden">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map(headerGroup => (
            <TableRow key={headerGroup.id} className="hover:bg-transparent">
              {headerGroup.headers.map(header => (
                <TableHead
                  key={header.id}
                  className="text-xs text-muted-foreground h-9 px-3 first:w-8 last:w-6"
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(header.column.columnDef.header, header.getContext())}
                </TableHead>
              ))}
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
                'text-sm',
                row.original.hasData && onRegionSelect
                  ? 'cursor-pointer'
                  : 'opacity-50 cursor-default'
              )}
            >
              {row.getVisibleCells().map(cell => (
                <TableCell key={cell.id} className="px-3 py-2.5">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
