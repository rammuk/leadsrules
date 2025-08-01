import maxmind from 'maxmind'
import path from 'path'

let geoipReader = null

/**
 * Initialize the GeoIP2 reader
 */
async function initGeoIP() {
  if (!geoipReader) {
    try {
      const dbPath = path.join(process.cwd(), 'src/lib/GeoIP2-City.mmdb')
      geoipReader = await maxmind.open(dbPath)
      console.log('✅ GeoIP2 database loaded successfully')
    } catch (error) {
      console.error('❌ Error loading GeoIP2 database:', error)
      throw error
    }
  }
  return geoipReader
}

/**
 * Get location data from an IP address
 * @param {string} ip - The IP address to lookup
 * @returns {Object|null} Location data or null if not found
 */
export async function getLocationFromIP(ip) {
  try {
    // Handle localhost and private IPs
    if (ip === 'localhost' || ip === '127.0.0.1' || ip.startsWith('192.168.') || ip.startsWith('10.') || ip.startsWith('172.')) {
      return {
        city: 'Local',
        country: 'Local',
        region: 'Local',
        latitude: null,
        longitude: null,
        timezone: null,
        isLocal: true
      }
    }

    // Try to use MaxMind database
    try {
      const reader = await initGeoIP()
      
      console.log('Reader methods:', Object.getOwnPropertyNames(reader))
      console.log('Reader prototype methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(reader)))
      
      // Try different methods
      let result = null
      try {
        result = reader.city(ip)
      } catch (error) {
        console.log('city() method failed, trying get()')
        try {
          result = reader.get(ip)
        } catch (error2) {
          console.log('get() method failed, trying lookup()')
          try {
            result = reader.lookup(ip)
          } catch (error3) {
            console.log('All methods failed:', error3)
            return null
          }
        }
      }
      
      if (!result) {
        return null
      }

      return {
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
    } catch (maxmindError) {
      console.error('MaxMind database error:', maxmindError)
      return null
    }
  } catch (error) {
    console.error('Error getting location from IP:', error)
    return null
  }
}

/**
 * Get client IP from request headers
 * @param {Object} headers - Request headers
 * @returns {string} Client IP address
 */
export function getClientIP(headers) {
  // Check various headers for the real IP
  const forwardedFor = headers['x-forwarded-for']
  const realIP = headers['x-real-ip']
  const cfConnectingIP = headers['cf-connecting-ip']
  const xClientIP = headers['x-client-ip']
  
  console.log('Available headers for IP detection:', {
    'x-forwarded-for': forwardedFor,
    'x-real-ip': realIP,
    'cf-connecting-ip': cfConnectingIP,
    'x-client-ip': xClientIP
  })
  
  if (forwardedFor) {
    // x-forwarded-for can contain multiple IPs, take the first one
    const ip = forwardedFor.split(',')[0].trim()
    console.log('Found IP from x-forwarded-for:', ip)
    return ip
  }
  
  if (realIP) {
    console.log('Found IP from x-real-ip:', realIP)
    return realIP
  }
  
  if (cfConnectingIP) {
    console.log('Found IP from cf-connecting-ip:', cfConnectingIP)
    return cfConnectingIP
  }
  
  if (xClientIP) {
    console.log('Found IP from x-client-ip:', xClientIP)
    return xClientIP
  }
  
  console.log('No IP found in headers')
  return null
}

/**
 * Get detailed location information including distance calculations
 * @param {string} ip - The IP address to lookup
 * @param {Object} targetLocation - Optional target location for distance calculation
 * @returns {Object} Detailed location information
 */
export async function getDetailedLocation(ip, targetLocation = null) {
  const location = await getLocationFromIP(ip)
  
  if (!location) {
    return null
  }

  let distance = null
  if (targetLocation && location.latitude && location.longitude) {
    distance = calculateDistance(
      location.latitude,
      location.longitude,
      targetLocation.latitude,
      targetLocation.longitude
    )
  }

  return {
    ...location,
    distance,
    lookupTime: new Date().toISOString()
  }
}

/**
 * Calculate distance between two points using Haversine formula
 * @param {number} lat1 - Latitude of point 1
 * @param {number} lon1 - Longitude of point 1
 * @param {number} lat2 - Latitude of point 2
 * @param {number} lon2 - Longitude of point 2
 * @returns {number} Distance in kilometers
 */
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371 // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  return R * c
}

/**
 * Get location data with caching (basic implementation)
 * @param {string} ip - The IP address to lookup
 * @returns {Object} Cached location data
 */
const locationCache = new Map()
const CACHE_DURATION = 24 * 60 * 60 * 1000 // 24 hours

export async function getCachedLocation(ip) {
  const now = Date.now()
  const cached = locationCache.get(ip)
  
  if (cached && (now - cached.timestamp) < CACHE_DURATION) {
    return cached.data
  }
  
  const location = await getLocationFromIP(ip)
  
  if (location) {
    locationCache.set(ip, {
      data: location,
      timestamp: now
    })
  }
  
  return location
}

export default {
  getLocationFromIP,
  getClientIP,
  getDetailedLocation,
  getCachedLocation
} 