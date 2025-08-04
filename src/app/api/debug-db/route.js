import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    console.log('🔍 Debug: Testing database connection...')
    
    // Test basic connection
    const count = await prisma.geoIPData.count()
    console.log(`📊 Debug: Total records: ${count}`)
    
    // Test specific IP lookup
    const testIP = '8.8.8.8'
    const record = await prisma.geoIPData.findUnique({
      where: { ip: testIP }
    })
    console.log(`🔍 Debug: Looking for IP ${testIP}:`, record ? 'FOUND' : 'NOT FOUND')
    
    // Get sample records
    const samples = await prisma.geoIPData.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' }
    })
    
    return NextResponse.json({
      success: true,
      totalCount: count,
      testIP: testIP,
      testIPFound: !!record,
      testIPRecord: record,
      sampleRecords: samples,
      environment: process.env.NODE_ENV,
      databaseUrl: process.env.DATABASE_URL ? 'SET' : 'NOT SET',
      prismaDatabaseUrl: process.env.PRISMA_DATABASE_URL ? 'SET' : 'NOT SET'
    })
    
  } catch (error) {
    console.error('❌ Debug: Database error:', error)
    return NextResponse.json({
      success: false,
      error: error.message,
      environment: process.env.NODE_ENV,
      databaseUrl: process.env.DATABASE_URL ? 'SET' : 'NOT SET',
      prismaDatabaseUrl: process.env.PRISMA_DATABASE_URL ? 'SET' : 'NOT SET'
    }, { status: 500 })
  }
} 