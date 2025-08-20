// Simple validation utilities for analytics API routes
// Following existing app patterns without complex schema libraries

export interface ValidationResult {
  isValid: boolean
  error?: string
}

export interface YearRangeValidation {
  startYear?: number
  endYear?: number
  year?: number
}

/**
 * Validate region ID parameter
 */
export function validateRegionId(regionId: string | null): ValidationResult & { value?: number } {
  if (!regionId) {
    return { isValid: false, error: 'Region ID is required' }
  }
  
  const parsed = parseInt(regionId)
  if (isNaN(parsed) || parsed <= 0) {
    return { isValid: false, error: 'Invalid region ID format' }
  }
  
  return { isValid: true, value: parsed }
}

/**
 * Validate year parameters
 */
export function validateYearParams(
  year?: string | null,
  startYear?: string | null,
  endYear?: string | null
): ValidationResult & { years?: YearRangeValidation } {
  const currentYear = new Date().getFullYear()
  const minYear = 2000 // Reasonable minimum year for beach litter data
  
  // Single year validation
  if (year) {
    const parsedYear = parseInt(year)
    if (isNaN(parsedYear) || parsedYear < minYear || parsedYear > currentYear) {
      return { 
        isValid: false, 
        error: `Invalid year: must be between ${minYear} and ${currentYear}` 
      }
    }
    return { isValid: true, years: { year: parsedYear } }
  }
  
  // Year range validation
  if (startYear || endYear) {
    const result: YearRangeValidation = {}
    
    if (startYear) {
      const parsedStart = parseInt(startYear)
      if (isNaN(parsedStart) || parsedStart < minYear || parsedStart > currentYear) {
        return { 
          isValid: false, 
          error: `Invalid start year: must be between ${minYear} and ${currentYear}` 
        }
      }
      result.startYear = parsedStart
    }
    
    if (endYear) {
      const parsedEnd = parseInt(endYear)
      if (isNaN(parsedEnd) || parsedEnd < minYear || parsedEnd > currentYear) {
        return { 
          isValid: false, 
          error: `Invalid end year: must be between ${minYear} and ${currentYear}` 
        }
      }
      result.endYear = parsedEnd
    }
    
    // Validate range logic
    if (result.startYear && result.endYear && result.startYear > result.endYear) {
      return { 
        isValid: false, 
        error: 'Start year cannot be greater than end year' 
      }
    }
    
    return { isValid: true, years: result }
  }
  
  // No year parameters provided is valid
  return { isValid: true }
}

/**
 * Validate limit parameter
 */
export function validateLimit(limit: string | null): ValidationResult & { value?: number } {
  if (!limit) {
    return { isValid: true } // No limit is valid
  }
  
  const parsed = parseInt(limit)
  if (isNaN(parsed) || parsed <= 0) {
    return { isValid: false, error: 'Invalid limit: must be a positive number' }
  }
  
  if (parsed > 1000) {
    return { isValid: false, error: 'Limit too large: maximum is 1000' }
  }
  
  return { isValid: true, value: parsed }
}

/**
 * Create standardized error response
 */
export function createErrorResponse(message: string, status: number = 400) {
  return {
    error: message,
    timestamp: new Date().toISOString()
  }
}

/**
 * Create standardized success response
 */
export function createSuccessResponse<T>(data: T, count?: number) {
  return {
    data,
    count: count ?? (Array.isArray(data) ? data.length : 1),
    timestamp: new Date().toISOString()
  }
}

/**
 * Handle common database errors
 */
export function handleDatabaseError(error: any): { message: string, status: number } {
  // Log the full error for debugging
  console.error('Database error:', error)
  
  // Return user-friendly message based on error type
  if (error.message?.includes('relation') && error.message?.includes('does not exist')) {
    return { message: 'Database configuration error', status: 503 }
  }
  
  if (error.message?.includes('timeout') || error.message?.includes('connection')) {
    return { message: 'Database connection error', status: 503 }
  }
  
  if (error.code === '23503') { // Foreign key violation
    return { message: 'Referenced data not found', status: 404 }
  }
  
  // Generic database error
  return { message: 'Failed to fetch data', status: 500 }
}