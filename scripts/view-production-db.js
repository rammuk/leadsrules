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
      // Check for new GeoIP tables
      const networkCount = await productionPrisma.geoIP2Network.count()
      const locationCount = await productionPrisma.geoIP2Location.count()
      
      console.log(`   GeoIP2Network records: ${networkCount.toLocaleString()}`)
      console.log(`   GeoIP2Location records: ${locationCount.toLocaleString()}`)
      
      if (networkCount > 0) {
        // Get sample records
        console.log('\n🎯 Sample GeoIP Network Records:')
        const samples = await productionPrisma.geoIP2Network.findMany({
          take: 5,
          include: {
            location: true
          }
        })
        
        samples.forEach((record, index) => {
          console.log(`   ${index + 1}. Network: ${record.network} → Location: ${record.location?.cityName || 'N/A'}, ${record.location?.countryName || 'N/A'}`)
        })
        
        // Test IP lookup
        console.log('\n🧪 Test IP Lookup:')
        try {
          const testResult = await productionPrisma.$queryRaw`
            SELECT network::text as network
            FROM geoip2_network 
            WHERE network::cidr >>= '8.8.8.8'::inet 
            LIMIT 1
          `
          if (testResult.length > 0) {
            console.log(`   ✅ IP lookup test successful: ${testResult[0].network}`)
          } else {
            console.log(`   ⚠️  No matching network found for test IP`)
          }
        } catch (error) {
          console.log(`   ❌ IP lookup test failed: ${error.message}`)
        }
        
      } else {
        console.log('   ❌ No GeoIP2Network records found')
        console.log('   💡 You may need to import GeoIP data to production')
      }
      
    } catch (error) {
      console.log('❌ Error accessing GeoIP2Network table:', error.message)
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