const { PrismaClient } = require('@prisma/client')

// Test with DATABASE_URL
async function testDATABASE_URL() {
  console.log('🔍 Testing DATABASE_URL connection...')
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL
      }
    }
  })
  
  try {
    const count = await prisma.geoIPData.count()
    console.log(`📊 DATABASE_URL count: ${count}`)
    
    if (count > 0) {
      const sample = await prisma.geoIPData.findFirst()
      console.log(`📋 Sample record: ${sample.ip} → ${sample.city}, ${sample.country}`)
    }
  } catch (error) {
    console.log(`❌ DATABASE_URL error: ${error.message}`)
  } finally {
    await prisma.$disconnect()
  }
}

// Test with PRISMA_DATABASE_URL
async function testPRISMA_DATABASE_URL() {
  console.log('\n🔍 Testing PRISMA_DATABASE_URL connection...')
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: process.env.PRISMA_DATABASE_URL
      }
    }
  })
  
  try {
    const count = await prisma.geoIPData.count()
    console.log(`📊 PRISMA_DATABASE_URL count: ${count}`)
    
    if (count > 0) {
      const sample = await prisma.geoIPData.findFirst()
      console.log(`📋 Sample record: ${sample.ip} → ${sample.city}, ${sample.country}`)
    }
  } catch (error) {
    console.log(`❌ PRISMA_DATABASE_URL error: ${error.message}`)
  } finally {
    await prisma.$disconnect()
  }
}

async function main() {
  console.log('🧪 Testing Production Database Connections\n')
  
  await testDATABASE_URL()
  await testPRISMA_DATABASE_URL()
  
  console.log('\n✅ Connection tests completed')
}

main().catch(console.error) 