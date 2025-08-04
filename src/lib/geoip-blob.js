import maxmind from 'maxmind'

let reader = null
let blobUrl = null

/**
 * Get the blob URL for the .mmdb file
 * You can set this via environment variable or upload script
 */
function getBlobUrl() {
  // Try to get from environment variable first
  if (process.env.MMDB_BLOB_URL) {
    return process.env.MMDB_BLOB_URL
  }
  
  // Fallback to a default URL (you'll need to update this after uploading)
  return blobUrl || 'https://smyx7lwvy7bvg7j5.public.blob.vercel-storage.com/GeoIP2-City.mmdb'
}

/**
 * Download .mmdb file from Vercel Blob and create maxmind reader
 */
async function initializeReader() {
  if (reader) {
    return reader
  }

  try {
    console.log('📥 Downloading .mmdb file from Vercel Blob...')
    
    const url = getBlobUrl()
    const { blob } = await getBlob(url)
    
    if (!blob) {
      throw new Error('Failed to download .mmdb file from blob')
    }
    
    // Convert blob to buffer
    const arrayBuffer = await blob.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    
    // Create maxmind reader
    reader = await maxmind.open(buffer)
    
    console.log('✅ MaxMind reader initialized from blob')
    return reader
    
  } catch (error) {
    console.error('❌ Error initializing MaxMind reader from blob:', error)
    throw error
  }
}

/**
 * Get location from IP using .mmdb file from Vercel Blob
 */
export async function getLocationFromIPBlob(ip) {
  try {
    if (!reader) {
      await initializeReader()
    }
    
    const result = reader.city(ip)
    
    if (!result) {
      return null
    }
    
    return {
      ip: ip,
      country: result.country?.names?.en || null,
      countryCode: result.country?.iso_code || null,
      region: result.subdivisions?.[0]?.names?.en || null,
      regionCode: result.subdivisions?.[0]?.iso_code || null,
      city: result.city?.names?.en || null,
      postalCode: result.postal?.code || null,
      latitude: result.location?.latitude || null,
      longitude: result.location?.longitude || null,
      timezone: result.location?.time_zone || null,
      isp: result.traits?.isp || null,
      organization: result.traits?.organization || null,
      accuracy: result.location?.accuracy_radius || null
    }
    
  } catch (error) {
    console.error('Error getting location from IP (blob):', error)
    return null
  }
}

/**
 * Set the blob URL (useful for testing)
 */
export function setBlobUrl(url) {
  blobUrl = url
}

/**
 * Get metadata about the .mmdb file
 */
export async function getMMDBMetadata() {
  try {
    if (!reader) {
      await initializeReader()
    }
    
    return reader.metadata()
  } catch (error) {
    console.error('Error getting MMDB metadata:', error)
    return null
  }
} 