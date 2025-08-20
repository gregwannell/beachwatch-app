import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

export async function GET() {
  try {
    const supabase = createServerClient()
    
    // Get min and max years from annual_region_aggregates table
    const { data, error } = await supabase
      .from('annual_region_aggregates')
      .select('year')
      .order('year', { ascending: true })
    
    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch available years', details: error.message },
        { status: 500 }
      )
    }
    
    const years = data?.map(row => row.year) || []
    const minYear = years.length > 0 ? Math.min(...years) : 2020
    const maxYear = years.length > 0 ? Math.max(...years) : 2024
    
    return NextResponse.json({
      minYear,
      maxYear,
      availableYears: years,
      count: years.length,
    })
    
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export const dynamic = 'force-dynamic'
export const revalidate = 86400 // 24 hours cache