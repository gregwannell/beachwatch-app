import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import {
  validateRegionId,
  validateYearParams,
  createErrorResponse,
  createSuccessResponse,
  handleDatabaseError
} from '@/lib/analytics-validation'

// Response types
interface PolicyItemBreakdown {
  policyItem: {
    id: number
    name: string
  }
  total: number
  avgPer100m: number
  presence: number
  yearOverYearChange?: number
}

interface PolicyItemsData {
  policyItems: PolicyItemBreakdown[]
  summary: {
    totalItems: number
    totalLitter: number
    avgPresence: number
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient()
    const { searchParams } = new URL(request.url)

    const regionId = searchParams.get('regionId')
    const year = searchParams.get('year')
    const startYear = searchParams.get('startYear')
    const endYear = searchParams.get('endYear')

    // Validate region ID if provided
    if (regionId) {
      const regionValidation = validateRegionId(regionId)
      if (!regionValidation.isValid) {
        return NextResponse.json(
          createErrorResponse(regionValidation.error!),
          { status: 400 }
        )
      }
    }

    // Validate year parameters
    const yearValidation = validateYearParams(year, startYear, endYear)
    if (!yearValidation.isValid) {
      return NextResponse.json(
        createErrorResponse(yearValidation.error!),
        { status: 400 }
      )
    }

    // Get the aggregate_id(s) for filtering
    let aggregateIdsQuery = supabase
      .from('annual_region_aggregates')
      .select('id')

    if (regionId) {
      const regionValidation = validateRegionId(regionId)
      if (regionValidation.isValid && regionValidation.value) {
        aggregateIdsQuery = aggregateIdsQuery.eq('region_id', regionValidation.value)
      }
    }

    const validatedYears = yearValidation.years
    const currentYear = validatedYears?.year

    if (validatedYears?.year) {
      aggregateIdsQuery = aggregateIdsQuery.eq('year', validatedYears.year)
    } else if (validatedYears?.startYear && validatedYears?.endYear) {
      aggregateIdsQuery = aggregateIdsQuery
        .gte('year', validatedYears.startYear)
        .lte('year', validatedYears.endYear)
    }

    const { data: aggregateIds, error: aggregateError } = await aggregateIdsQuery

    // Fetch previous year aggregate IDs for year-over-year comparison
    let previousYearAggregateIds: number[] = []
    if (currentYear && regionId) {
      const { data: prevAggregates } = await supabase
        .from('annual_region_aggregates')
        .select('id')
        .eq('region_id', parseInt(regionId))
        .eq('year', currentYear - 1)

      previousYearAggregateIds = prevAggregates?.map(agg => agg.id) || []
    }

    if (aggregateError) {
      const dbError = handleDatabaseError(aggregateError)
      return NextResponse.json(
        createErrorResponse(dbError.message),
        { status: dbError.status }
      )
    }

    if (!aggregateIds || aggregateIds.length === 0) {
      return NextResponse.json(
        createSuccessResponse<PolicyItemsData>({
          policyItems: [],
          summary: { totalItems: 0, totalLitter: 0, avgPresence: 0 }
        }, 0)
      )
    }

    const aggregateIdsList = aggregateIds.map(agg => agg.id)

    // Query policy aggregates
    const { data: policyAggregates, error: policyError } = await supabase
      .from('annual_policy_aggregates')
      .select('policy_item_id, total, avg_per_100m, presence')
      .in('aggregate_id', aggregateIdsList)

    if (policyError) {
      const dbError = handleDatabaseError(policyError)
      return NextResponse.json(
        createErrorResponse(dbError.message),
        { status: dbError.status }
      )
    }

    // Lookup policy item names
    const policyItemIds = [...new Set(policyAggregates?.map(agg => agg.policy_item_id) || [])]

    const { data: policyItems_lookup } = await supabase
      .from('policy_items')
      .select('id, policy_item')
      .in('id', policyItemIds)

    const policyItemsMap = new Map<number, string>(
      policyItems_lookup?.map(p => [p.id as number, p.policy_item as string]) || []
    )

    // Fetch previous year data for year-over-year comparison
    const previousYearPolicyItems: { [policyItemId: number]: number } = {}
    if (previousYearAggregateIds.length > 0) {
      const { data: prevPolicyAggregates } = await supabase
        .from('annual_policy_aggregates')
        .select('policy_item_id, avg_per_100m')
        .in('aggregate_id', previousYearAggregateIds)

      const prevGroups: { [policyItemId: number]: number[] } = {}
      prevPolicyAggregates?.forEach(agg => {
        if (!prevGroups[agg.policy_item_id]) {
          prevGroups[agg.policy_item_id] = []
        }
        prevGroups[agg.policy_item_id].push(agg.avg_per_100m)
      })

      Object.entries(prevGroups).forEach(([policyItemId, values]) => {
        previousYearPolicyItems[parseInt(policyItemId)] =
          values.reduce((sum, val) => sum + val, 0) / values.length
      })
    }

    // Group by policy item
    const policyGroups: { [policyItemId: number]: {
      total: number
      avgPer100m: number[]
      presence: number[]
    } } = {}

    policyAggregates?.forEach(agg => {
      const id = agg.policy_item_id
      if (!policyGroups[id]) {
        policyGroups[id] = { total: 0, avgPer100m: [], presence: [] }
      }
      policyGroups[id].total += agg.total
      policyGroups[id].avgPer100m.push(agg.avg_per_100m)
      policyGroups[id].presence.push(agg.presence)
    })

    // Calculate final breakdown with year-over-year changes, sorted by avg_per_100m desc
    const policyItems: PolicyItemBreakdown[] = Object.entries(policyGroups).map(([policyItemId, group]) => {
      const currentAvg = Math.round((group.avgPer100m.reduce((sum, val) => sum + val, 0) / group.avgPer100m.length) * 100) / 100
      const prevAvg = previousYearPolicyItems[parseInt(policyItemId)]

      let yearOverYearChange: number | undefined
      if (prevAvg !== undefined && prevAvg > 0) {
        yearOverYearChange = ((currentAvg - prevAvg) / prevAvg) * 100
      }

      return {
        policyItem: {
          id: parseInt(policyItemId),
          name: policyItemsMap.get(parseInt(policyItemId)) || 'Unknown'
        },
        total: group.total,
        avgPer100m: currentAvg,
        presence: Math.round((group.presence.reduce((sum, val) => sum + val, 0) / group.presence.length) * 100) / 100,
        yearOverYearChange
      }
    }).sort((a, b) => b.avgPer100m - a.avgPer100m)

    const totalLitter = policyItems.reduce((sum, item) => sum + item.total, 0)
    const avgPresence = policyItems.length > 0
      ? policyItems.reduce((sum, item) => sum + item.presence, 0) / policyItems.length
      : 0

    const responseData: PolicyItemsData = {
      policyItems,
      summary: {
        totalItems: policyItems.length,
        totalLitter,
        avgPresence: Math.round(avgPresence * 100) / 100
      }
    }

    const response = NextResponse.json(
      createSuccessResponse(responseData, policyItems.length)
    )

    response.headers.set('Cache-Control', 'public, s-maxage=900, stale-while-revalidate=1800')

    return response

  } catch (error) {
    console.error('Unexpected API error:', error)
    return NextResponse.json(
      createErrorResponse('Internal server error'),
      { status: 500 }
    )
  }
}

export const revalidate = 900
