/**
 * Production GeoIP using CDN-hosted .mmdb file
 * This approach downloads the database from a CDN and caches it
 */

let geoipReader = null
let lastDownloadTime = 0
const CACHE_DURATION = 24 * 60 * 60 * 1000 // 24 hours

/**
 * Download .mmdb file from CDN
 * @param {string} cdnUrl - URL to the .mmdb file
 * @returns {Promise<ArrayBuffer>} The database file as ArrayBuffer
 */
async function downloadDatabase(cdnUrl) {
  try {
    console.log('Downloading GeoIP database from CDN:', cdnUrl)
    const response = await fetch(cdnUrl)
    
    if (!response.ok) {
      throw new Error(`Failed to download database: ${response.status}`)
    }
    
    const arrayBuffer = await response.arrayBuffer()
    console.log('Database downloaded successfully:', arrayBuffer.byteLength, 'bytes')
    return arrayBuffer
  } catch (error) {
    console.error('Error downloading database:', error)
    throw error
  }
}

/**
 * Initialize GeoIP reader from CDN
 * @param {string} cdnUrl - URL to the .mmdb file
 * @returns {Promise<Object>} MaxMind reader object
 */
async function initGeoIPFromCDN(cdnUrl) {
  if (geoipReader && (Date.now() - lastDownloadTime) < CACHE_DURATION) {
    return geoipReader
  }
  
  try {
    const arrayBuffer = await downloadDatabase(cdnUrl)
    
    // Use maxmind library to open the database
    const maxmind = require('maxmind')
    geoipReader = await maxmind.open(arrayBuffer)
    lastDownloadTime = Date.now()
    
    console.log('GeoIP database initialized from CDN')
    return geoipReader
  } catch (error) {
    console.error('Failed to initialize GeoIP from CDN:', error)
    throw error
  }
}

/**
 * Get location data from an IP address using CDN database
 * @param {string} ip - The IP address to lookup
 * @param {string} cdnUrl - URL to the .mmdb file
 * @returns {Object|null} Location data or null if not found
 */
async function getLocationFromCDN(ip, cdnUrl) {
  try {
    const reader = await initGeoIPFromCDN(cdnUrl)
    
    if (!reader) {
      console.log('GeoIP: Reader not available')
      return null
    }
    
    // Try different methods to get location data
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
          console.log('All lookup methods failed for IP:', ip)
          return null
        }
      }
    }
    
    if (!location) {
      return null
    }
    
    return {
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
      accuracy: location.location?.accuracy_radius || null
    }
  } catch (error) {
    console.error('Error getting location from CDN:', error)
    return null
  }
}

export {
  getLocationFromCDN,
  initGeoIPFromCDN
} 