const maxmind = require('maxmind')
const path = require('path')

async function testGeoIP() {
  try {
    console.log('Testing GeoIP lookup for IP: 207.89.66.149')
    
    // Load the database
    const dbPath = path.join(process.cwd(), 'src/lib/GeoIP2-City.mmdb')
    console.log('Database path:', dbPath)
    
    const reader = await maxmind.open(dbPath)
    console.log('✅ Database loaded successfully')
    
    // Test the IP
    const ip = '207.89.66.149'
    console.log('Testing IP:', ip)
    
    // Try different methods
    let result = null
    
    try {
      result = reader.city(ip)
      console.log('✅ city() method worked')
    } catch (error) {
      console.log('❌ city() method failed:', error.message)
      
      try {
        result = reader.get(ip)
        console.log('✅ get() method worked')
      } catch (error2) {
        console.log('❌ get() method failed:', error2.message)
        
        try {
          result = reader.lookup(ip)
          console.log('✅ lookup() method worked')
        } catch (error3) {
          console.log('❌ lookup() method failed:', error3.message)
        }
      }
    }
    
    if (result) {
      console.log('✅ Found result:', JSON.stringify(result, null, 2))
      
      const location = {
        city: result.city?.names?.en || null,
        country: result.country?.names?.en || null,
        region: result.subdivisions?.[0]?.names?.en || null,
        latitude: result.location?.latitude || null,
        longitude: result.location?.longitude || null,
        timezone: result.location?.time_zone || null,
        postalCode: result.postal?.code || null,
        continent: result.continent?.names?.en || null,
        isLocal: false
      }
      
      console.log('✅ Processed location:', JSON.stringify(location, null, 2))
    } else {
      console.log('❌ No result found for IP:', ip)
    }
    
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

testGeoIP() 