const { PrismaClient } = require('@prisma/client')

// Local database (source)
const localPrisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/leadsrules'
    }
  }
})

// Production database (target)
const productionPrisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || 'postgres://fea2646b084682099ce36883962fda370744d8caae643ee50e13618e56fe264f:sk_hOtByPsz68q2L4Vz4eHlX@db.prisma.io:5432/?sslmode=require'
    }
  }
})

/**
 * Sync all data from local database to production
 */
async function syncDatabaseToProduction() {
  try {
    console.log('🔄 Starting database sync to production...')
    
    // Test connections
    console.log('🔍 Testing database connections...')
    
    const localCount = await localPrisma.geoIPData.count()
    console.log(`📊 Local database has ${localCount.toLocaleString()} GeoIP records`)
    
    const productionCount = await productionPrisma.geoIPData.count()
    console.log(`📊 Production database has ${productionCount.toLocaleString()} GeoIP records`)
    
    if (localCount === 0) {
      console.log('❌ Local database has no GeoIP data. Please run the import script first.')
      return
    }
    
    console.log('\n🚀 Starting sync process...')
    
    // Sync GeoIP data in batches
    const batchSize = 1000
    let totalSynced = 0
    let totalSkipped = 0
    let totalErrors = 0
    
    // Get all local GeoIP data
    const allLocalData = await localPrisma.geoIPData.findMany({
      orderBy: { createdAt: 'asc' }
    })
    
    console.log(`📦 Found ${allLocalData.length.toLocaleString()} records to sync`)
    
    for (let i = 0; i < allLocalData.length; i += batchSize) {
      const batch = allLocalData.slice(i, i + batchSize)
      
      console.log(`\n📤 Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(allLocalData.length / batchSize)} (${batch.length} records)...`)
      
      for (const record of batch) {
        try {
          // Check if record exists in production
          const existingRecord = await productionPrisma.geoIPData.findUnique({
            where: { ip: record.ip }
          })
          
          if (existingRecord) {
            // Update existing record
            await productionPrisma.geoIPData.update({
              where: { ip: record.ip },
              data: {
                country: record.country,
                countryCode: record.countryCode,
                region: record.region,
                regionCode: record.regionCode,
                city: record.city,
                postalCode: record.postalCode,
                latitude: record.latitude,
                longitude: record.longitude,
                timezone: record.timezone,
                isp: record.isp,
                organization: record.organization,
                accuracy: record.accuracy,
                updatedAt: new Date()
              }
            })
            totalSkipped++
          } else {
            // Create new record
            await productionPrisma.geoIPData.create({
              data: {
                ip: record.ip,
                country: record.country,
                countryCode: record.countryCode,
                region: record.region,
                regionCode: record.regionCode,
                city: record.city,
                postalCode: record.postalCode,
                latitude: record.latitude,
                longitude: record.longitude,
                timezone: record.timezone,
                isp: record.isp,
                organization: record.organization,
                accuracy: record.accuracy,
                createdAt: record.createdAt,
                updatedAt: new Date()
              }
            })
            totalSynced++
          }
          
        } catch (error) {
          totalErrors++
          console.log(`   ❌ Error syncing ${record.ip}: ${error.message}`)
        }
      }
      
      console.log(`   ✅ Batch complete: ${totalSynced} synced, ${totalSkipped} updated, ${totalErrors} errors`)
    }
    
    // Final statistics
    const finalProductionCount = await productionPrisma.geoIPData.count()
    
    console.log('\n📈 Sync Summary:')
    console.log(`✅ Successfully synced: ${totalSynced.toLocaleString()} new records`)
    console.log(`🔄 Updated: ${totalSkipped.toLocaleString()} existing records`)
    console.log(`❌ Errors: ${totalErrors.toLocaleString()} records`)
    console.log(`📊 Final production count: ${finalProductionCount.toLocaleString()} records`)
    
    // Verify sync
    console.log('\n🔍 Verifying sync...')
    
    const sampleLocalRecords = await localPrisma.geoIPData.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' }
    })
    
    let verifiedCount = 0
    for (const localRecord of sampleLocalRecords) {
      const productionRecord = await productionPrisma.geoIPData.findUnique({
        where: { ip: localRecord.ip }
      })
      
      if (productionRecord) {
        verifiedCount++
        console.log(`   ✅ ${localRecord.ip} → ${localRecord.city || 'N/A'}, ${localRecord.country || 'N/A'}`)
      } else {
        console.log(`   ❌ ${localRecord.ip} not found in production`)
      }
    }
    
    console.log(`\n🎯 Verification: ${verifiedCount}/${sampleLocalRecords.length} sample records found in production`)
    
    if (verifiedCount === sampleLocalRecords.length) {
      console.log('✅ Sync verification successful!')
    } else {
      console.log('⚠️  Some records may not have synced properly.')
    }
    
  } catch (error) {
    console.error('❌ Error during sync:', error)
  } finally {
    await localPrisma.$disconnect()
    await productionPrisma.$disconnect()
  }
}

// Run the sync
syncDatabaseToProduction() 