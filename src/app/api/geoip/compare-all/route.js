import { getLocationFromIP } from '@/lib/geoip'
import { getLocationFromAPI } from '@/lib/geoip-api'
import { postgresqlGeoIP } from '@/lib/geoip-postgresql'

import { getClientIP, getTestIP } from '@/lib/geoip-utils'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET(request) {
  try {
    const startTime = performance.now()

    // Get client IP using utility function (no middleware needed)
    const clientIP = getClientIP(request)
    const testIP = getTestIP(clientIP)
    
    console.log('Compare All - Client IP:', clientIP, 'Test IP:', testIP)

    const results = {
      ip: testIP,
      originalIP: clientIP,
      localDatabase: { status: 'disabled', fetchTime: 0, error: null },
      maxmindApi: { status: 'disabled', fetchTime: 0, error: null },
      postgresqlDatabase: { status: 'disabled', fetchTime: 0, error: null },
      comparison: { fastestMethod: 'N/A', timeDifference: 0 },
      totalTime: 0
    }

    // Test local database method (if available)
    try {
      const localStart = performance.now()
      const localLocation = await getLocationFromIP(testIP)
      const localTime = performance.now() - localStart




      results.localDatabase = {
        status: localLocation ? 'success' : 'no_data',
        fetchTime: Math.round(localTime),
        data: localLocation,
        error: null
      }
    } catch (error) {
      results.localDatabase = {
        status: 'error',
        fetchTime: 0,
        data: null,
        error: error.message
      }
    }

    // Test MaxMind API method
    try {
      const apiStart = performance.now()
      const apiLocation = await getLocationFromAPI(testIP)
      const apiTime = performance.now() - apiStart

      results.maxmindApi = {
        status: apiLocation ? 'success' : 'no_data',
        fetchTime: Math.round(apiTime),
        data: apiLocation,
        error: null
      }
    } catch (error) {
      results.maxmindApi = {
        status: 'error',
        fetchTime: 0,
        data: null,
        error: error.message
      }
    }

    // Test PostgreSQL database method
    try {
      const postgresqlStart = performance.now()
      const postgresqlLocation = await postgresqlGeoIP.lookup(testIP)
      const postgresqlTime = performance.now() - postgresqlStart

      results.postgresqlDatabase = {
        status: postgresqlLocation.status,
        fetchTime: postgresqlLocation.fetchTime,
        data: postgresqlLocation.data,
        error: postgresqlLocation.error
      }
    } catch (error) {
      results.postgresqlDatabase = {
        status: 'error',
        fetchTime: 0,
        data: null,
        error: error.message
      }
    }

    // Compare results and find fastest
    const successfulMethods = []
    
    if (results.localDatabase.status === 'success') {
      successfulMethods.push({ name: 'Local Database', time: results.localDatabase.fetchTime })
    }
    if (results.maxmindApi.status === 'success') {
      successfulMethods.push({ name: 'MaxMind API', time: results.maxmindApi.fetchTime })
    }
    if (results.postgresqlDatabase.status === 'success') {
      successfulMethods.push({ name: 'PostgreSQL Database', time: results.postgresqlDatabase.fetchTime })
    }
   


    if (successfulMethods.length > 0) {
      const fastest = successfulMethods.reduce((prev, current) => 
        (prev.time < current.time) ? prev : current
      )
      results.comparison.fastestMethod = fastest.name
      
      // Calculate time difference from fastest
      successfulMethods.forEach(method => {
        if (method.name !== fastest.name) {
          results.comparison.timeDifference = Math.max(
            results.comparison.timeDifference,
            method.time - fastest.time
          )
        }
      })
    }

    results.totalTime = Math.round(performance.now() - startTime)

    return NextResponse.json({
      success: true,
      message: 'All method comparison completed',
      ...results
    })

  } catch (error) {
    console.error('Error in all method comparison:', error)
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

    console.log('Compare All - Provided IP:', ip)

    const results = {
      ip: ip,
      originalIP: ip,
      localDatabase: { status: 'disabled', fetchTime: 0, error: null },
      maxmindApi: { status: 'disabled', fetchTime: 0, error: null },
      postgresqlDatabase: { status: 'disabled', fetchTime: 0, error: null },
      comparison: { fastestMethod: 'N/A', timeDifference: 0 },
      totalTime: 0
    }

    // Test local database method (if available)
    try {
      const localStart = performance.now()
      const localLocation = await getLocationFromIP(ip)
      const localTime = performance.now() - localStart

      results.localDatabase = {
        status: localLocation ? 'success' : 'no_data',
        fetchTime: Math.round(localTime),
        data: localLocation,
        error: null
      }
    } catch (error) {
      results.localDatabase = {
        status: 'error',
        fetchTime: 0,
        data: null,
        error: error.message
      }
    }

    // Test MaxMind API method
    try {
      const apiStart = performance.now()
      const apiLocation = await getLocationFromAPI(ip)
      const apiTime = performance.now() - apiStart
      
      console.log('apiLocation',apiLocation);
      

      results.maxmindApi = {
        status: apiLocation ? 'success' : 'no_data',
        fetchTime: Math.round(apiTime),
        data: apiLocation,
        error: null
      }
    } catch (error) {
      results.maxmindApi = {
        status: 'error',
        fetchTime: 0,
        data: null,
        error: error.message
      }
    }

    // Test PostgreSQL database method
    try {
      const postgresqlStart = performance.now()
      const postgresqlLocation = await postgresqlGeoIP.lookup(ip)
      const postgresqlTime = performance.now() - postgresqlStart

      results.postgresqlDatabase = {
        status: postgresqlLocation.status,
        fetchTime: postgresqlLocation.fetchTime,
        data: postgresqlLocation.data,
        error: postgresqlLocation.error
      }
    } catch (error) {
      results.postgresqlDatabase = {
        status: 'error',
        fetchTime: 0,
        data: null,
        error: error.message
      }
    }

    // Compare results and find fastest
    const successfulMethods = []
    
    if (results.localDatabase.status === 'success') {
      successfulMethods.push({ name: 'Local Database', time: results.localDatabase.fetchTime })
    }
    if (results.maxmindApi.status === 'success') {
      successfulMethods.push({ name: 'MaxMind API', time: results.maxmindApi.fetchTime })
    }
    if (results.postgresqlDatabase.status === 'success') {
      successfulMethods.push({ name: 'PostgreSQL Database', time: results.postgresqlDatabase.fetchTime })
    }
 


    if (successfulMethods.length > 0) {
      const fastest = successfulMethods.reduce((prev, current) => 
        (prev.time < current.time) ? prev : current
      )
      results.comparison.fastestMethod = fastest.name
      
      // Calculate time difference from fastest
      successfulMethods.forEach(method => {
        if (method.name !== fastest.name) {
          results.comparison.timeDifference = Math.max(
            results.comparison.timeDifference,
            method.time - fastest.time
          )
        }
      })
    }

    results.totalTime = Math.round(performance.now() - startTime)

    return NextResponse.json({
      success: true,
      message: 'All method comparison completed',
      ...results
    })

  } catch (error) {
    console.error('Error in all method comparison:', error)
    return NextResponse.json({
      success: false,
      message: 'Internal server error',
      error: error.message
    }, { status: 500 })
  }
} 