import { NextResponse } from 'next/server'
import { getLocationFromIP, getClientIP } from '@/lib/geoip'

/**
 * Simulate MaxMind API call with realistic timing and data
 */
async function simulateMaxMindAPI(ip) {
  const startTime = performance.now()
  
  // Simulate network latency (50-150ms)
  const networkLatency = Math.random() * 100 + 50
  await new Promise(resolve => setTimeout(resolve, networkLatency))
  
  // Simulate API processing time (10-30ms)
  const processingTime = Math.random() * 20 + 10
  await new Promise(resolve => setTimeout(resolve, processingTime))
  
  const endTime = performance.now()
  const totalTime = endTime - startTime
  
  // Simulate realistic MaxMind API response
  const mockLocation = {
    city: 'New York',
    country: 'United States',
    region: 'New York',
    latitude: 40.7128,
    longitude: -74.0060,
    timezone: 'America/New_York',
    postalCode: '10001',
    continent: 'North America',
    isLocal: false
  }
  
  return {
    location: mockLocation,
    lookupTime: totalTime,
    method: 'MaxMind API',
    status: 'success'
  }
}

/**
 * Test local database performance
 */
async function testLocalDatabase(ip) {
  const startTime = performance.now()
  
  try {
    const location = await getLocationFromIP(ip)
    const endTime = performance.now()
    const lookupTime = endTime - startTime
    
    return {
      location,
      lookupTime,
      method: 'Local Database',
      status: location ? 'success' : 'failed'
    }
  } catch (error) {
    const endTime = performance.now()
    return {
      location: null,
      lookupTime: endTime - startTime,
      method: 'Local Database',
      status: 'error',
      error: error.message
    }
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const ip = searchParams.get('ip')
    
    let clientIP = ip || getClientIP(request.headers)
    
    if (!clientIP && process.env.NODE_ENV === 'development') {
      clientIP = '207.89.66.149' // Fallback IP for development
    }
    
    if (!clientIP) {
      return NextResponse.json({ 
        error: 'No IP address provided and could not determine client IP'
      }, { status: 400 })
    }

    // Test both methods concurrently
    const [localResult, apiResult] = await Promise.all([
      testLocalDatabase(clientIP),
      simulateMaxMindAPI(clientIP)
    ])

    // Compare results
    const timeDifference = Math.abs(localResult.lookupTime - apiResult.lookupTime)
    const fasterMethod = localResult.lookupTime < apiResult.lookupTime ? 'Local Database' : 'MaxMind API'
    
    // Determine accuracy comparison
    let accuracy = 'Cannot compare - local database failed'
    if (localResult.location && apiResult.location) {
      const sameCity = localResult.location.city === apiResult.location.city
      const sameCountry = localResult.location.country === apiResult.location.country
      
      if (sameCity && sameCountry) {
        accuracy = 'Both methods returned identical data'
      } else if (sameCountry) {
        accuracy = 'Both methods returned same country, different city'
      } else {
        accuracy = 'Methods returned different data'
      }
    }

    const comparison = {
      fasterMethod,
      timeDifference: Math.round(timeDifference * 100) / 100,
      recommendation: fasterMethod === 'Local Database' 
        ? 'Use local database for better performance' 
        : 'Consider MaxMind API for more accurate data',
      accuracy
    }

    return NextResponse.json({
      ip: clientIP,
      localDatabase: localResult,
      maxmindApi: apiResult,
      comparison
    })

  } catch (error) {
    console.error('Error in GeoIP comparison:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 