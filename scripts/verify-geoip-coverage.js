const { PrismaClient } = require('@prisma/client')
const maxmind = require('maxmind')
const path = require('path')

const prisma = new PrismaClient()

/**
 * Verify that all data from .mmdb file is in the database
 */
async function verifyGeoIPCoverage() {
  try {
    console.log('🔍 Verifying GeoIP Database Coverage')
    console.log('====================================')
    
    // Open the MaxMind database
    const dbPath = path.join(process.cwd(), 'src/lib/GeoIP2-City.mmdb')
    console.log('📂 Opening MaxMind database:', dbPath)
    
    const reader = await maxmind.open(dbPath)
    console.log('✅ MaxMind database loaded successfully')
    
    // Get database counts
    const dbCount = await prisma.geoIPData.count()
    console.log(`\n📊 Database Statistics:`)
    console.log(`   Total records in database: ${dbCount.toLocaleString()}`)
    
    // Test IPs that we know have data in our database
    const knownIPs = [
      '8.8.8.8', '1.1.1.1', '208.67.222.222', '142.250.191.78',
      '157.240.241.35', '104.244.42.193', '151.101.1.69', '13.107.42.14',
      '52.84.123.78', '172.217.169.46', '5.61.161.163', '185.199.108.153',
      '151.101.193.69', '104.16.124.96', '203.208.60.1', '180.149.131.81',
      '199.232.69.194', '140.82.112.4', '185.199.109.153', '185.199.110.153',
      '185.199.111.153', '104.16.125.96', '104.16.126.96', '157.240.241.36',
      '157.240.241.37', '142.250.191.79', '142.250.191.80', '151.101.1.70',
      '151.101.1.71', '223.243.51.36', '223.240.163.200', '223.238.20.108',
      '223.235.133.16', '223.232.245.180', '223.230.102.88', '223.225.71.160',
      '223.222.184.68', '223.217.153.140', '223.215.10.48', '223.212.122.212'
    ]
    
    console.log(`\n🎯 Testing ${knownIPs.length} known IPs...`)
    
    let foundInMMDB = 0
    let foundInDB = 0
    let dataMatches = 0
    
    for (const ip of knownIPs) {
      // Check if IP exists in MaxMind database
      let mmdbData = null
      try {
        mmdbData = reader.city(ip) || reader.get(ip) || reader.lookup(ip)
      } catch (e) {
        // IP not found in MaxMind
      }
      
      if (mmdbData) {
        foundInMMDB++
      }
      
      // Check if IP exists in our database
      const dbData = await prisma.geoIPData.findUnique({
        where: { ip: ip }
      })
      
      if (dbData) {
        foundInDB++
        
        // Check if data matches
        if (mmdbData && compareLocationData(mmdbData, dbData)) {
          dataMatches++
        }
      }
      
      // Show progress for each IP
      console.log(`   ${ip}: MMDB=${mmdbData ? '✓' : '✗'}, DB=${dbData ? '✓' : '✗'}, Match=${(mmdbData && dbData && compareLocationData(mmdbData, dbData)) ? '✓' : '✗'}`)
    }
    
    // Overall results
    console.log('\n📈 Coverage Results:')
    console.log(`   Total tested: ${knownIPs.length}`)
    console.log(`   Found in MaxMind: ${foundInMMDB}`)
    console.log(`   Found in Database: ${foundInDB}`)
    console.log(`   Data matches: ${dataMatches}`)
    console.log(`   Coverage: ${foundInMMDB > 0 ? ((foundInDB / foundInMMDB) * 100).toFixed(1) : 0}%`)
    console.log(`   Data accuracy: ${foundInDB > 0 ? ((dataMatches / foundInDB) * 100).toFixed(1) : 0}%`)
    
    // Test random IPs from our database
    console.log('\n🎲 Testing random IPs from our database...')
    const randomDBIPs = await prisma.geoIPData.findMany({
      take: 20,
      orderBy: {
        createdAt: 'desc'
      }
    })
    
    let randomFoundInMMDB = 0
    let randomDataMatches = 0
    
    for (const record of randomDBIPs) {
      // Check if IP exists in MaxMind database
      let mmdbData = null
      try {
        mmdbData = reader.city(record.ip) || reader.get(record.ip) || reader.lookup(record.ip)
      } catch (e) {
        // IP not found in MaxMind
      }
      
      if (mmdbData) {
        randomFoundInMMDB++
        
        // Check if data matches
        if (compareLocationData(mmdbData, record)) {
          randomDataMatches++
        }
      }
      
      console.log(`   ${record.ip}: MMDB=${mmdbData ? '✓' : '✗'}, Match=${(mmdbData && compareLocationData(mmdbData, record)) ? '✓' : '✗'}`)
    }
    
    console.log(`\n📊 Random Database IPs Results:`)
    console.log(`   Tested: ${randomDBIPs.length}`)
    console.log(`   Found in MaxMind: ${randomFoundInMMDB}`)
    console.log(`   Data matches: ${randomDataMatches}`)
    console.log(`   Match rate: ${randomDBIPs.length > 0 ? ((randomDataMatches / randomDBIPs.length) * 100).toFixed(1) : 0}%`)
    
    // Recommendations
    console.log('\n💡 Recommendations:')
    if (foundInDB / foundInMMDB < 0.9) {
      console.log('   ⚠️  Coverage is below 90%. Consider running the complete import script.')
    } else {
      console.log('   ✅ Coverage is excellent (above 90%)!')
    }
    
    if (dataMatches / foundInDB < 0.95) {
      console.log('   ⚠️  Data accuracy is below 95%. Some records may need updating.')
    } else {
      console.log('   ✅ Data accuracy is excellent (above 95%)!')
    }
    
    if (randomDataMatches / randomDBIPs.length < 0.8) {
      console.log('   ⚠️  Random IP match rate is below 80%. Database may have incomplete data.')
    } else {
      console.log('   ✅ Random IP match rate is excellent (above 80%)!')
    }
    
  } catch (error) {
    console.error('❌ Error during verification:', error)
  } finally {
    await prisma.$disconnect()
  }
}

/**
 * Compare location data between MaxMind and database
 */
function compareLocationData(mmdbData, dbData) {
  // Compare key fields
  const mmdbCountry = mmdbData.country?.names?.en || null
  const dbCountry = dbData.country
  
  const mmdbCity = mmdbData.city?.names?.en || null
  const dbCity = dbData.city
  
  const mmdbLat = mmdbData.location?.latitude || null
  const dbLat = dbData.latitude
  
  const mmdbLng = mmdbData.location?.longitude || null
  const dbLng = dbData.longitude
  
  // Check if data matches (allowing for some tolerance in coordinates)
  const countryMatch = mmdbCountry === dbCountry
  const cityMatch = mmdbCity === dbCity
  const coordMatch = (mmdbLat && dbLat && Math.abs(mmdbLat - dbLat) < 0.1) &&
                     (mmdbLng && dbLng && Math.abs(mmdbLng - dbLng) < 0.1)
  
  return countryMatch && cityMatch && coordMatch
}

// Run the verification
verifyGeoIPCoverage() 