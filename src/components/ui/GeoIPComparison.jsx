'use client'

import { useState, useEffect } from 'react'
import {
  Box,
  Card,
  Heading,
  Text,
  VStack,
  HStack,
  Badge,
  Spinner,
  Alert,
  Button,
  Grid,
  GridItem
} from '@chakra-ui/react'

export default function GeoIPComparison() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchComparison = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const startTime = performance.now()
      const response = await fetch('/api/geoip/compare')
      const endTime = performance.now()
      const fetchTime = endTime - startTime
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const result = await response.json()
      setData({ ...result, fetchTime })
    } catch (err) {
      console.error('Error fetching comparison:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchComparison()
  }, [])

  if (loading) {
    return (
      <Card.Root>
        <Card.Body>
          <VStack gap={4}>
            <Spinner size="lg" />
            <Text>Comparing GeoIP methods...</Text>
          </VStack>
        </Card.Body>
      </Card.Root>
    )
  }

  if (error) {
    return (
      <Card.Root>
        <Card.Body>
          <Alert.Root status="error">
            <Alert.Indicator />
            <Alert.Content>
              <Alert.Title>Error!</Alert.Title>
              <Alert.Description>{error}</Alert.Description>
            </Alert.Content>
          </Alert.Root>
          <Button mt={4} onClick={fetchComparison}>
            Retry Comparison
          </Button>
        </Card.Body>
      </Card.Root>
    )
  }

  if (!data) return null

  const { ip, localDatabase, maxmindApi, comparison, fetchTime } = data

  return (
    <Card.Root>
      <Card.Header>
        <Heading size="md">GeoIP Performance Comparison</Heading>
        <Text color="fg.muted" fontSize="sm">
          Comparing local database vs MaxMind API for IP: {ip}
        </Text>
      </Card.Header>
      <Card.Body>
        <VStack gap={6} align="stretch">
          {/* Overall Results */}
          <Box>
            <HStack justify="space-between" mb={2}>
              <Text fontWeight="semibold">Performance Summary</Text>
              <Badge 
                colorPalette={comparison.fasterMethod === 'Local Database' ? 'green' : 'blue'}
                variant="subtle"
              >
                {comparison.fasterMethod} is faster
              </Badge>
            </HStack>
            <Text fontSize="sm" color="fg.muted">
              Time difference: {comparison.timeDifference}ms • Recommendation: {comparison.recommendation}
            </Text>
            <Text fontSize="sm" color="fg.muted">
              Accuracy: {comparison.accuracy}
            </Text>
          </Box>

          {/* Method Comparison Grid */}
          <Grid templateColumns="1fr 1fr" gap={4}>
            {/* Local Database */}
            <GridItem>
              <Card.Root variant="outline">
                <Card.Header>
                  <HStack justify="space-between">
                    <Text fontWeight="semibold">Local Database</Text>
                    <Badge 
                      colorPalette={localDatabase.status === 'success' ? 'green' : 'red'}
                      variant="subtle"
                    >
                      {localDatabase.status}
                    </Badge>
                  </HStack>
                </Card.Header>
                <Card.Body>
                  <VStack gap={2} align="stretch">
                    <Text fontSize="sm">
                      <strong>Lookup Time:</strong> {localDatabase.lookupTime.toFixed(2)}ms
                    </Text>
                    {localDatabase.location ? (
                      <>
                        <Text fontSize="sm">
                          <strong>City:</strong> {localDatabase.location.city || 'Unknown'}
                        </Text>
                        <Text fontSize="sm">
                          <strong>Country:</strong> {localDatabase.location.country || 'Unknown'}
                        </Text>
                        <Text fontSize="sm">
                          <strong>Region:</strong> {localDatabase.location.region || 'Unknown'}
                        </Text>
                        {localDatabase.location.latitude && (
                          <Text fontSize="sm">
                            <strong>Coordinates:</strong> {localDatabase.location.latitude.toFixed(4)}, {localDatabase.location.longitude.toFixed(4)}
                          </Text>
                        )}
                      </>
                    ) : (
                      <Text fontSize="sm" color="fg.muted">
                        No location data available
                      </Text>
                    )}
                  </VStack>
                </Card.Body>
              </Card.Root>
            </GridItem>

            {/* MaxMind API */}
            <GridItem>
              <Card.Root variant="outline">
                <Card.Header>
                  <HStack justify="space-between">
                    <Text fontWeight="semibold">MaxMind API</Text>
                    <Badge 
                      colorPalette={maxmindApi.status === 'success' ? 'green' : 'red'}
                      variant="subtle"
                    >
                      {maxmindApi.status}
                    </Badge>
                  </HStack>
                </Card.Header>
                <Card.Body>
                  <VStack gap={2} align="stretch">
                    <Text fontSize="sm">
                      <strong>Lookup Time:</strong> {maxmindApi.lookupTime.toFixed(2)}ms
                    </Text>
                    {maxmindApi.location ? (
                      <>
                        <Text fontSize="sm">
                          <strong>City:</strong> {maxmindApi.location.city || 'Unknown'}
                        </Text>
                        <Text fontSize="sm">
                          <strong>Country:</strong> {maxmindApi.location.country || 'Unknown'}
                        </Text>
                        <Text fontSize="sm">
                          <strong>Region:</strong> {maxmindApi.location.region || 'Unknown'}
                        </Text>
                        {maxmindApi.location.latitude && (
                          <Text fontSize="sm">
                            <strong>Coordinates:</strong> {maxmindApi.location.latitude.toFixed(4)}, {maxmindApi.location.longitude.toFixed(4)}
                          </Text>
                        )}
                      </>
                    ) : (
                      <Text fontSize="sm" color="fg.muted">
                        No location data available
                      </Text>
                    )}
                  </VStack>
                </Card.Body>
              </Card.Root>
            </GridItem>
          </Grid>

          {/* Additional Info */}
          <Box>
            <Text fontSize="sm" color="fg.muted">
              <strong>Total API fetch time:</strong> {fetchTime.toFixed(2)}ms
            </Text>
            <Text fontSize="sm" color="fg.muted">
              <strong>Note:</strong> MaxMind API results are simulated for comparison purposes
            </Text>
          </Box>

          <Button onClick={fetchComparison} variant="outline">
            Refresh Comparison
          </Button>
        </VStack>
      </Card.Body>
    </Card.Root>
  )
} 