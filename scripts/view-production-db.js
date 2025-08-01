const { PrismaClient } = require('@prisma/client')

// Production database connection
const productionPrisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || 'postgres://fea2646b084682099ce36883962fda370744d8caae643ee50e13618e56fe264f:sk_hOtByPsz68q2L4Vz4eHlX@db.prisma.io:5432/?sslmode=require'
    }
  }
})

/**
 * View production database contents
 */
async function viewProductionDatabase() {
  try {
    console.log('🗄️  Production Database Viewer')
    console.log('=============================')
    
    // Test connection
    console.log('🔍 Testing connection to production database...')
    await productionPrisma.$connect()
    console.log('✅ Successfully connected to production database')
    
    // Get database statistics
    console.log('\n📊 Database Statistics:')
    
    try {
      const geoipCount = await productionPrisma.geoIPData.count()
      console.log(`   GeoIPData records: ${geoipCount.toLocaleString()}`)
      
      if (geoipCount > 0) {
        // Get sample records
        console.log('\n🎯 Sample GeoIP Records:')
        const samples = await productionPrisma.geoIPData.findMany({
          take: 10,
          orderBy: { createdAt: 'desc' }
        })
        
        samples.forEach((record, index) => {
          console.log(`   ${index + 1}. ${record.ip} → ${record.city || 'N/A'}, ${record.region || 'N/A'}, ${record.country || 'N/A'}`)
        })
        
        // Get top countries
        console.log('\n🌍 Top Countries:')
        const countries = await productionPrisma.geoIPData.groupBy({
          by: ['country'],
          _count: { country: true },
          orderBy: { _count: { country: 'desc' } },
          take: 10
        })
        
        countries.forEach((country, index) => {
          console.log(`   ${index + 1}. ${country.country || 'Unknown'}: ${country._count.country.toLocaleString()} IPs`)
        })
        
        // Get top cities
        console.log('\n🏙️  Top Cities:')
        const cities = await productionPrisma.geoIPData.groupBy({
          by: ['city'],
          _count: { city: true },
          orderBy: { _count: { city: 'desc' } },
          take: 10,
          where: {
            city: { not: null }
          }
        })
        
        cities.forEach((city, index) => {
          console.log(`   ${index + 1}. ${city.city}: ${city._count.city.toLocaleString()} IPs`)
        })
        
        // Data quality stats
        console.log('\n📋 Data Quality:')
        const withCity = await productionPrisma.geoIPData.count({
          where: { city: { not: null } }
        })
        const withRegion = await productionPrisma.geoIPData.count({
          where: { region: { not: null } }
        })
        const withCoords = await productionPrisma.geoIPData.count({
          where: { 
            latitude: { not: null },
            longitude: { not: null }
          }
        })
        
        console.log(`   Records with city data: ${withCity.toLocaleString()} (${((withCity / geoipCount) * 100).toFixed(1)}%)`)
        console.log(`   Records with region data: ${withRegion.toLocaleString()} (${((withRegion / geoipCount) * 100).toFixed(1)}%)`)
        console.log(`   Records with coordinates: ${withCoords.toLocaleString()} (${((withCoords / geoipCount) * 100).toFixed(1)}%)`)
        
      } else {
        console.log('   ❌ No GeoIPData records found')
      }
      
    } catch (error) {
      console.log('❌ Error accessing GeoIPData table:', error.message)
      console.log('   This might mean the schema needs to be pushed to production')
    }
    
    // Check other tables
    console.log('\n📋 Other Tables:')
    
    try {
      const websiteCount = await productionPrisma.website.count()
      console.log(`   Websites: ${websiteCount}`)
    } catch (error) {
      console.log('   ❌ Websites table not accessible')
    }
    
    try {
      const questionnaireCount = await productionPrisma.questionnaire.count()
      console.log(`   Questionnaires: ${questionnaireCount}`)
    } catch (error) {
      console.log('   ❌ Questionnaires table not accessible')
    }
    
    try {
      const questionBankCount = await productionPrisma.questionBank.count()
      console.log(`   Question Bank: ${questionBankCount}`)
    } catch (error) {
      console.log('   ❌ Question Bank table not accessible')
    }
    
    // Test a specific IP lookup
    console.log('\n🧪 Test IP Lookup:')
    try {
      const testIP = '8.8.8.8'
      const result = await productionPrisma.geoIPData.findUnique({
        where: { ip: testIP }
      })
      
      if (result) {
        console.log(`   ✅ ${testIP} found: ${result.city || 'N/A'}, ${result.country || 'N/A'}`)
      } else {
        console.log(`   ❌ ${testIP} not found in database`)
      }
    } catch (error) {
      console.log(`   ❌ Error testing IP lookup: ${error.message}`)
    }
    
  } catch (error) {
    console.error('❌ Error viewing production database:', error)
  } finally {
    await productionPrisma.$disconnect()
  }
}

// Run the viewer
viewProductionDatabase() 