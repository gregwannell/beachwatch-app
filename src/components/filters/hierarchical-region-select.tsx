'use client'

import * as React from "react"
import { Check, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { FilterRegion } from "@/types/filter-types"

interface HierarchicalRegionSelectProps {
  regions: FilterRegion[]
  selectedRegionId: number | null
  onRegionChange: (regionId: number | null) => void
  placeholder?: string
  className?: string
}

export function HierarchicalRegionSelect({
  regions,
  selectedRegionId,
  onRegionChange,
  className,
}: HierarchicalRegionSelectProps) {
  const [isExpanded, setIsExpanded] = React.useState(false)
  const [searchValue, setSearchValue] = React.useState("")

  // Group regions by country
  const groupedRegions = React.useMemo(() => {
    const countries = regions.filter(region => region.type === 'Country' || region.type === 'Crown Dependency')
    const counties = regions.filter(region => region.type === 'County Unitary')

    // Group counties by their parent country
    const countiesMap = counties.reduce((acc, county) => {
      if (!acc[county.parent_id!]) {
        acc[county.parent_id!] = []
      }
      acc[county.parent_id!].push(county)
      return acc
    }, {} as Record<number, FilterRegion[]>)

    return countries.map(country => ({
      country,
      counties: countiesMap[country.id] || []
    }))
  }, [regions])

  // Filter based on search value
  const filteredGroups = React.useMemo(() => {
    if (!searchValue.trim()) {
      return groupedRegions
    }

    const term = searchValue.toLowerCase()
    return groupedRegions
      .map(group => ({
        country: group.country,
        counties: group.counties.filter(county =>
          county.name.toLowerCase().includes(term) ||
          group.country.name.toLowerCase().includes(term)
        )
      }))
      .filter(group =>
        group.country.name.toLowerCase().includes(term) ||
        group.counties.length > 0
      )
  }, [groupedRegions, searchValue])

  const handleRegionSelect = (regionId: number) => {
    onRegionChange(regionId)
    setIsExpanded(false)
    setSearchValue("")
  }

  const selectedRegion = regions.find(r => r.id === selectedRegionId)
  // Default to "United Kingdom" when nothing selected or region ID is 1
  const displayValue = selectedRegion && selectedRegionId !== 1
    ? selectedRegion.name
    : "United Kingdom"

  return (
    <div className={cn("space-y-2", className)}>
      {/* Trigger Button */}
      <Button
        variant="outline"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full h-auto py-3 px-4 border rounded-lg justify-between hover:bg-accent/50"
      >
        <span className="text-sm font-medium text-foreground">Region</span>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">{displayValue}</span>
          <ChevronDown className={cn(
            "h-4 w-4 shrink-0 opacity-50 transition-transform",
            isExpanded && "rotate-180"
          )} />
        </div>
      </Button>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="border rounded-lg overflow-hidden bg-background">
          {/* Search Input */}
          <div className="p-2 border-b">
            <Input
              type="text"
              placeholder="Search regions..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="h-9"
            />
          </div>

          {/* Scrollable Region List */}
          <div className="max-h-[300px] overflow-y-auto">
            {filteredGroups.length === 0 ? (
              <div className="p-4 text-sm text-center text-muted-foreground">
                No region found.
              </div>
            ) : (
              <Accordion type="multiple" className="w-full p-2">
                {filteredGroups.map(({ country, counties }) => (
                  <AccordionItem key={country.id} value={`country-${country.id}`} className="border-0">
                    {counties.length > 0 ? (
                      <>
                        {/* Country row - split into selection button and accordion trigger */}
                        <div className="flex items-center">
                          {/* Country selection button */}
                          <Button
                            variant="ghost"
                            onClick={() => handleRegionSelect(country.id)}
                            className={cn(
                              "flex-1 justify-start h-auto py-2 px-3 rounded-none hover:bg-accent/50",
                              selectedRegionId === country.id && "bg-accent"
                            )}
                          >
                            <div className="flex items-center gap-2 w-full">
                              {selectedRegionId === country.id && (
                                <Check className="h-4 w-4 text-primary shrink-0" />
                              )}
                              <span className="font-medium text-left flex-1">{country.name}</span>
                              <Badge variant="secondary" className="text-xs">
                                {counties.length}
                              </Badge>
                            </div>
                          </Button>
                          {/* Accordion trigger - uses built-in chevron */}
                          <AccordionTrigger className="px-3 py-2 hover:no-underline hover:bg-accent/50" />
                        </div>

                        {/* Counties List */}
                        <AccordionContent className="pb-0">
                          <div className="border-l-2 ml-3 pl-3 space-y-0.5 pb-1">
                            {counties.map((county) => (
                              <Button
                                key={county.id}
                                variant="ghost"
                                onClick={() => handleRegionSelect(county.id)}
                                className={cn(
                                  "w-full justify-start h-auto py-1.5 px-2 text-sm hover:bg-accent/50",
                                  selectedRegionId === county.id && "bg-accent"
                                )}
                              >
                                <div className="flex items-center gap-2 w-full">
                                  {selectedRegionId === county.id && (
                                    <Check className="h-3 w-3 text-primary shrink-0" />
                                  )}
                                  <span className="text-left flex-1">{county.name}</span>
                                </div>
                              </Button>
                            ))}
                          </div>
                        </AccordionContent>
                      </>
                    ) : (
                      /* Country without counties - just a button */
                      <Button
                        variant="ghost"
                        onClick={() => handleRegionSelect(country.id)}
                        className={cn(
                          "w-full justify-start h-auto py-2 px-3 rounded-none hover:bg-accent/50",
                          selectedRegionId === country.id && "bg-accent"
                        )}
                      >
                        <div className="flex items-center gap-2 w-full">
                          {selectedRegionId === country.id && (
                            <Check className="h-4 w-4 text-primary shrink-0" />
                          )}
                          <span className="font-medium text-left flex-1">{country.name}</span>
                        </div>
                      </Button>
                    )}
                  </AccordionItem>
                ))}
              </Accordion>
            )}
          </div>
        </div>
      )}
    </div>
  )
}