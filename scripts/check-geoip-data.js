const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function checkGeoIPData() {
  try {
    console.log('🔍 Checking GeoIP data in database...')
    
    // Get total count
    const totalCount = await prisma.geoIPData.count()
    console.log(`📊 Total records in database: ${totalCount}`)
    
    if (totalCount === 0) {
      console.log('❌ No GeoIP data found in database')
      return
    }
    
    // Get sample records
    const sampleRecords = await prisma.geoIPData.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' }
    })
    
    console.log('\n📋 Sample records:')
    sampleRecords.forEach((record, index) => {
      console.log(`${index + 1}. IP: ${record.ip}`)
      console.log(`   Location: ${record.city || 'N/A'}, ${record.region || 'N/A'}, ${record.country || 'N/A'}`)
      console.log(`   Coordinates: ${record.latitude}, ${record.longitude}`)
      console.log(`   ISP: ${record.isp || 'N/A'}`)
      console.log(`   Created: ${record.createdAt}`)
      console.log('')
    })
    
    // Check specific test IPs
    const testIPs = ['8.8.8.8', '1.1.1.1', '208.67.222.222', '142.250.191.78']
    
    console.log('🎯 Checking specific test IPs:')
    for (const ip of testIPs) {
      const record = await prisma.geoIPData.findUnique({
        where: { ip: ip }
      })
      
      if (record) {
        console.log(`✅ ${ip}: ${record.city || 'N/A'}, ${record.country || 'N/A'}`)
      } else {
        console.log(`❌ ${ip}: Not found in database`)
      }
    }
    
  } catch (error) {
    console.error('❌ Error checking GeoIP data:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkGeoIPData() 