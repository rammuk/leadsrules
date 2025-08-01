const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function showGeoIPStats() {
  try {
    console.log('📊 GeoIP Database Statistics')
    console.log('============================')
    
    // Total count
    const totalCount = await prisma.geoIPData.count()
    console.log(`\n📈 Total records: ${totalCount.toLocaleString()}`)
    
    // Countries
    const countries = await prisma.geoIPData.groupBy({
      by: ['country'],
      _count: {
        country: true
      },
      orderBy: {
        _count: {
          country: 'desc'
        }
      },
      take: 10
    })
    
    console.log('\n🌍 Top 10 Countries:')
    countries.forEach((country, index) => {
      if (country.country) {
        console.log(`   ${index + 1}. ${country.country}: ${country._count.country.toLocaleString()} IPs`)
      }
    })
    
    // Cities
    const cities = await prisma.geoIPData.groupBy({
      by: ['city'],
      _count: {
        city: true
      },
      orderBy: {
        _count: {
          city: 'desc'
        }
      },
      take: 10,
      where: {
        city: {
          not: null
        }
      }
    })
    
    console.log('\n🏙️ Top 10 Cities:')
    cities.forEach((city, index) => {
      if (city.city) {
        console.log(`   ${index + 1}. ${city.city}: ${city._count.city.toLocaleString()} IPs`)
      }
    })
    
    // Regions
    const regions = await prisma.geoIPData.groupBy({
      by: ['region'],
      _count: {
        region: true
      },
      orderBy: {
        _count: {
          region: 'desc'
        }
      },
      take: 10,
      where: {
        region: {
          not: null
        }
      }
    })
    
    console.log('\n🗺️ Top 10 Regions:')
    regions.forEach((region, index) => {
      if (region.region) {
        console.log(`   ${index + 1}. ${region.region}: ${region._count.region.toLocaleString()} IPs`)
      }
    })
    
    // Data quality stats
    const withCity = await prisma.geoIPData.count({
      where: {
        city: {
          not: null
        }
      }
    })
    
    const withRegion = await prisma.geoIPData.count({
      where: {
        region: {
          not: null
        }
      }
    })
    
    const withCoordinates = await prisma.geoIPData.count({
      where: {
        latitude: {
          not: null
        },
        longitude: {
          not: null
        }
      }
    })
    
    console.log('\n📋 Data Quality:')
    console.log(`   Cities: ${withCity.toLocaleString()} (${((withCity / totalCount) * 100).toFixed(1)}%)`)
    console.log(`   Regions: ${withRegion.toLocaleString()} (${((withRegion / totalCount) * 100).toFixed(1)}%)`)
    console.log(`   Coordinates: ${withCoordinates.toLocaleString()} (${((withCoordinates / totalCount) * 100).toFixed(1)}%)`)
    
    // Sample diverse IPs
    console.log('\n🎯 Sample Diverse IPs:')
    const samples = await prisma.geoIPData.findMany({
      take: 10,
      orderBy: {
        createdAt: 'desc'
      },
      where: {
        city: {
          not: null
        }
      }
    })
    
    samples.forEach((record, index) => {
      console.log(`   ${index + 1}. ${record.ip} → ${record.city}, ${record.region || 'N/A'}, ${record.country}`)
    })
    
    // Performance test
    console.log('\n⚡ Performance Test:')
    const startTime = Date.now()
    const testResult = await prisma.geoIPData.findUnique({
      where: { ip: '8.8.8.8' }
    })
    const endTime = Date.now()
    console.log(`   Database lookup time: ${endTime - startTime}ms`)
    console.log(`   Test IP result: ${testResult ? 'Found' : 'Not found'}`)
    
  } catch (error) {
    console.error('❌ Error getting stats:', error)
  } finally {
    await prisma.$disconnect()
  }
}

showGeoIPStats() 