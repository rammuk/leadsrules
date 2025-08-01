const { PrismaClient } = require('@prisma/client')
const maxmind = require('maxmind')
const path = require('path')

const prisma = new PrismaClient()

/**
 * Extract ALL data from .mmdb file by systematically testing the IPv4 space
 */
async function extractAllMMDBData() {
  try {
    console.log('🗺️ Extracting ALL data from MaxMind database...')
    
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
    
    // We'll use a systematic approach to find ALL IPs with data
    // Since testing the entire IPv4 space (4.3 billion IPs) is impractical,
    // we'll use a smart sampling strategy
    
    const strategies = [
      {
        name: 'Major IP Ranges (A blocks)',
        generator: generateMajorRanges,
        description: 'Test all major A blocks (1-223) with systematic sampling'
      },
      {
        name: 'Known Service Ranges',
        generator: generateKnownServiceRanges,
        description: 'Test ranges known to have data (cloud providers, CDNs, etc.)'
      },
      {
        name: 'Geographic Distribution',
        generator: generateGeographicRanges,
        description: 'Test ranges from different geographic regions'
      }
    ]
    
    let totalFound = 0
    let totalImported = 0
    let totalUpdated = 0
    let totalErrors = 0
    
    for (const strategy of strategies) {
      console.log(`\n🌍 Strategy: ${strategy.name}`)
      console.log(`   ${strategy.description}`)
      
      const ips = strategy.generator()
      console.log(`   Testing ${ips.length.toLocaleString()} IPs...`)
      
      let strategyFound = 0
      let strategyImported = 0
      let strategyUpdated = 0
      
      for (let i = 0; i < ips.length; i++) {
        const ip = ips[i]
        
        try {
          // Try to get location data from MaxMind
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
                // IP not found in MaxMind
              }
            }
          }
          
          if (location) {
            strategyFound++
            totalFound++
            
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
              strategyUpdated++
              totalUpdated++
            } else {
              // Create new record
              await prisma.geoIPData.create({
                data: {
                  ...geoData,
                  createdAt: new Date()
                }
              })
              strategyImported++
              totalImported++
            }
          }
          
          // Progress indicator
          if ((i + 1) % 1000 === 0) {
            console.log(`   ✅ Processed ${(i + 1).toLocaleString()} IPs, found ${strategyFound} with data`)
          }
          
        } catch (error) {
          totalErrors++
          if (totalErrors % 100 === 0) {
            console.log(`   ❌ Error count: ${totalErrors}`)
          }
        }
      }
      
      console.log(`   Strategy Results:`)
      console.log(`     Found: ${strategyFound}`)
      console.log(`     Imported: ${strategyImported}`)
      console.log(`     Updated: ${strategyUpdated}`)
    }
    
    console.log('\n📈 Final Extraction Summary:')
    console.log(`✅ Total found in MaxMind: ${totalFound.toLocaleString()}`)
    console.log(`✅ Successfully imported: ${totalImported.toLocaleString()} new records`)
    console.log(`🔄 Updated: ${totalUpdated.toLocaleString()} existing records`)
    console.log(`❌ Errors: ${totalErrors.toLocaleString()} records`)
    
    // Get final database count
    const finalCount = await prisma.geoIPData.count()
    console.log(`🗄️ Total records in database: ${finalCount.toLocaleString()}`)
    
    // Show sample of what we found
    console.log('\n🎯 Sample of extracted data:')
    const samples = await prisma.geoIPData.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' }
    })
    
    samples.forEach((record, index) => {
      console.log(`   ${index + 1}. ${record.ip} → ${record.city || 'N/A'}, ${record.region || 'N/A'}, ${record.country || 'N/A'}`)
    })
    
  } catch (error) {
    console.error('❌ Error during extraction:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

/**
 * Generate major IP ranges (A blocks)
 */
function generateMajorRanges() {
  const ips = []
  
  // Test all major A blocks (1-223) with systematic sampling
  for (let a = 1; a <= 223; a++) {
    // For each A block, test a systematic sample
    for (let b = 0; b <= 255; b += 5) { // Every 5th B
      for (let c = 0; c <= 255; c += 5) { // Every 5th C
        for (let d = 0; d <= 255; d += 5) { // Every 5th D
          ips.push(`${a}.${b}.${c}.${d}`)
        }
      }
    }
  }
  
  return ips
}

/**
 * Generate known service ranges
 */
function generateKnownServiceRanges() {
  const ips = []
  
  // Major cloud providers and services
  const serviceRanges = [
    // Cloudflare
    { start: '1.0.0.0', end: '1.255.255.255' },
    { start: '104.0.0.0', end: '104.255.255.255' },
    // Google
    { start: '8.8.0.0', end: '8.8.255.255' },
    { start: '142.250.0.0', end: '142.250.255.255' },
    { start: '172.217.0.0', end: '172.217.255.255' },
    // Microsoft
    { start: '13.0.0.0', end: '13.255.255.255' },
    // Amazon
    { start: '18.0.0.0', end: '18.255.255.255' },
    { start: '52.0.0.0', end: '52.255.255.255' },
    // GitHub
    { start: '140.82.0.0', end: '140.82.255.255' },
    { start: '185.199.0.0', end: '185.199.255.255' },
    { start: '192.30.0.0', end: '192.30.255.255' },
    { start: '199.232.0.0', end: '199.232.255.255' },
    // Facebook
    { start: '157.240.0.0', end: '157.240.255.255' },
    // Reddit
    { start: '151.101.0.0', end: '151.101.255.255' },
    // Twitter
    { start: '104.244.0.0', end: '104.244.255.255' },
    // OpenDNS
    { start: '208.67.0.0', end: '208.67.255.255' }
  ]
  
  for (const range of serviceRanges) {
    const [startA, startB, startC, startD] = range.start.split('.').map(Number)
    const [endA, endB, endC, endD] = range.end.split('.').map(Number)
    
    for (let a = startA; a <= endA; a++) {
      for (let b = startB; b <= endB; b++) {
        for (let c = startC; c <= endC; c++) {
          for (let d = startD; d <= endD; d++) {
            ips.push(`${a}.${b}.${c}.${d}`)
          }
        }
      }
    }
  }
  
  return ips
}

/**
 * Generate geographic ranges
 */
function generateGeographicRanges() {
  const ips = []
  
  // European ranges
  const europeanRanges = [
    { start: '5.0.0.0', end: '5.255.255.255' },
    { start: '31.0.0.0', end: '31.255.255.255' },
    { start: '37.0.0.0', end: '37.255.255.255' },
    { start: '46.0.0.0', end: '46.255.255.255' },
    { start: '62.0.0.0', end: '62.255.255.255' },
    { start: '77.0.0.0', end: '77.255.255.255' },
    { start: '78.0.0.0', end: '78.255.255.255' },
    { start: '79.0.0.0', end: '79.255.255.255' },
    { start: '80.0.0.0', end: '80.255.255.255' },
    { start: '81.0.0.0', end: '81.255.255.255' },
    { start: '82.0.0.0', end: '82.255.255.255' },
    { start: '83.0.0.0', end: '83.255.255.255' },
    { start: '84.0.0.0', end: '84.255.255.255' },
    { start: '85.0.0.0', end: '85.255.255.255' },
    { start: '86.0.0.0', end: '86.255.255.255' },
    { start: '87.0.0.0', end: '87.255.255.255' },
    { start: '88.0.0.0', end: '88.255.255.255' },
    { start: '89.0.0.0', end: '89.255.255.255' },
    { start: '90.0.0.0', end: '90.255.255.255' },
    { start: '91.0.0.0', end: '91.255.255.255' },
    { start: '92.0.0.0', end: '92.255.255.255' },
    { start: '93.0.0.0', end: '93.255.255.255' },
    { start: '94.0.0.0', end: '94.255.255.255' },
    { start: '95.0.0.0', end: '95.255.255.255' },
    { start: '96.0.0.0', end: '96.255.255.255' },
    { start: '97.0.0.0', end: '97.255.255.255' },
    { start: '98.0.0.0', end: '98.255.255.255' },
    { start: '99.0.0.0', end: '99.255.255.255' },
    { start: '100.0.0.0', end: '100.255.255.255' },
    { start: '101.0.0.0', end: '101.255.255.255' },
    { start: '102.0.0.0', end: '102.255.255.255' },
    { start: '103.0.0.0', end: '103.255.255.255' }
  ]
  
  // Asian ranges
  const asianRanges = [
    { start: '1.0.0.0', end: '1.255.255.255' },
    { start: '14.0.0.0', end: '14.255.255.255' },
    { start: '27.0.0.0', end: '27.255.255.255' },
    { start: '36.0.0.0', end: '36.255.255.255' },
    { start: '39.0.0.0', end: '39.255.255.255' },
    { start: '42.0.0.0', end: '42.255.255.255' },
    { start: '43.0.0.0', end: '43.255.255.255' },
    { start: '49.0.0.0', end: '49.255.255.255' },
    { start: '58.0.0.0', end: '58.255.255.255' },
    { start: '59.0.0.0', end: '59.255.255.255' },
    { start: '60.0.0.0', end: '60.255.255.255' },
    { start: '61.0.0.0', end: '61.255.255.255' },
    { start: '110.0.0.0', end: '110.255.255.255' },
    { start: '111.0.0.0', end: '111.255.255.255' },
    { start: '112.0.0.0', end: '112.255.255.255' },
    { start: '113.0.0.0', end: '113.255.255.255' },
    { start: '114.0.0.0', end: '114.255.255.255' },
    { start: '115.0.0.0', end: '115.255.255.255' },
    { start: '116.0.0.0', end: '116.255.255.255' },
    { start: '117.0.0.0', end: '117.255.255.255' },
    { start: '118.0.0.0', end: '118.255.255.255' },
    { start: '119.0.0.0', end: '119.255.255.255' },
    { start: '120.0.0.0', end: '120.255.255.255' },
    { start: '121.0.0.0', end: '121.255.255.255' },
    { start: '122.0.0.0', end: '122.255.255.255' },
    { start: '123.0.0.0', end: '123.255.255.255' },
    { start: '124.0.0.0', end: '124.255.255.255' },
    { start: '125.0.0.0', end: '125.255.255.255' },
    { start: '126.0.0.0', end: '126.255.255.255' },
    { start: '175.0.0.0', end: '175.255.255.255' },
    { start: '180.0.0.0', end: '180.255.255.255' },
    { start: '182.0.0.0', end: '182.255.255.255' },
    { start: '183.0.0.0', end: '183.255.255.255' },
    { start: '202.0.0.0', end: '202.255.255.255' },
    { start: '203.0.0.0', end: '203.255.255.255' },
    { start: '210.0.0.0', end: '210.255.255.255' },
    { start: '211.0.0.0', end: '211.255.255.255' },
    { start: '218.0.0.0', end: '218.255.255.255' },
    { start: '219.0.0.0', end: '219.255.255.255' },
    { start: '220.0.0.0', end: '220.255.255.255' },
    { start: '221.0.0.0', end: '221.255.255.255' },
    { start: '222.0.0.0', end: '222.255.255.255' },
    { start: '223.0.0.0', end: '223.255.255.255' }
  ]
  
  // Combine all ranges
  const allRanges = [...europeanRanges, ...asianRanges]
  
  for (const range of allRanges) {
    const [startA, startB, startC, startD] = range.start.split('.').map(Number)
    const [endA, endB, endC, endD] = range.end.split('.').map(Number)
    
    for (let a = startA; a <= endA; a++) {
      for (let b = startB; b <= endB; b++) {
        for (let c = startC; c <= endC; c++) {
          for (let d = startD; d <= endD; d++) {
            ips.push(`${a}.${b}.${c}.${d}`)
          }
        }
      }
    }
  }
  
  return ips
}

// Run the extraction
extractAllMMDBData() 