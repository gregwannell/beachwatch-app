'use client'

import * as React from "react"
import { Check, Minus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { CategoryFilter } from "@/types/filter-types"

interface CategoryOption {
  id: string
  label: string
}

interface CategoryGroup {
  key: keyof CategoryFilter
  title: string
  options: CategoryOption[]
}

interface CategoryCheckboxesProps {
  value: CategoryFilter
  onChange: (value: CategoryFilter) => void
  availableCategories: {
    materials: CategoryOption[]
    sources: CategoryOption[]
  }
  className?: string
}

export function CategoryCheckboxes({
  value,
  onChange,
  availableCategories,
  className,
}: CategoryCheckboxesProps) {
  const groups: CategoryGroup[] = [
    {
      key: 'materials',
      title: 'Material Types',
      options: availableCategories.materials,
    },
    {
      key: 'sources',
      title: 'Litter Sources',
      options: availableCategories.sources,
    },
  ]

  const handleItemToggle = (groupKey: keyof CategoryFilter, itemId: string) => {
    const currentItems = value[groupKey]
    const isSelected = currentItems.includes(itemId)
    
    const newItems = isSelected
      ? currentItems.filter(id => id !== itemId)
      : [...currentItems, itemId]
    
    onChange({
      ...value,
      [groupKey]: newItems,
    })
  }

  const handleSelectAll = (groupKey: keyof CategoryFilter) => {
    const group = groups.find(g => g.key === groupKey)
    if (!group) return
    
    const allIds = group.options.map(option => option.id)
    onChange({
      ...value,
      [groupKey]: allIds,
    })
  }

  const handleSelectNone = (groupKey: keyof CategoryFilter) => {
    onChange({
      ...value,
      [groupKey]: [],
    })
  }

  const getGroupState = (groupKey: keyof CategoryFilter) => {
    const group = groups.find(g => g.key === groupKey)
    if (!group) return 'none'
    
    const selectedCount = value[groupKey].length
    const totalCount = group.options.length
    
    if (selectedCount === 0) return 'none'
    if (selectedCount === totalCount) return 'all'
    return 'some'
  }

  return (
    <div className={className}>
      {groups.map((group, index) => {
        const groupState = getGroupState(group.key)
        const selectedCount = value[group.key].length
        const totalCount = group.options.length

        return (
          <Card key={group.key}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">
                  {group.title}
                </CardTitle>
                <div className="text-xs text-muted-foreground">
                  {selectedCount}/{totalCount} selected
                </div>
              </div>
              
              {/* Select All/None controls */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleSelectAll(group.key)}
                  disabled={groupState === 'all'}
                  className="h-7 text-xs"
                >
                  <Check className="h-3 w-3 mr-1" />
                  All
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleSelectNone(group.key)}
                  disabled={groupState === 'none'}
                  className="h-7 text-xs"
                >
                  <Minus className="h-3 w-3 mr-1" />
                  None
                </Button>
              </div>
            </CardHeader>

            <CardContent className="pt-0">
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {group.options.map((option) => {
                  const isSelected = value[group.key].includes(option.id)
                  
                  return (
                    <div key={option.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`${group.key}-${option.id}`}
                        checked={isSelected}
                        onCheckedChange={() => handleItemToggle(group.key, option.id)}
                      />
                      <Label
                        htmlFor={`${group.key}-${option.id}`}
                        className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        {option.label}
                      </Label>
                    </div>
                  )
                })}
              </div>
              
              {group.options.length === 0 && (
                <div className="text-xs text-muted-foreground text-center py-4">
                  No {group.title.toLowerCase()} available
                </div>
              )}
            </CardContent>
            
            {/* Add separator between groups (except last one) */}
            {index < groups.length - 1 && (
              <div className="px-6 pb-4">
                <Separator />
              </div>
            )}
          </Card>
        )
      })}
      
      {/* Summary at bottom */}
      {(value.materials.length > 0 || value.sources.length > 0) && (
        <Card className="mt-4">
          <CardContent className="p-3">
            <div className="text-xs text-muted-foreground">
              <div className="font-medium mb-1">Active Filters:</div>
              <div className="space-y-1">
                {value.materials.length > 0 && (
                  <div>Materials: {value.materials.length} selected</div>
                )}
                {value.sources.length > 0 && (
                  <div>Sources: {value.sources.length} selected</div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}