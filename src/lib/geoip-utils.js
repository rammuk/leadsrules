/**
 * Utility functions for extracting client IP from request headers
 * This replaces the need for middleware
 */

/**
 * Extract client IP from request headers
 * @param {Request} request - The request object
 * @returns {string} The client IP address
 */
export function getClientIP(request) {
  // Try various headers in order of preference
  const headers = [
    'x-forwarded-for',
    'x-real-ip', 
    'cf-connecting-ip',
    'x-client-ip'
  ]
  
  for (const header of headers) {
    const value = request.headers.get(header)
    if (value) {
      // x-forwarded-for can contain multiple IPs, take the first one
      const ip = header === 'x-forwarded-for' 
        ? value.split(',')[0].trim()
        : value.trim()
      
      if (ip && ip !== 'unknown' && ip !== 'null') {
        return ip
      }
    }
  }
  
  // Fallback for development
  return '127.0.0.1'
}

/**
 * Check if IP is local/private
 * @param {string} ip - The IP address to check
 * @returns {boolean} True if local/private IP
 */
export function isLocalIP(ip) {
  if (!ip) return true
  
  const localPatterns = [
    /^127\./,           // 127.0.0.0/8
    /^10\./,            // 10.0.0.0/8
    /^172\.(1[6-9]|2[0-9]|3[0-1])\./, // 172.16.0.0/12
    /^192\.168\./,      // 192.168.0.0/16
    /^::1$/,            // IPv6 localhost
    /^localhost$/,      // localhost
    /^unknown$/,        // unknown
    /^null$/            // null
  ]
  
  return localPatterns.some(pattern => pattern.test(ip))
}

/**
 * Get a test IP for development when client IP is local
 * @param {string} clientIP - The client IP
 * @returns {string} Test IP or original IP
 */
export function getTestIP(clientIP) {
  if (isLocalIP(clientIP)) {
    return '8.8.8.8' // Google DNS for testing
  }
  return clientIP
} 