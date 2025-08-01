'use client'

import { useState } from 'react'
import {
  Box,
  VStack,
  HStack,
  Heading,
  Text,
  Input,
  Button,
  Card,
  Badge,
  Alert,
  Spinner
} from '@chakra-ui/react'

export default function GeoIPTestPage() {
  const [ip, setIp] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLookup = async () => {
    if (!ip.trim()) {
      setError('Please enter an IP address')
      return
    }

    setLoading(true)
    setError('')
    setResult(null)

    try {
      const response = await fetch(`/api/geoip/lookup?ip=${encodeURIComponent(ip.trim())}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to lookup IP')
      }

      setResult(data)
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleMyIP = async () => {
    setLoading(true)
    setError('')
    setResult(null)

    try {
      const response = await fetch('/api/geoip/lookup')
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to lookup your IP')
      }

      setResult(data)
      setIp(data.ip)
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box minH="100vh" p="8">
      <VStack gap="8" align="stretch">
        <Heading size="xl">GeoIP Test Page</Heading>
        
        <Text color="fg.muted">
          Test the GeoIP functionality by looking up IP addresses and getting location data.
        </Text>

        <Card.Root>
          <Card.Header>
            <Heading size="md">IP Lookup</Heading>
          </Card.Header>
          <Card.Body>
            <VStack gap="4" align="stretch">
              <HStack gap="4">
                <Input
                  value={ip}
                  onChange={(e) => setIp(e.target.value)}
                  placeholder="Enter IP address (e.g., 8.8.8.8)"
                  disabled={loading}
                />
                <Button
                  onClick={handleLookup}
                  loading={loading}
                  disabled={loading}
                  colorPalette="blue"
                >
                  Lookup
                </Button>
                <Button
                  onClick={handleMyIP}
                  loading={loading}
                  disabled={loading}
                  variant="outline"
                >
                  My IP
                </Button>
              </HStack>

              {error && (
                <Alert status="error">
                  <Alert.Title>Error!</Alert.Title>
                  <Alert.Description>{error}</Alert.Description>
                </Alert>
              )}

              {loading && (
                <HStack justify="center" py="4">
                  <Spinner />
                  <Text>Looking up IP address...</Text>
                </HStack>
              )}

              {result && (
                <Card.Root variant="subtle">
                  <Card.Header>
                    <Heading size="sm">Location Data</Heading>
                  </Card.Header>
                  <Card.Body>
                    <VStack gap="3" align="stretch">
                      <HStack justify="space-between">
                        <Text fontWeight="medium">IP Address:</Text>
                        <Text fontFamily="mono">{result.ip}</Text>
                      </HStack>
                      
                      <HStack justify="space-between">
                        <Text fontWeight="medium">City:</Text>
                        <Text>{result.location.city || 'Unknown'}</Text>
                      </HStack>
                      
                      <HStack justify="space-between">
                        <Text fontWeight="medium">Region:</Text>
                        <Text>{result.location.region || 'Unknown'}</Text>
                      </HStack>
                      
                      <HStack justify="space-between">
                        <Text fontWeight="medium">Country:</Text>
                        <Text>{result.location.country || 'Unknown'}</Text>
                      </HStack>
                      
                      <HStack justify="space-between">
                        <Text fontWeight="medium">Continent:</Text>
                        <Text>{result.location.continent || 'Unknown'}</Text>
                      </HStack>
                      
                      <HStack justify="space-between">
                        <Text fontWeight="medium">Postal Code:</Text>
                        <Text>{result.location.postalCode || 'Unknown'}</Text>
                      </HStack>
                      
                      <HStack justify="space-between">
                        <Text fontWeight="medium">Timezone:</Text>
                        <Text>{result.location.timezone || 'Unknown'}</Text>
                      </HStack>
                      
                      <HStack justify="space-between">
                        <Text fontWeight="medium">Coordinates:</Text>
                        <Text>
                          {result.location.latitude && result.location.longitude 
                            ? `${result.location.latitude}, ${result.location.longitude}`
                            : 'Unknown'
                          }
                        </Text>
                      </HStack>
                      
                      <HStack justify="space-between">
                        <Text fontWeight="medium">Type:</Text>
                        <Badge 
                          colorPalette={result.location.isLocal ? "orange" : "green"}
                          variant="subtle"
                        >
                          {result.location.isLocal ? "Local Network" : "Public IP"}
                        </Badge>
                      </HStack>
                      
                      <HStack justify="space-between">
                        <Text fontWeight="medium">Lookup Time:</Text>
                        <Text fontSize="sm" color="fg.muted">
                          {new Date(result.location.lookupTime).toLocaleString()}
                        </Text>
                      </HStack>
                    </VStack>
                  </Card.Body>
                </Card.Root>
              )}
            </VStack>
          </Card.Body>
        </Card.Root>

        <Card.Root>
          <Card.Header>
            <Heading size="md">API Usage Examples</Heading>
          </Card.Header>
          <Card.Body>
            <VStack gap="4" align="stretch">
              <Box>
                <Text fontWeight="medium" mb="2">GET Request (Lookup specific IP):</Text>
                <Text fontFamily="mono" fontSize="sm" bg="gray.50" p="2" borderRadius="md">
                  GET /api/geoip/lookup?ip=8.8.8.8
                </Text>
              </Box>
              
              <Box>
                <Text fontWeight="medium" mb="2">GET Request (Your IP):</Text>
                <Text fontFamily="mono" fontSize="sm" bg="gray.50" p="2" borderRadius="md">
                  GET /api/geoip/lookup
                </Text>
              </Box>
              
              <Box>
                <Text fontWeight="medium" mb="2">POST Request (with distance calculation):</Text>
                <Text fontFamily="mono" fontSize="sm" bg="gray.50" p="2" borderRadius="md">
                  POST /api/geoip/lookup
                  {`\n`}
                  {`\n`}
                  {`{
  "ip": "8.8.8.8",
  "targetLocation": {
    "latitude": 40.7128,
    "longitude": -74.0060
  }
}`}
                </Text>
              </Box>
            </VStack>
          </Card.Body>
        </Card.Root>
      </VStack>
    </Box>
  )
} 