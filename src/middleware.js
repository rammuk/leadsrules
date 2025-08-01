import { NextResponse } from 'next/server'

export function middleware(request) {
  // Get client IP from various headers
  const forwardedFor = request.headers.get('x-forwarded-for')
  const realIP = request.headers.get('x-real-ip')
  const cfConnectingIP = request.headers.get('cf-connecting-ip')
  
  let clientIP = null
  
  if (forwardedFor) {
    // x-forwarded-for can contain multiple IPs, take the first one
    clientIP = forwardedFor.split(',')[0].trim()
  } else if (realIP) {
    clientIP = realIP
  } else if (cfConnectingIP) {
    clientIP = cfConnectingIP
  }

  // Add IP to request headers for use in API routes
  const requestHeaders = new Headers(request.headers)
  if (clientIP) {
    requestHeaders.set('x-client-ip', clientIP)
  }

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
} 