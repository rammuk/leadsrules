import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  try {
    console.log('📊 Fetching production database statistics...')
    
    // Get basic counts
    const geoipCount = await prisma.geoIPData.count()
    const websiteCount = await prisma.website.count()
    const questionnaireCount = await prisma.questionnaire.count()
    const questionBankCount = await prisma.questionBank.count()
    
    // Get sample records
    const sampleRecords = await prisma.geoIPData.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      select: {
        ip: true,
        city: true,
        region: true,
        country: true
      }
    })
    
    // Get top countries
    const topCountries = await prisma.geoIPData.groupBy({
      by: ['country'],
      _count: { country: true },
      orderBy: { _count: { country: 'desc' } },
      take: 10
    })
    
    // Get top cities
    const topCities = await prisma.geoIPData.groupBy({
      by: ['city'],
      _count: { city: true },
      orderBy: { _count: { city: 'desc' } },
      take: 10,
      where: {
        city: { not: null }
      }
    })
    
    // Get data quality stats
    const withCity = await prisma.geoIPData.count({
      where: { city: { not: null } }
    })
    const withRegion = await prisma.geoIPData.count({
      where: { region: { not: null } }
    })
    const withCoords = await prisma.geoIPData.count({
      where: { 
        latitude: { not: null },
        longitude: { not: null }
      }
    })
    
    const stats = {
      geoipCount,
      websiteCount,
      questionnaireCount,
      questionBankCount,
      withCity,
      withRegion,
      withCoords
    }
    
    console.log(`✅ Fetched stats: ${geoipCount.toLocaleString()} GeoIP records`)
    
    return NextResponse.json({
      stats,
      sampleRecords,
      topCountries: topCountries.map(c => ({ country: c.country, count: c._count.country })),
      topCities: topCities.map(c => ({ city: c.city, count: c._count.city }))
    })
    
  } catch (error) {
    console.error('❌ Error fetching database stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch database statistics' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
} 