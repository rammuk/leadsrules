import { NextResponse } from 'next/server'
import { getLocationFromIP, getClientIP, getDetailedLocation } from '@/lib/geoip'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const ip = searchParams.get('ip')
    
    // If no IP provided, try to get client IP
    let clientIP = ip || getClientIP(request.headers)
    
    console.log('clientIP', clientIP)

    // For development, if no IP is found, use a fallback IP
    if (!clientIP && process.env.NODE_ENV === 'development') {
      clientIP = '207.89.66.149' // Google's DNS as fallback for development
      console.log('Development mode: Using fallback IP:', clientIP)
    }
    
    if (!clientIP) {
      return NextResponse.json({ 
        error: 'No IP address provided and could not determine client IP',
        headers: Object.fromEntries(request.headers.entries())
      }, { status: 400 })
    }

    // Get basic location data
    const location = await getLocationFromIP(clientIP)
    
    if (!location) {
      return NextResponse.json({ 
        error: 'Could not determine location for this IP address' 
      }, { status: 404 })
    }

    // Get detailed location data
    const detailedLocation = await getDetailedLocation(clientIP)

    return NextResponse.json({
      ip: clientIP,
      location: detailedLocation,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Error in GeoIP lookup:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const body = await request.json()
    const { ip, targetLocation } = body
    
    if (!ip) {
      return NextResponse.json({ 
        error: 'IP address is required' 
      }, { status: 400 })
    }

    // For now, return a simple response
    return NextResponse.json({
      ip,
      location: {
        city: 'Test City',
        country: 'Test Country',
        region: 'Test Region',
        latitude: 0,
        longitude: 0,
        timezone: 'UTC',
        isLocal: false
      },
      timestamp: new Date().toISOString(),
      message: 'Test POST response'
    })

  } catch (error) {
    console.error('Error in GeoIP lookup:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
} 