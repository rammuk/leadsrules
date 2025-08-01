import { getLocationFromAPI } from '@/lib/geoip-api'
import { getClientIP, getTestIP } from '@/lib/geoip-utils'
import { NextResponse } from 'next/server'

export async function GET(request) {
  try {
    const startTime = performance.now()

    // Get client IP using utility function (no middleware needed)
    const clientIP = getClientIP(request)
    const testIP = getTestIP(clientIP)
    
    console.log('API Lookup - Client IP:', clientIP, 'Test IP:', testIP)

    // Get location from MaxMind API
    const location = await getLocationFromAPI(testIP)

    const fetchTime = performance.now() - startTime

    if (!location) {
      return NextResponse.json({
        success: false,
        message: 'Unable to determine location from MaxMind API',
        ip: testIP,
        originalIP: clientIP,
        location: null,
        fetchTime: Math.round(fetchTime)
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Location retrieved from MaxMind Cloud API',
      ip: location.ip,
      originalIP: clientIP,
      location: {
        country: location.country,
        countryCode: location.countryCode,
        region: location.region,
        regionCode: location.regionCode,
        city: location.city,
        postalCode: location.postalCode,
        coordinates: location.latitude && location.longitude ? {
          lat: location.latitude,
          lng: location.longitude
        } : null,
        timezone: location.timezone,
        isp: location.isp,
        organization: location.organization,
        accuracy: location.accuracy
      },
      formatted: `${location.city || ''}${location.city && location.region ? ', ' : ''}${location.region || ''}${(location.city || location.region) && location.country ? ', ' : ''}${location.country || ''}`.trim() || 'Unknown location',
      fetchTime: Math.round(fetchTime),
      method: 'MaxMind Cloud API'
    })

  } catch (error) {
    console.error('Error in MaxMind API lookup:', error)
    return NextResponse.json({
      success: false,
      message: 'Internal server error',
      error: error.message
    }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const startTime = performance.now()
    const body = await request.json()
    const { ip } = body

    if (!ip) {
      return NextResponse.json({
        success: false,
        message: 'IP address is required'
      }, { status: 400 })
    }

    console.log('API Lookup - Provided IP:', ip)

    // Get location from MaxMind API
    const location = await getLocationFromAPI(ip)

    const fetchTime = performance.now() - startTime

    if (!location) {
      return NextResponse.json({
        success: false,
        message: 'Unable to determine location from MaxMind API',
        ip: ip,
        location: null,
        fetchTime: Math.round(fetchTime)
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Location retrieved from MaxMind Cloud API',
      ip: location.ip,
      location: {
        country: location.country,
        countryCode: location.countryCode,
        region: location.region,
        regionCode: location.regionCode,
        city: location.city,
        postalCode: location.postalCode,
        coordinates: location.latitude && location.longitude ? {
          lat: location.latitude,
          lng: location.longitude
        } : null,
        timezone: location.timezone,
        isp: location.isp,
        organization: location.organization,
        accuracy: location.accuracy
      },
      formatted: `${location.city || ''}${location.city && location.region ? ', ' : ''}${location.region || ''}${(location.city || location.region) && location.country ? ', ' : ''}${location.country || ''}`.trim() || 'Unknown location',
      fetchTime: Math.round(fetchTime),
      method: 'MaxMind Cloud API'
    })

  } catch (error) {
    console.error('Error in MaxMind API lookup:', error)
    return NextResponse.json({
      success: false,
      message: 'Internal server error',
      error: error.message
    }, { status: 500 })
  }
} 