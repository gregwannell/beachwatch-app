import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

export async function GET() {
  try {
    const supabase = createServerClient()
    
    // Get min and max years using raw SQL for efficiency
    const { data: minMaxData, error: minMaxError } = await supabase
      .rpc('exec_sql', { 
        sql: 'SELECT MIN(year) as min_year, MAX(year) as max_year FROM annual_region_aggregates' 
      })
    
    if (minMaxError) {
      // Fallback: try with a direct query that should work
      const { data: minData, error: minError } = await supabase
        .from('annual_region_aggregates')
        .select('year')
        .order('year', { ascending: true })
        .limit(1)
        .single()
      
      const { data: maxData, error: maxError } = await supabase
        .from('annual_region_aggregates')
        .select('year')
        .order('year', { ascending: false })
        .limit(1)
        .single()
      
      if (minError || maxError) {
        console.error('Database error:', minError || maxError)
        return NextResponse.json(
          { error: 'Failed to fetch available years' },
          { status: 500 }
        )
      }
      
      const minYear = parseInt(minData?.year) || 2020
      const maxYear = parseInt(maxData?.year) || 2024
      
      // Generate array of years from min to max
      const availableYears = []
      for (let year = minYear; year <= maxYear; year++) {
        availableYears.push(year)
      }
      
      return NextResponse.json({
        minYear,
        maxYear,
        availableYears,
        count: availableYears.length,
      })
    }
    
    const minYear = parseInt(minMaxData?.[0]?.min_year) || 2020
    const maxYear = parseInt(minMaxData?.[0]?.max_year) || 2024
    
    // Generate array of years from min to max
    const availableYears = []
    for (let year = minYear; year <= maxYear; year++) {
      availableYears.push(year)
    }
    
    return NextResponse.json({
      minYear,
      maxYear,
      availableYears,
      count: availableYears.length,
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