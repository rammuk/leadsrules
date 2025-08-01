import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const ip = searchParams.get('ip')
    
    if (!ip) {
      return NextResponse.json(
        { error: 'IP address is required' },
        { status: 400 }
      )
    }
    
    console.log(`🔍 Searching for IP: ${ip}`)
    
    // Search for the IP in the database
    const record = await prisma.geoIPData.findUnique({
      where: { ip: ip },
      select: {
        ip: true,
        country: true,
        countryCode: true,
        region: true,
        regionCode: true,
        city: true,
        postalCode: true,
        latitude: true,
        longitude: true,
        timezone: true,
        isp: true,
        organization: true,
        accuracy: true
      }
    })
    
    if (!record) {
      console.log(`❌ IP ${ip} not found in database`)
      return NextResponse.json(
        { error: `IP address ${ip} not found in database` },
        { status: 404 }
      )
    }
    
    console.log(`✅ Found IP ${ip}: ${record.city || 'N/A'}, ${record.country || 'N/A'}`)
    
    return NextResponse.json(record)
    
  } catch (error) {
    console.error('❌ Error searching IP:', error)
    return NextResponse.json(
      { error: 'Failed to search IP address' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
} 