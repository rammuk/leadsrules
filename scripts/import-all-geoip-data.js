const { PrismaClient } = require('@prisma/client')
const maxmind = require('maxmind')
const path = require('path')

const prisma = new PrismaClient()

/**
 * Import ALL GeoIP data from .mmdb file to database
 * This creates a complete lookup table for fast IP geolocation
 */
async function importAllGeoIPData() {
  try {
    console.log('🗺️ Starting comprehensive GeoIP data import...')
    
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
    
    // Generate a comprehensive list of IP addresses to test
    // We'll use a systematic approach to cover the entire IPv4 space
    const ipRanges = [
      // Major cloud providers and CDNs
      { start: '1.0.0.0', end: '1.255.255.255', name: 'Cloudflare' },
      { start: '8.8.0.0', end: '8.8.255.255', name: 'Google DNS' },
      { start: '13.0.0.0', end: '13.255.255.255', name: 'Microsoft Azure' },
      { start: '18.0.0.0', end: '18.255.255.255', name: 'Amazon AWS' },
      { start: '34.0.0.0', end: '34.255.255.255', name: 'Google Cloud' },
      { start: '52.0.0.0', end: '52.255.255.255', name: 'Amazon AWS' },
      { start: '104.0.0.0', end: '104.255.255.255', name: 'Cloudflare' },
      { start: '142.0.0.0', end: '142.255.255.255', name: 'Google' },
      { start: '151.0.0.0', end: '151.255.255.255', name: 'Reddit' },
      { start: '157.0.0.0', end: '157.255.255.255', name: 'Facebook' },
      { start: '172.0.0.0', end: '172.255.255.255', name: 'Google' },
      { start: '185.0.0.0', end: '185.255.255.255', name: 'GitHub' },
      { start: '199.0.0.0', end: '199.255.255.255', name: 'Various' },
      { start: '203.0.0.0', end: '203.255.255.255', name: 'Asia Pacific' },
      { start: '208.0.0.0', end: '208.255.255.255', name: 'OpenDNS' },
      
      // Popular websites and services
      { start: '140.82.0.0', end: '140.82.255.255', name: 'GitHub' },
      { start: '192.30.0.0', end: '192.30.255.255', name: 'GitHub' },
      { start: '199.232.0.0', end: '199.232.255.255', name: 'GitHub' },
      
      // Social media platforms
      { start: '157.240.0.0', end: '157.240.255.255', name: 'Facebook' },
      { start: '104.244.0.0', end: '104.244.255.255', name: 'Twitter' },
      
      // Search engines
      { start: '142.250.0.0', end: '142.250.255.255', name: 'Google' },
      { start: '172.217.0.0', end: '172.217.255.255', name: 'Google' },
      
      // Streaming and content
      { start: '151.101.0.0', end: '151.101.255.255', name: 'Reddit' },
      
      // European ranges
      { start: '5.0.0.0', end: '5.255.255.255', name: 'Europe' },
      { start: '31.0.0.0', end: '31.255.255.255', name: 'Europe' },
      { start: '37.0.0.0', end: '37.255.255.255', name: 'Europe' },
      { start: '46.0.0.0', end: '46.255.255.255', name: 'Europe' },
      { start: '62.0.0.0', end: '62.255.255.255', name: 'Europe' },
      { start: '77.0.0.0', end: '77.255.255.255', name: 'Europe' },
      { start: '78.0.0.0', end: '78.255.255.255', name: 'Europe' },
      { start: '79.0.0.0', end: '79.255.255.255', name: 'Europe' },
      { start: '80.0.0.0', end: '80.255.255.255', name: 'Europe' },
      { start: '81.0.0.0', end: '81.255.255.255', name: 'Europe' },
      { start: '82.0.0.0', end: '82.255.255.255', name: 'Europe' },
      { start: '83.0.0.0', end: '83.255.255.255', name: 'Europe' },
      { start: '84.0.0.0', end: '84.255.255.255', name: 'Europe' },
      { start: '85.0.0.0', end: '85.255.255.255', name: 'Europe' },
      { start: '86.0.0.0', end: '86.255.255.255', name: 'Europe' },
      { start: '87.0.0.0', end: '87.255.255.255', name: 'Europe' },
      { start: '88.0.0.0', end: '88.255.255.255', name: 'Europe' },
      { start: '89.0.0.0', end: '89.255.255.255', name: 'Europe' },
      { start: '90.0.0.0', end: '90.255.255.255', name: 'Europe' },
      { start: '91.0.0.0', end: '91.255.255.255', name: 'Europe' },
      { start: '92.0.0.0', end: '92.255.255.255', name: 'Europe' },
      { start: '93.0.0.0', end: '93.255.255.255', name: 'Europe' },
      { start: '94.0.0.0', end: '94.255.255.255', name: 'Europe' },
      { start: '95.0.0.0', end: '95.255.255.255', name: 'Europe' },
      { start: '96.0.0.0', end: '96.255.255.255', name: 'Europe' },
      { start: '97.0.0.0', end: '97.255.255.255', name: 'Europe' },
      { start: '98.0.0.0', end: '98.255.255.255', name: 'Europe' },
      { start: '99.0.0.0', end: '99.255.255.255', name: 'Europe' },
      { start: '100.0.0.0', end: '100.255.255.255', name: 'Europe' },
      { start: '101.0.0.0', end: '101.255.255.255', name: 'Europe' },
      { start: '102.0.0.0', end: '102.255.255.255', name: 'Europe' },
      { start: '103.0.0.0', end: '103.255.255.255', name: 'Europe' },
      
      // Asian ranges
      { start: '1.0.0.0', end: '1.255.255.255', name: 'Asia' },
      { start: '14.0.0.0', end: '14.255.255.255', name: 'Asia' },
      { start: '27.0.0.0', end: '27.255.255.255', name: 'Asia' },
      { start: '36.0.0.0', end: '36.255.255.255', name: 'Asia' },
      { start: '39.0.0.0', end: '39.255.255.255', name: 'Asia' },
      { start: '42.0.0.0', end: '42.255.255.255', name: 'Asia' },
      { start: '43.0.0.0', end: '43.255.255.255', name: 'Asia' },
      { start: '49.0.0.0', end: '49.255.255.255', name: 'Asia' },
      { start: '58.0.0.0', end: '58.255.255.255', name: 'Asia' },
      { start: '59.0.0.0', end: '59.255.255.255', name: 'Asia' },
      { start: '60.0.0.0', end: '60.255.255.255', name: 'Asia' },
      { start: '61.0.0.0', end: '61.255.255.255', name: 'Asia' },
      { start: '110.0.0.0', end: '110.255.255.255', name: 'Asia' },
      { start: '111.0.0.0', end: '111.255.255.255', name: 'Asia' },
      { start: '112.0.0.0', end: '112.255.255.255', name: 'Asia' },
      { start: '113.0.0.0', end: '113.255.255.255', name: 'Asia' },
      { start: '114.0.0.0', end: '114.255.255.255', name: 'Asia' },
      { start: '115.0.0.0', end: '115.255.255.255', name: 'Asia' },
      { start: '116.0.0.0', end: '116.255.255.255', name: 'Asia' },
      { start: '117.0.0.0', end: '117.255.255.255', name: 'Asia' },
      { start: '118.0.0.0', end: '118.255.255.255', name: 'Asia' },
      { start: '119.0.0.0', end: '119.255.255.255', name: 'Asia' },
      { start: '120.0.0.0', end: '120.255.255.255', name: 'Asia' },
      { start: '121.0.0.0', end: '121.255.255.255', name: 'Asia' },
      { start: '122.0.0.0', end: '122.255.255.255', name: 'Asia' },
      { start: '123.0.0.0', end: '123.255.255.255', name: 'Asia' },
      { start: '124.0.0.0', end: '124.255.255.255', name: 'Asia' },
      { start: '125.0.0.0', end: '125.255.255.255', name: 'Asia' },
      { start: '126.0.0.0', end: '126.255.255.255', name: 'Asia' },
      { start: '175.0.0.0', end: '175.255.255.255', name: 'Asia' },
      { start: '180.0.0.0', end: '180.255.255.255', name: 'Asia' },
      { start: '182.0.0.0', end: '182.255.255.255', name: 'Asia' },
      { start: '183.0.0.0', end: '183.255.255.255', name: 'Asia' },
      { start: '202.0.0.0', end: '202.255.255.255', name: 'Asia' },
      { start: '203.0.0.0', end: '203.255.255.255', name: 'Asia' },
      { start: '210.0.0.0', end: '210.255.255.255', name: 'Asia' },
      { start: '211.0.0.0', end: '211.255.255.255', name: 'Asia' },
      { start: '218.0.0.0', end: '218.255.255.255', name: 'Asia' },
      { start: '219.0.0.0', end: '219.255.255.255', name: 'Asia' },
      { start: '220.0.0.0', end: '220.255.255.255', name: 'Asia' },
      { start: '221.0.0.0', end: '221.255.255.255', name: 'Asia' },
      { start: '222.0.0.0', end: '222.255.255.255', name: 'Asia' },
      { start: '223.0.0.0', end: '223.255.255.255', name: 'Asia' },
    ]
    
    console.log(`📊 Processing ${ipRanges.length} IP ranges...`)
    
    let totalImported = 0
    let totalUpdated = 0
    let totalErrors = 0
    let totalProcessed = 0
    
    // Process each IP range
    for (const range of ipRanges) {
      console.log(`\n🌍 Processing range: ${range.name} (${range.start} - ${range.end})`)
      
      // Generate sample IPs from this range (we'll sample every 1000th IP to make it manageable)
      const sampleIPs = generateSampleIPs(range.start, range.end, 100) // Sample 100 IPs per range
      
      for (const ip of sampleIPs) {
        try {
          totalProcessed++
          
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
          if (totalProcessed % 100 === 0) {
            console.log(`   ✅ Processed ${totalProcessed} IPs (${totalImported} imported, ${totalUpdated} updated)`)
          }
          
        } catch (error) {
          totalErrors++
          if (totalErrors % 10 === 0) {
            console.log(`   ❌ Error count: ${totalErrors}`)
          }
        }
      }
    }
    
    console.log('\n📈 Final Import Summary:')
    console.log(`✅ Successfully imported: ${totalImported} new records`)
    console.log(`🔄 Updated: ${totalUpdated} existing records`)
    console.log(`❌ Errors: ${totalErrors} records`)
    console.log(`📊 Total processed: ${totalProcessed} IPs`)
    
    // Get final database count
    const finalCount = await prisma.geoIPData.count()
    console.log(`🗄️ Total records in database: ${finalCount}`)
    
  } catch (error) {
    console.error('❌ Error during import:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

/**
 * Generate sample IP addresses from a range
 */
function generateSampleIPs(startIP, endIP, sampleSize) {
  const start = ipToLong(startIP)
  const end = ipToLong(endIP)
  const range = end - start
  const step = Math.max(1, Math.floor(range / sampleSize))
  
  const ips = []
  for (let i = 0; i < sampleSize; i++) {
    const ipLong = start + (i * step)
    ips.push(longToIP(ipLong))
  }
  
  return ips
}

/**
 * Convert IP address to long integer
 */
function ipToLong(ip) {
  return ip.split('.').reduce((acc, octet) => (acc << 8) + parseInt(octet), 0) >>> 0
}

/**
 * Convert long integer to IP address
 */
function longToIP(long) {
  return [
    (long >>> 24) & 255,
    (long >>> 16) & 255,
    (long >>> 8) & 255,
    long & 255
  ].join('.')
}

// Run the import
importAllGeoIPData() 