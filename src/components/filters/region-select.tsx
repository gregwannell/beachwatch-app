'use client'

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { FilterRegion } from "@/types/filter-types"

interface RegionSelectProps {
  regions: FilterRegion[]
  selectedRegionId: number | null
  onRegionChange: (regionId: number | null) => void
  placeholder?: string
  className?: string
}

export function RegionSelect({
  regions,
  selectedRegionId,
  onRegionChange,
  placeholder = "Select region...",
  className,
}: RegionSelectProps) {
  const [open, setOpen] = React.useState(false)

  // Group regions by hierarchy for better display with hierarchical filtering
  const groupedRegions = React.useMemo(() => {
    const groups: { [key: string]: FilterRegion[] } = {
      'Countries': [],
      'Counties & Unitary Authorities': [],
    }

    // Determine filtering based on current selection
    const selectedRegion = regions.find(r => r.id === selectedRegionId)
    const filterParentId = selectedRegion?.type === 'Country'
      ? selectedRegion.id
      : selectedRegion?.parent_id

    regions.forEach(region => {
      if (region.type === 'Country') {
        // Always show countries, but when a county is selected, prioritize its parent
        groups['Countries'].push(region)
      } else if (region.type === 'County Unitary') {
        // Filter counties based on selection:
        // - If no selection: show all counties
        // - If country selected: show only counties from that country
        // - If county selected: show counties from the same parent country
        if (!filterParentId || region.parent_id === filterParentId) {
          groups['Counties & Unitary Authorities'].push(region)
        }
      }
    })

    // Remove empty groups
    Object.keys(groups).forEach(key => {
      if (groups[key].length === 0) {
        delete groups[key]
      }
    })

    return { groups, selectedRegion }
  }, [regions, selectedRegionId])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("justify-between", className)}
        >
          {groupedRegions.selectedRegion ? groupedRegions.selectedRegion.name : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
        <Command>
          <CommandInput placeholder="Search regions..." className="h-9" />
          <CommandList>
            <CommandEmpty>No regions found.</CommandEmpty>

            {/* Grouped regions */}
            {Object.entries(groupedRegions.groups).map(([groupName, groupRegions]) => {
              if (groupRegions.length === 0) return null
              
              return (
                <CommandGroup key={groupName} heading={groupName}>
                  {groupRegions.map((region) => (
                    <CommandItem
                      key={region.id}
                      value={`${region.name} ${region.type}`}
                      onSelect={() => {
                        onRegionChange(region.id === selectedRegionId ? null : region.id)
                        setOpen(false)
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          selectedRegionId === region.id ? "opacity-100" : "opacity-0"
                        )}
                      />
                      <div className="flex flex-col">
                        <span className="font-medium">{region.name}</span>
                        {region.parent_name && (
                          <span className="text-xs text-muted-foreground">
                            {region.parent_name}
                          </span>
                        )}
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )
            })}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}