import { postgresqlGeoIP } from './src/lib/geoip-postgresql.js'

async function testPostgreSQLGeoIP() {
  console.log('🧪 Testing PostgreSQL GeoIP functionality...\n')
  
  // Test 1: Get stats
  console.log('📊 Getting database statistics...')
  const stats = await postgresqlGeoIP.getStats()
  if (stats) {
    console.log(`   Network records: ${stats.networkRecords.toLocaleString()}`)
    console.log(`   Location records: ${stats.locationRecords.toLocaleString()}`)
    console.log(`   Total records: ${stats.totalRecords.toLocaleString()}`)
  }
  
  // Test 2: Lookup Google DNS
  console.log('\n🔍 Testing lookup for 8.8.8.8 (Google DNS)...')
  const result1 = await postgresqlGeoIP.lookup('8.8.8.8')
  console.log(`   Status: ${result1.status}`)
  console.log(`   Fetch time: ${result1.fetchTime}ms`)
  if (result1.data) {
    console.log(`   Country: ${result1.data.country}`)
    console.log(`   City: ${result1.data.city || 'N/A'}`)
    console.log(`   Coordinates: ${result1.data.latitude}, ${result1.data.longitude}`)
    console.log(`   Network: ${result1.data.network}`)
  }
  
  // Test 3: Lookup Cloudflare DNS
  console.log('\n🔍 Testing lookup for 1.1.1.1 (Cloudflare DNS)...')
  const result2 = await postgresqlGeoIP.lookup('1.1.1.1')
  console.log(`   Status: ${result2.status}`)
  console.log(`   Fetch time: ${result2.fetchTime}ms`)
  if (result2.data) {
    console.log(`   Country: ${result2.data.country}`)
    console.log(`   City: ${result2.data.city || 'N/A'}`)
    console.log(`   Coordinates: ${result2.data.latitude}, ${result2.data.longitude}`)
    console.log(`   Network: ${result2.data.network}`)
  }
  
  // Test 4: Lookup a European IP
  console.log('\n🔍 Testing lookup for 207.89.66.149 (European IP)...')
  const result3 = await postgresqlGeoIP.lookup('207.89.66.149')
  console.log(`   Status: ${result3.status}`)
  console.log(`   Fetch time: ${result3.fetchTime}ms`)
  if (result3.data) {
    console.log(`   Country: ${result3.data.country}`)
    console.log(`   City: ${result3.data.city || 'N/A'}`)
    console.log(`   Coordinates: ${result3.data.latitude}, ${result3.data.longitude}`)
    console.log(`   Network: ${result3.data.network}`)
  }
  
  console.log('\n✅ PostgreSQL GeoIP testing completed!')
}

testPostgreSQLGeoIP().catch(console.error) 