import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import {
  validateRegionId,
  validateYearParams,
  createErrorResponse,
  createSuccessResponse,
  handleDatabaseError
} from '@/lib/analytics-validation'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerClient()
    const { searchParams } = new URL(request.url)

    const regionId = searchParams.get('regionId')
    const year = searchParams.get('year')

    // Validate regionId (required)
    if (!regionId) {
      return NextResponse.json(
        createErrorResponse('regionId is required'),
        { status: 400 }
      )
    }

    const regionValidation = validateRegionId(regionId)
    if (!regionValidation.isValid) {
      return NextResponse.json(
        createErrorResponse(regionValidation.error!),
        { status: 400 }
      )
    }

    // Validate optional year
    const yearValidation = validateYearParams(year, null, null)
    if (!yearValidation.isValid) {
      return NextResponse.json(
        createErrorResponse(yearValidation.error!),
        { status: 400 }
      )
    }

    const validatedRegionId = regionValidation.value!
    const validatedYear = yearValidation.years?.year ?? null

    const { data, error } = await supabase.rpc('get_region_panel_data', {
      p_region_id: validatedRegionId,
      p_year: validatedYear,
      p_uk_region_id: 1,
      p_top_n: 5
    })

    if (error) {
      const dbError = handleDatabaseError(error)
      return NextResponse.json(
        createErrorResponse(dbError.message),
        { status: dbError.status }
      )
    }

    const response = NextResponse.json(
      createSuccessResponse(data, 1)
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
