import { prisma } from '@/lib/prisma'
import { getClientIP, getTestIP } from '@/lib/geoip-utils'
import { NextResponse } from 'next/server'

export async function GET(request) {
  try {
    const startTime = performance.now()
    
    // Get client IP using utility function (no middleware needed)
    const clientIP = getClientIP(request)
    const testIP = getTestIP(clientIP)
    
    console.log('DB Lookup - Client IP:', clientIP, 'Test IP:', testIP)
    
    // Look up IP in database
    const geoData = await prisma.geoIPData.findUnique({
      where: { ip: testIP }
    })
    
    const fetchTime = performance.now() - startTime
    
    if (!geoData) {
      return NextResponse.json({
        success: false,
        message: 'IP not found in database',
        ip: testIP,
        originalIP: clientIP,
        location: null,
        fetchTime: Math.round(fetchTime),
        method: 'Database Lookup'
      })
    }
    
    return NextResponse.json({
      success: true,
      message: 'Location retrieved from database',
      ip: geoData.ip,
      originalIP: clientIP,
      location: {
        country: geoData.country,
        countryCode: geoData.countryCode,
        region: geoData.region,
        regionCode: geoData.regionCode,
        city: geoData.city,
        postalCode: geoData.postalCode,
        coordinates: geoData.latitude && geoData.longitude ? {
          lat: geoData.latitude,
          lng: geoData.longitude
        } : null,
        timezone: geoData.timezone,
        isp: geoData.isp,
        organization: geoData.organization,
        accuracy: geoData.accuracy
      },
      formatted: `${geoData.city || ''}${geoData.city && geoData.region ? ', ' : ''}${geoData.region || ''}${(geoData.city || geoData.region) && geoData.country ? ', ' : ''}${geoData.country || ''}`.trim() || 'Unknown location',
      fetchTime: Math.round(fetchTime),
      method: 'Database Lookup'
    })
    
  } catch (error) {
    console.error('Error in database GeoIP lookup:', error)
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
    
    console.log('DB Lookup - Provided IP:', ip)
    
    // Look up IP in database
    const geoData = await prisma.geoIPData.findUnique({
      where: { ip: ip }
    })
    
    const fetchTime = performance.now() - startTime
    
    if (!geoData) {
      return NextResponse.json({
        success: false,
        message: 'IP not found in database',
        ip: ip,
        location: null,
        fetchTime: Math.round(fetchTime),
        method: 'Database Lookup'
      })
    }
    
    return NextResponse.json({
      success: true,
      message: 'Location retrieved from database',
      ip: geoData.ip,
      location: {
        country: geoData.country,
        countryCode: geoData.countryCode,
        region: geoData.region,
        regionCode: geoData.regionCode,
        city: geoData.city,
        postalCode: geoData.postalCode,
        coordinates: geoData.latitude && geoData.longitude ? {
          lat: geoData.latitude,
          lng: geoData.longitude
        } : null,
        timezone: geoData.timezone,
        isp: geoData.isp,
        organization: geoData.organization,
        accuracy: geoData.accuracy
      },
      formatted: `${geoData.city || ''}${geoData.city && geoData.region ? ', ' : ''}${geoData.region || ''}${(geoData.city || geoData.region) && geoData.country ? ', ' : ''}${geoData.country || ''}`.trim() || 'Unknown location',
      fetchTime: Math.round(fetchTime),
      method: 'Database Lookup'
    })
    
  } catch (error) {
    console.error('Error in database GeoIP lookup:', error)
    return NextResponse.json({
      success: false,
      message: 'Internal server error',
      error: error.message
    }, { status: 500 })
  }
} 