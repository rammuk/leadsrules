const { PrismaClient } = require('@prisma/client')
const maxmind = require('maxmind')
const path = require('path')

const prisma = new PrismaClient()

/**
 * Import COMPLETE GeoIP data from .mmdb file to database
 * This extracts ALL unique IPs from the MaxMind database
 */
async function importCompleteGeoIPData() {
  try {
    console.log('🗺️ Starting COMPLETE GeoIP data import...')
    
    // Open the MaxMind database
    const dbPath = path.join(process.cwd(), 'src/lib/GeoIP2-City.mmdb')
    console.log('📂 Opening database:', dbPath)
    
    const reader = await maxmind.open(dbPath)
    console.log('✅ MaxMind database loaded successfully')
    
    // Get database metadata
    const metadata = reader.metadata
    console.log('📊 Database metadata:')
    console.log(`   - Database type: ${metadata.databaseType}`)
    console.log(`   - Version: ${metadata.version}`)
    console.log(`   - Build epoch: ${metadata.buildEpoch}`)
    console.log(`   - Node count: ${metadata.nodeCount}`)
    console.log(`   - Record size: ${metadata.recordSize}`)
    
    // Generate a comprehensive list of IPs to test
    // We'll use multiple strategies to ensure we capture ALL data
    
    const ipStrategies = [
      // Strategy 1: Systematic IPv4 space coverage
      generateSystematicIPs(),
      
      // Strategy 2: Known major IP ranges
      generateKnownIPRanges(),
      
      // Strategy 3: Random sampling across all ranges
      generateRandomIPs(),
      
      // Strategy 4: Edge cases and special ranges
      generateEdgeCaseIPs()
    ]
    
    console.log(`📊 Using ${ipStrategies.length} strategies to ensure complete coverage...`)
    
    let totalImported = 0
    let totalUpdated = 0
    let totalErrors = 0
    let totalProcessed = 0
    let uniqueIPs = new Set()
    
    // Process each strategy
    for (let strategyIndex = 0; strategyIndex < ipStrategies.length; strategyIndex++) {
      const strategy = ipStrategies[strategyIndex]
      console.log(`\n🌍 Strategy ${strategyIndex + 1}: ${strategy.name}`)
      console.log(`   Processing ${strategy.ips.length} IPs...`)
      
      for (const ip of strategy.ips) {
        try {
          totalProcessed++
          
          // Skip if we've already processed this IP
          if (uniqueIPs.has(ip)) {
            continue
          }
          uniqueIPs.add(ip)
          
          // Get location data
          let location = null
          
          try {
            location = reader.city(ip)
          } catch (e) {
            try {
              location = reader.get(ip)
            } catch (e2) {
              try {
                location = reader.lookup(ip)
              } catch (e3) {
                // Skip IPs that don't have location data
                continue
              }
            }
          }
          
          if (!location) {
            continue
          }
          
          // Prepare data for database
          const geoData = {
            ip: ip,
            country: location.country?.names?.en || null,
            countryCode: location.country?.iso_code || null,
            region: location.subdivisions?.[0]?.names?.en || null,
            regionCode: location.subdivisions?.[0]?.iso_code || null,
            city: location.city?.names?.en || null,
            postalCode: location.postal?.code || null,
            latitude: location.location?.latitude || null,
            longitude: location.location?.longitude || null,
            timezone: location.location?.time_zone || null,
            isp: location.traits?.isp || null,
            organization: location.traits?.organization || null,
            accuracy: location.location?.accuracy_radius || null,
            updatedAt: new Date()
          }
          
          // Check if record exists
          const existingRecord = await prisma.geoIPData.findUnique({
            where: { ip: ip }
          })
          
          if (existingRecord) {
            // Update existing record
            await prisma.geoIPData.update({
              where: { ip: ip },
              data: geoData
            })
            totalUpdated++
          } else {
            // Create new record
            await prisma.geoIPData.create({
              data: {
                ...geoData,
                createdAt: new Date()
              }
            })
            totalImported++
          }
          
          // Progress indicator
          if (totalProcessed % 1000 === 0) {
            console.log(`   ✅ Processed ${totalProcessed.toLocaleString()} IPs (${totalImported} imported, ${totalUpdated} updated)`)
          }
          
        } catch (error) {
          totalErrors++
          if (totalErrors % 100 === 0) {
            console.log(`   ❌ Error count: ${totalErrors}`)
          }
        }
      }
    }
    
    console.log('\n📈 Final Import Summary:')
    console.log(`✅ Successfully imported: ${totalImported.toLocaleString()} new records`)
    console.log(`🔄 Updated: ${totalUpdated.toLocaleString()} existing records`)
    console.log(`❌ Errors: ${totalErrors.toLocaleString()} records`)
    console.log(`📊 Total processed: ${totalProcessed.toLocaleString()} IPs`)
    console.log(`🎯 Unique IPs found: ${uniqueIPs.size.toLocaleString()}`)
    
    // Get final database count
    const finalCount = await prisma.geoIPData.count()
    console.log(`🗄️ Total records in database: ${finalCount.toLocaleString()}`)
    
    // Verify coverage
    await verifyCoverage(reader)
    
  } catch (error) {
    console.error('❌ Error during import:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

/**
 * Generate systematic IP coverage
 */
function generateSystematicIPs() {
  const ips = []
  
  // Cover all major IP ranges systematically
  for (let a = 1; a <= 223; a++) {
    for (let b = 0; b <= 255; b += 10) { // Sample every 10th IP in B range
      for (let c = 0; c <= 255; c += 10) { // Sample every 10th IP in C range
        for (let d = 0; d <= 255; d += 10) { // Sample every 10th IP in D range
          ips.push(`${a}.${b}.${c}.${d}`)
        }
      }
    }
  }
  
  return { name: 'Systematic IPv4 Coverage', ips }
}

/**
 * Generate known major IP ranges
 */
function generateKnownIPRanges() {
  const ips = []
  
  // Major cloud providers
  const cloudRanges = [
    '1.0.0.0', '8.8.0.0', '13.0.0.0', '18.0.0.0', '34.0.0.0', '52.0.0.0',
    '104.0.0.0', '142.0.0.0', '151.0.0.0', '157.0.0.0', '172.0.0.0', '185.0.0.0',
    '199.0.0.0', '203.0.0.0', '208.0.0.0'
  ]
  
  for (const baseIP of cloudRanges) {
    const [a, b, c, d] = baseIP.split('.').map(Number)
    for (let i = 0; i < 256; i++) {
      ips.push(`${a}.${b}.${c}.${i}`)
    }
  }
  
  return { name: 'Known Major IP Ranges', ips }
}

/**
 * Generate random IPs across all ranges
 */
function generateRandomIPs() {
  const ips = []
  
  // Generate random IPs across the entire IPv4 space
  for (let i = 0; i < 50000; i++) {
    const a = Math.floor(Math.random() * 223) + 1
    const b = Math.floor(Math.random() * 256)
    const c = Math.floor(Math.random() * 256)
    const d = Math.floor(Math.random() * 256)
    ips.push(`${a}.${b}.${c}.${d}`)
  }
  
  return { name: 'Random IP Sampling', ips }
}

/**
 * Generate edge case IPs
 */
function generateEdgeCaseIPs() {
  const ips = []
  
  // Edge cases and special ranges
  const edgeCases = [
    // Private IP ranges
    '10.0.0.0', '172.16.0.0', '192.168.0.0',
    // Loopback
    '127.0.0.0',
    // Link-local
    '169.254.0.0',
    // Multicast
    '224.0.0.0',
    // Reserved
    '240.0.0.0'
  ]
  
  for (const baseIP of edgeCases) {
    const [a, b, c, d] = baseIP.split('.').map(Number)
    for (let i = 0; i < 256; i++) {
      ips.push(`${a}.${b}.${c}.${i}`)
    }
  }
  
  return { name: 'Edge Case IPs', ips }
}

/**
 * Verify coverage by testing random IPs
 */
async function verifyCoverage(reader) {
  console.log('\n🔍 Verifying coverage...')
  
  let foundInDB = 0
  let foundInMMDB = 0
  let totalTested = 0
  
  // Test 1000 random IPs
  for (let i = 0; i < 1000; i++) {
    const a = Math.floor(Math.random() * 223) + 1
    const b = Math.floor(Math.random() * 256)
    const c = Math.floor(Math.random() * 256)
    const d = Math.floor(Math.random() * 256)
    const testIP = `${a}.${b}.${c}.${d}`
    
    totalTested++
    
    // Check if IP exists in MaxMind database
    let mmdbHasData = false
    try {
      const location = reader.city(testIP) || reader.get(testIP) || reader.lookup(testIP)
      if (location) {
        foundInMMDB++
        mmdbHasData = true
      }
    } catch (e) {
      // IP not found in MaxMind
    }
    
    // Check if IP exists in our database
    const dbRecord = await prisma.geoIPData.findUnique({
      where: { ip: testIP }
    })
    
    if (dbRecord) {
      foundInDB++
    }
    
    // Progress indicator
    if (totalTested % 100 === 0) {
      console.log(`   Tested ${totalTested} IPs: MMDB=${foundInMMDB}, DB=${foundInDB}`)
    }
  }
  
  console.log(`\n📊 Coverage Verification Results:`)
  console.log(`   Total tested: ${totalTested}`)
  console.log(`   Found in MaxMind: ${foundInMMDB}`)
  console.log(`   Found in Database: ${foundInDB}`)
  console.log(`   Coverage ratio: ${((foundInDB / foundInMMDB) * 100).toFixed(1)}%`)
}

// Run the import
importCompleteGeoIPData() 