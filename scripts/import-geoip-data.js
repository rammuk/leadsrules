const { PrismaClient } = require('@prisma/client')
const maxmind = require('maxmind')
const path = require('path')

const prisma = new PrismaClient()

/**
 * Import GeoIP data from .mmdb file to database
 * This creates a lookup table for fast IP geolocation
 */
async function importGeoIPData() {
  try {
    console.log('🗺️ Starting GeoIP data import...')
    
    // Open the MaxMind database
    const dbPath = path.join(process.cwd(), 'src/lib/GeoIP2-City.mmdb')
    console.log('📂 Opening database:', dbPath)
    
    const reader = await maxmind.open(dbPath)
    console.log('✅ MaxMind database loaded successfully')
    
    // Expanded list of test IPs with diverse locations
    const testIPs = [
      // US IPs
      '8.8.8.8',      // Google DNS
      '1.1.1.1',      // Cloudflare DNS
      '208.67.222.222', // OpenDNS
      '142.250.191.78', // Google
      '157.240.241.35', // Facebook
      '104.244.42.193', // Twitter
      '151.101.1.69',   // Reddit
      '13.107.42.14',   // Microsoft
      '52.84.123.78',   // Amazon
      '172.217.169.46', // Google
      
      // European IPs
      '5.61.161.163',  // German IP
      '185.199.108.153', // GitHub
      '151.101.193.69', // Reddit EU
      '104.16.124.96', // Cloudflare
      
      // Asian IPs
      '203.208.60.1',  // Google Asia
      '180.149.131.81', // Baidu
      
      // Australian IPs
      '203.208.60.1',  // Google Australia
      
      // Canadian IPs
      '142.250.191.78', // Google Canada
      
      // UK IPs
      '151.101.193.69', // Reddit UK
      '104.16.124.96', // Cloudflare UK
      
      // Popular websites
      '199.232.69.194', // GitHub
      '140.82.112.4',  // GitHub
      '185.199.108.153', // GitHub
      '185.199.109.153', // GitHub
      '185.199.110.153', // GitHub
      '185.199.111.153', // GitHub
      
      // CDN IPs
      '104.16.124.96', // Cloudflare
      '104.16.125.96', // Cloudflare
      '104.16.126.96', // Cloudflare
      
      // Social Media
      '157.240.241.35', // Facebook
      '157.240.241.36', // Facebook
      '157.240.241.37', // Facebook
      
      // Search Engines
      '142.250.191.78', // Google
      '142.250.191.79', // Google
      '142.250.191.80', // Google
      
      // Streaming
      '151.101.1.69',   // Reddit
      '151.101.1.70',   // Reddit
      '151.101.1.71',   // Reddit
    ]
    
    console.log(`📊 Importing data for ${testIPs.length} IP addresses...`)
    
    let importedCount = 0
    let errorCount = 0
    let updatedCount = 0
    
    for (const ip of testIPs) {
      try {
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
              console.log(`❌ All lookup methods failed for IP: ${ip}`)
              errorCount++
              continue
            }
          }
        }
        
        if (!location) {
          console.log(`❌ No location data for IP: ${ip}`)
          errorCount++
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
          console.log(`🔄 Updated: ${ip} -> ${geoData.city || 'N/A'}, ${geoData.country || 'N/A'}`)
          updatedCount++
        } else {
          // Create new record
          await prisma.geoIPData.create({
            data: {
              ...geoData,
              createdAt: new Date()
            }
          })
          console.log(`✅ Imported: ${ip} -> ${geoData.city || 'N/A'}, ${geoData.country || 'N/A'}`)
          importedCount++
        }
        
      } catch (error) {
        console.error(`❌ Error importing IP ${ip}:`, error.message)
        errorCount++
      }
    }
    
    console.log('\n📈 Import Summary:')
    console.log(`✅ Successfully imported: ${importedCount} new records`)
    console.log(`🔄 Updated: ${updatedCount} existing records`)
    console.log(`❌ Errors: ${errorCount} records`)
    console.log(`📊 Total processed: ${testIPs.length} IPs`)
    
  } catch (error) {
    console.error('❌ Error during import:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the import
importGeoIPData() 