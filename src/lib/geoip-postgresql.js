import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export class PostgreSQLGeoIP {
  constructor() {
    this.prisma = prisma
  }

  /**
   * Lookup IP address using PostgreSQL cidr type
   * @param {string} ip - IP address to lookup
   * @returns {Promise<Object|null>} GeoIP data or null if not found
   */
  async lookup(ip) {
    try {
      const startTime = performance.now()
      
      // Use raw SQL to avoid Prisma's cidr type issues
      const result = await this.prisma.$queryRaw`
        SELECT 
          net.network::text as network,
          net.latitude,
          net.longitude,
          net.accuracy_radius,
          net.postal_code,
          net.is_anonymous_proxy,
          net.is_satellite_provider,
          loc.city_name,
          loc.country_name,
          loc.country_iso_code,
          loc.subdivision_1_name,
          loc.subdivision_1_iso_code,
          loc.subdivision_2_name,
          loc.subdivision_2_iso_code,
          loc.time_zone,
          loc.continent_name,
          loc.continent_code
        FROM geoip2_network net
        LEFT JOIN geoip2_location loc ON (
          net.geoname_id = loc.geoname_id
          AND loc.locale_code = 'en'
        )
        WHERE net.network::cidr >>= ${ip}::inet
        ORDER BY net.accuracy_radius ASC
        LIMIT 1
      `

      const fetchTime = performance.now() - startTime

      if (result.length === 0) {
        return {
          status: 'no_data',
          fetchTime: Math.round(fetchTime),
          data: null,
          error: null
        }
      }

      const record = result[0]
      
      return {
        status: 'success',
        fetchTime: Math.round(fetchTime),
        data: {
          ip: ip,
          country: record.country_name,
          countryCode: record.country_iso_code,
          region: record.subdivision_1_name,
          regionCode: record.subdivision_1_iso_code,
          city: record.city_name,
          postalCode: record.postal_code,
          latitude: record.latitude ? parseFloat(record.latitude) : null,
          longitude: record.longitude ? parseFloat(record.longitude) : null,
          timezone: record.time_zone,
          accuracy: record.accuracy_radius,
          isAnonymousProxy: record.is_anonymous_proxy,
          isSatelliteProvider: record.is_satellite_provider,
          continent: record.continent_name,
          continentCode: record.continent_code,
          network: record.network
        },
        error: null
      }

    } catch (error) {
      console.error('PostgreSQL GeoIP lookup error:', error)
      return {
        status: 'error',
        fetchTime: 0,
        data: null,
        error: error.message
      }
    }
  }

  /**
   * Get statistics about the database
   * @returns {Promise<Object>} Database statistics
   */
  async getStats() {
    try {
      const [networkCount, locationCount] = await Promise.all([
        this.prisma.$queryRaw`SELECT COUNT(*) as count FROM geoip2_network`,
        this.prisma.geoIP2Location.count()
      ])

      return {
        networkRecords: parseInt(networkCount[0].count),
        locationRecords: locationCount,
        totalRecords: parseInt(networkCount[0].count) + locationCount
      }
    } catch (error) {
      console.error('Error getting PostgreSQL GeoIP stats:', error)
      return null
    }
  }

  /**
   * Test the lookup functionality
   * @param {string} testIP - IP to test
   * @returns {Promise<Object>} Test results
   */
  async testLookup(testIP = '8.8.8.8') {
    console.log(`🧪 Testing PostgreSQL GeoIP lookup for ${testIP}...`)
    
    const result = await this.lookup(testIP)
    
    if (result.status === 'success') {
      console.log('✅ Test successful:')
      console.log(`   Country: ${result.data.country}`)
      console.log(`   City: ${result.data.city || 'N/A'}`)
      console.log(`   Coordinates: ${result.data.latitude}, ${result.data.longitude}`)
      console.log(`   Network: ${result.data.network}`)
      console.log(`   Fetch time: ${result.fetchTime}ms`)
    } else {
      console.log(`❌ Test failed: ${result.error || 'No data found'}`)
    }
    
    return result
  }
}

// Export singleton instance
export const postgresqlGeoIP = new PostgreSQLGeoIP() 