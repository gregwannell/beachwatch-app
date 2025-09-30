'use client'

import * as React from "react"
import { Check, ChevronDown, ChevronRight, Search } from "lucide-react"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
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
  const [searchTerm, setSearchTerm] = React.useState("")
  const [expandedCountries, setExpandedCountries] = React.useState<Set<number>>(new Set())

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

  // Filter based on search term
  const filteredGroups = React.useMemo(() => {
    if (!searchTerm.trim()) {
      return groupedRegions
    }

    const term = searchTerm.toLowerCase()
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
  }, [groupedRegions, searchTerm])

  // Auto-expand country if one of its counties is selected
  React.useEffect(() => {
    if (selectedRegionId) {
      const selectedRegion = regions.find(r => r.id === selectedRegionId)
      if (selectedRegion?.type === 'County Unitary' && selectedRegion.parent_id) {
        setExpandedCountries(prev => new Set([...prev, selectedRegion.parent_id!]))
      }
    }
  }, [selectedRegionId, regions])

  const toggleCountryExpansion = (countryId: number) => {
    setExpandedCountries(prev => {
      const newSet = new Set(prev)
      if (newSet.has(countryId)) {
        newSet.delete(countryId)
      } else {
        newSet.add(countryId)
      }
      return newSet
    })
  }

  const handleRegionSelect = (regionId: number) => {
    // Set the selected region (no toggle off behavior)
    onRegionChange(regionId)
  }

  const selectedRegion = regions.find(r => r.id === selectedRegionId)
  const hasSelection = selectedRegionId !== null

  return (
    <div className={cn("space-y-3", className)}>
      {/* Search input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search regions..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Selected region display */}
      {hasSelection && (
        <div className="flex items-center gap-2 p-2 bg-primary/5 border border-primary/20 rounded-md">
          <Check className="h-4 w-4 text-primary" />
          <span className="font-medium text-sm">{selectedRegion?.name}</span>
          {selectedRegion?.parent_name && (
            <span className="text-xs text-muted-foreground">
              in {selectedRegion.parent_name}
            </span>
          )}
        </div>
      )}

      {/* Hierarchical region list */}
      <div className="space-y-1 max-h-64 overflow-y-auto">
        {filteredGroups.length === 0 ? (
          <div className="text-center py-4 text-sm text-muted-foreground">
            No regions found matching &ldquo;{searchTerm}&rdquo;
          </div>
        ) : (
          filteredGroups.map(({ country, counties }) => (
            <div key={country.id} className="space-y-1">
              <Collapsible
                open={expandedCountries.has(country.id)}
                onOpenChange={() => toggleCountryExpansion(country.id)}
              >
                <div className="flex items-center gap-1">
                  {/* Country selection button */}
                  <Button
                    variant={selectedRegionId === country.id ? "secondary" : "ghost"}
                    size="sm"
                    onClick={() => handleRegionSelect(country.id)}
                    className={cn(
                      "flex-1 justify-start h-8 px-2",
                      selectedRegionId === country.id && "bg-primary/10 border-primary/20"
                    )}
                  >
                    {selectedRegionId === country.id && (
                      <Check className="h-3 w-3 mr-2 text-primary" />
                    )}
                    <span className="font-medium">{country.name}</span>
                    {counties.length > 0 && (
                      <Badge variant="outline" className="ml-auto text-xs">
                        {counties.length}
                      </Badge>
                    )}
                  </Button>

                  {/* Expand/collapse trigger */}
                  {counties.length > 0 && (
                    <CollapsibleTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        {expandedCountries.has(country.id) ? (
                          <ChevronDown className="h-3 w-3" />
                        ) : (
                          <ChevronRight className="h-3 w-3" />
                        )}
                      </Button>
                    </CollapsibleTrigger>
                  )}
                </div>

                {/* Counties list */}
                {counties.length > 0 && (
                  <CollapsibleContent className="space-y-1">
                    <div className="ml-4 space-y-1">
                      {counties.map((county) => (
                        <Button
                          key={county.id}
                          variant={selectedRegionId === county.id ? "secondary" : "ghost"}
                          size="sm"
                          onClick={() => handleRegionSelect(county.id)}
                          className={cn(
                            "w-full justify-start h-7 px-2 text-sm",
                            selectedRegionId === county.id && "bg-primary/10 border-primary/20"
                          )}
                        >
                          {selectedRegionId === county.id && (
                            <Check className="h-3 w-3 mr-2 text-primary" />
                          )}
                          {county.name}
                        </Button>
                      ))}
                    </div>
                  </CollapsibleContent>
                )}
              </Collapsible>
            </div>
          ))
        )}
      </div>
    </div>
  )
}