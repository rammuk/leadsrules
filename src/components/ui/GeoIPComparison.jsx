"use client"

import { useState, useEffect } from 'react'
import { 
  Box, 
  VStack, 
  HStack, 
  Text, 
  Button, 
  Input, 
  Alert, 
  Card, 
  Badge,
  Spinner,
  Progress
} from '@chakra-ui/react'

export default function GeoIPComparison() {
  const [comparisonData, setComparisonData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [testIP, setTestIP] = useState('')

  const runComparison = async (ip = null) => {
    setLoading(true)
    setError(null)
    
    try {
      // Use the new compare-all endpoint
      const url = '/api/geoip/compare-all'
      const method = ip ? 'POST' : 'GET'
      const body = ip ? JSON.stringify({ ip }) : undefined
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body
      })
      
      const data = await response.json()
      
      if (data.success) {
        setComparisonData(data)
      } else {
        setError(data.message || 'Failed to compare methods')
      }
    } catch (err) {
      setError('Network error: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleCustomIP = () => {
    if (testIP.trim()) {
      runComparison(testIP.trim())
    }
  }

  useEffect(() => {
    // Run initial comparison on component mount
    runComparison()
  }, [])

  return (
    <VStack gap={6} align="stretch" w="full">
      <Box>
        <Text fontSize="xl" fontWeight="bold" mb={2}>
          GeoIP Method Comparison
        </Text>
        <Text color="fg.muted" fontSize="sm">
          Compare performance between Local MaxMind database, PostgreSQL database, and MaxMind Cloud API
        </Text>
      </Box>

      {/* Test Custom IP */}
      <Card.Root p={4}>
        <VStack gap={3} align="stretch">
          <Text fontWeight="semibold">Test Custom IP Address</Text>
          <HStack gap={3}>
            <Input
              placeholder="Enter IP address (e.g., 8.8.8.8)"
              value={testIP}
              onChange={(e) => setTestIP(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleCustomIP()}
            />
            <Button 
              onClick={handleCustomIP}
              disabled={!testIP.trim() || loading}
              colorPalette="blue"
            >
              Test IP
            </Button>
          </HStack>
        </VStack>
      </Card.Root>

      {/* Refresh Button */}
      <Button 
        onClick={() => runComparison()}
        disabled={loading}
        colorPalette="green"
      >
        {loading ? <Spinner size="sm" /> : 'Refresh Comparison'}
      </Button>

      {/* Error Display */}
      {error && (
        <Alert.Root status="error">
          <Alert.Indicator />
          <Alert.Content>
            <Alert.Title>Error</Alert.Title>
            <Alert.Description>{error}</Alert.Description>
          </Alert.Content>
        </Alert.Root>
      )}

      {/* Results Display */}
      {comparisonData && (
        <VStack gap={4} align="stretch">
          {/* Summary */}
          <Card.Root p={4}>
            <VStack gap={3} align="stretch">
              <HStack justify="space-between">
                <Text fontWeight="semibold">Test IP</Text>
                <Badge colorPalette="blue">{comparisonData.ip}</Badge>
              </HStack>

              {comparisonData.originalIP !== comparisonData.ip && (
                <HStack justify="space-between">
                  <Text fontWeight="semibold">Original IP</Text>
                  <Badge colorPalette="gray">{comparisonData.originalIP}</Badge>
                </HStack>
              )}

              <HStack justify="space-between">
                <Text fontWeight="semibold">Fastest Method</Text>
                                <Badge
                  colorPalette={
                    comparisonData.comparison.fastestMethod.includes('PostgreSQL') ? 'green' :
                    comparisonData.comparison.fastestMethod.includes('Local') ? 'blue' : 'purple'
                  }
                >
                  {comparisonData.comparison.fastestMethod}
                </Badge>
              </HStack>

              {comparisonData.comparison.timeDifference > 0 && (
                <HStack justify="space-between">
                  <Text fontWeight="semibold">Time Difference</Text>
                  <Badge colorPalette="orange">
                    +{comparisonData.comparison.timeDifference}ms
                  </Badge>
                </HStack>
              )}

              <HStack justify="space-between">
                <Text fontWeight="semibold">Total Test Time</Text>
                <Badge colorPalette="gray">
                  {comparisonData.totalTime}ms
                </Badge>
              </HStack>
            </VStack>
          </Card.Root>



          {/* Local Database Results */}
          <Card.Root p={4}>
            <VStack gap={3} align="stretch">
              <HStack justify="space-between">
                <Text fontWeight="semibold">Local Database (.mmdb)</Text>
                <Badge
                  colorPalette={
                    comparisonData.localDatabase.status === 'success' ? 'blue' :
                    comparisonData.localDatabase.status === 'error' ? 'red' : 'gray'
                  }
                >
                  {comparisonData.localDatabase.status}
                </Badge>
              </HStack>

              <HStack justify="space-between">
                <Text>Fetch Time</Text>
                <Text fontWeight="medium" color="blue.600">
                  {comparisonData.localDatabase.fetchTime}ms
                </Text>
              </HStack>

              {comparisonData.localDatabase.data && (
                <Box>
                  <Text fontSize="sm" color="fg.muted" mb={2} fontWeight="medium">Location Data:</Text>
                  <Box 
                    bg="blue.50" 
                    p={3} 
                    borderRadius="md" 
                    border="1px solid" 
                    borderColor="blue.200"
                    maxH="200px"
                    overflow="auto"
                  >
                    <Text fontSize="sm" fontFamily="mono" color="blue.800" lineHeight="1.4">
                      {JSON.stringify(comparisonData.localDatabase.data, null, 2)}
                    </Text>
                  </Box>
                </Box>
              )}

              {comparisonData.localDatabase.error && (
                <Alert.Root status="error" size="sm">
                  <Alert.Indicator />
                  <Alert.Content>
                    <Alert.Description>{comparisonData.localDatabase.error}</Alert.Description>
                  </Alert.Content>
                </Alert.Root>
              )}
            </VStack>
          </Card.Root>

          {/* MaxMind API Results */}
          <Card.Root p={4}>
            <VStack gap={3} align="stretch">
              <HStack justify="space-between">
                <Text fontWeight="semibold">MaxMind Cloud API</Text>
                <Badge
                  colorPalette={
                    comparisonData.maxmindApi.status === 'success' ? 'purple' :
                    comparisonData.maxmindApi.status === 'error' ? 'red' : 'gray'
                  }
                >
                  {comparisonData.maxmindApi.status}
                </Badge>
              </HStack>

              <HStack justify="space-between">
                <Text>Fetch Time</Text>
                <Text fontWeight="medium" color="purple.600">
                  {comparisonData.maxmindApi.fetchTime}ms
                </Text>
              </HStack>

              {comparisonData.maxmindApi.data && (
                <Box>
                  <Text fontSize="sm" color="fg.muted" mb={2} fontWeight="medium">Location Data:</Text>
                  <Box 
                    bg="purple.50" 
                    p={3} 
                    borderRadius="md" 
                    border="1px solid" 
                    borderColor="purple.200"
                    maxH="200px"
                    overflow="auto"
                  >
                    <Text fontSize="sm" fontFamily="mono" color="purple.800" lineHeight="1.4">
                      {JSON.stringify(comparisonData.maxmindApi.data, null, 2)}
                    </Text>
                  </Box>
                </Box>
              )}

              {comparisonData.maxmindApi.error && (
                <Alert.Root status="error" size="sm">
                  <Alert.Indicator />
                  <Alert.Content>
                    <Alert.Description>{comparisonData.maxmindApi.error}</Alert.Description>
                  </Alert.Content>
                </Alert.Root>
              )}
            </VStack>
          </Card.Root>

          {/* PostgreSQL Database Results */}
          <Card.Root p={4}>
            <VStack gap={3} align="stretch">
              <HStack justify="space-between">
                <Text fontWeight="semibold">PostgreSQL Database</Text>
                <Badge
                  colorPalette={
                    comparisonData.postgresqlDatabase.status === 'success' ? 'green' :
                    comparisonData.postgresqlDatabase.status === 'error' ? 'red' : 'gray'
                  }
                >
                  {comparisonData.postgresqlDatabase.status}
                </Badge>
              </HStack>

              <HStack justify="space-between">
                <Text>Fetch Time</Text>
                <Text fontWeight="medium" color="green.600">
                  {comparisonData.postgresqlDatabase.fetchTime}ms
                </Text>
              </HStack>

              {comparisonData.postgresqlDatabase.data && (
                <Box>
                  <Text fontSize="sm" color="fg.muted" mb={2} fontWeight="medium">Location Data:</Text>
                  <Box 
                    bg="green.50" 
                    p={3} 
                    borderRadius="md" 
                    border="1px solid" 
                    borderColor="green.200"
                    maxH="200px"
                    overflow="auto"
                  >
                    <Text fontSize="sm" fontFamily="mono" color="green.800" lineHeight="1.4">
                      {JSON.stringify(comparisonData.postgresqlDatabase.data, null, 2)}
                    </Text>
                  </Box>
                </Box>
              )}

              {comparisonData.postgresqlDatabase.error && (
                <Alert.Root status="error" size="sm">
                  <Alert.Indicator />
                  <Alert.Content>
                    <Alert.Description>{comparisonData.postgresqlDatabase.error}</Alert.Description>
                  </Alert.Content>
                </Alert.Root>
              )}
            </VStack>
          </Card.Root>
        </VStack>
      )}

      {/* Loading State */}
      {loading && (
        <Card.Root p={6}>
          <VStack gap={3}>
            <Spinner size="lg" />
            <Text>Comparing GeoIP methods...</Text>
            <Progress.Root value={0} size="sm" w="full">
              <Progress.Track>
                <Progress.Range />
              </Progress.Track>
            </Progress.Root>
          </VStack>
        </Card.Root>
      )}
    </VStack>
  )
} 