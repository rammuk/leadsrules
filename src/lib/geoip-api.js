/**
 * GeoIP utilities using MaxMind Cloud API
 * This is the recommended approach for Vercel deployment
 */

const MAXMIND_ACCOUNT_ID = process.env.MAXMIND_ACCOUNT_ID
const MAXMIND_LICENSE_KEY = process.env.MAXMIND_LICENSE_KEY

/**
 * Get location data from MaxMind Cloud API
 * @param {string} ip - The IP address to lookup
 * @returns {Object|null} Location data or null if not found
 */
async function getLocationFromAPI(ip) {
  if (!MAXMIND_ACCOUNT_ID || !MAXMIND_LICENSE_KEY) {
    console.log('MaxMind credentials not configured')
    return null
  }

  try {
    // Skip local/private IPs
    if (ip === '127.0.0.1' || ip === 'localhost' || ip.startsWith('192.168.') || ip.startsWith('10.') || ip.startsWith('172.')) {
      console.log('Skipping local/private IP:', ip)
      return null
    }

    const url = `https://geoip.maxmind.com/geoip/v2.1/city/${ip}`
    const auth = Buffer.from(`${MAXMIND_ACCOUNT_ID}:${MAXMIND_LICENSE_KEY}`).toString('base64')
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Basic ${auth}`,
        'User-Agent': 'LeadsRules/1.0'
      }
    })

    if (!response.ok) {
      
      console.error('MaxMind API error:', response.status, response.statusText)
     
      return null
    }

    const data = await response.json()
    
    return {
      ip: data.traits?.ip_address || ip,
      country: data.country?.names?.en || null,
      countryCode: data.country?.iso_code || null,
      region: data.subdivisions?.[0]?.names?.en || null,
      regionCode: data.subdivisions?.[0]?.iso_code || null,
      city: data.city?.names?.en || null,
      postalCode: data.postal?.code || null,
      latitude: data.location?.latitude || null,
      longitude: data.location?.longitude || null,
      timezone: data.location?.time_zone || null,
      isp: data.traits?.isp || null,
      organization: data.traits?.organization || null,
      accuracy: data.location?.accuracy_radius || null
    }
  } catch (error) {
    console.error('Error fetching from MaxMind API:', error)
    return null
  }
}

/**
 * Get client IP from request headers
 * @param {Request} request - The request object
 * @returns {string} The client IP address
 */
function getClientIP(request) {
  const forwardedFor = request.headers.get('x-forwarded-for')
  const realIP = request.headers.get('x-real-ip')
  const cfConnectingIP = request.headers.get('cf-connecting-ip')
  const clientIP = request.headers.get('x-client-ip')
  
  if (forwardedFor) {
    // x-forwarded-for can contain multiple IPs, take the first one
    return forwardedFor.split(',')[0].trim()
  } else if (realIP) {
    return realIP
  } else if (cfConnectingIP) {
    return cfConnectingIP
  } else if (clientIP) {
    return clientIP
  }
  
  return '127.0.0.1' // fallback
}

/**
 * Get detailed location information
 * @param {string} ip - The IP address
 * @returns {Object} Detailed location information
 */
async function getDetailedLocation(ip) {
  const location = await getLocationFromAPI(ip)
  
  if (!location) {
    return {
      ip,
      location: null,
      error: 'Unable to determine location'
    }
  }

  return {
    ip: location.ip,
    location: {
      country: location.country,
      countryCode: location.countryCode,
      region: location.region,
      regionCode: location.regionCode,
      city: location.city,
      postalCode: location.postalCode,
      coordinates: location.latitude && location.longitude ? {
        lat: location.latitude,
        lng: location.longitude
      } : null,
      timezone: location.timezone,
      isp: location.isp,
      organization: location.organization,
      accuracy: location.accuracy
    },
    formatted: formatLocation(location)
  }
}

/**
 * Format location data for display
 * @param {Object} location - Location data
 * @returns {string} Formatted location string
 */
function formatLocation(location) {
  const parts = []
  
  if (location.city) parts.push(location.city)
  if (location.region) parts.push(location.region)
  if (location.country) parts.push(location.country)
  
  return parts.length > 0 ? parts.join(', ') : 'Unknown location'
}

/**
 * Calculate distance between two coordinates using Haversine formula
 * @param {number} lat1 - First latitude
 * @param {number} lon1 - First longitude
 * @param {number} lat2 - Second latitude
 * @param {number} lon2 - Second longitude
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

export {
  getLocationFromAPI,
  getClientIP,
  getDetailedLocation,
  formatLocation,
  calculateDistance
} 