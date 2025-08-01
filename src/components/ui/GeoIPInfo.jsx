'use client'

import { useState, useEffect } from 'react'
import {
  VStack,
  HStack,
  Text,
  Badge,
  Skeleton,
  Alert,
  Box
} from '@chakra-ui/react'

export default function GeoIPInfo() {
  const [geoData, setGeoData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [fetchTime, setFetchTime] = useState(null)

  useEffect(() => {
    const fetchGeoIP = async () => {
      const startTime = performance.now()
      
      try {
        const response = await fetch('/api/geoip/lookup')
        const data = await response.json()
        
        const endTime = performance.now()
        const timeTaken = endTime - startTime
        
        if (!response.ok) {
          console.error('GeoIP API error:', data)
          throw new Error(data.error || 'Failed to fetch location data')
        }
        
        setGeoData(data)
        setFetchTime(timeTaken)
      } catch (error) {
        console.error('GeoIP fetch error:', error)
        setError(error.message)
      } finally {
        setLoading(false)
      }
    }

    fetchGeoIP()
  }, [])

  if (loading) {
    return (
      <VStack gap={3} align="stretch">
        <Text fontWeight="medium">Location Information:</Text>
        <Skeleton h="20px" />
        <Skeleton h="20px" />
        <Skeleton h="20px" />
        <Skeleton h="20px" />
      </VStack>
    )
  }

  if (error) {
    return (
      <VStack gap={3} align="stretch">
        <Text fontWeight="medium">Location Information:</Text>
        <Alert.Root status="error">
          <Alert.Indicator />
          <Alert.Content>
            <Alert.Title>Error!</Alert.Title>
            <Alert.Description>{error}</Alert.Description>
          </Alert.Content>
        </Alert.Root>
      </VStack>
    )
  }

  if (!geoData) {
    return (
      <VStack gap={3} align="stretch">
        <Text fontWeight="medium">Location Information:</Text>
        <Text fontSize="sm" color="fg.muted">Unable to determine location</Text>
      </VStack>
    )
  }

  return (
    <VStack gap={3} align="stretch">
      <Text fontWeight="medium">Location Information:</Text>
      
      <HStack justify="space-between">
        <Text fontSize="sm" fontWeight="medium">Your IP:</Text>
        <Text fontSize="sm" fontFamily="mono" color="fg.muted">
          {geoData.ip}
        </Text>
      </HStack>

      <HStack justify="space-between">
        <Text fontSize="sm" fontWeight="medium">City:</Text>
        <Text fontSize="sm" color="fg.muted">
          {geoData.location.city || 'Unknown'}
        </Text>
      </HStack>

      <HStack justify="space-between">
        <Text fontSize="sm" fontWeight="medium">Region:</Text>
        <Text fontSize="sm" color="fg.muted">
          {geoData.location.region || 'Unknown'}
        </Text>
      </HStack>

      <HStack justify="space-between">
        <Text fontSize="sm" fontWeight="medium">Country:</Text>
        <Text fontSize="sm" color="fg.muted">
          {geoData.location.country || 'Unknown'}
        </Text>
      </HStack>

      <HStack justify="space-between">
        <Text fontSize="sm" fontWeight="medium">Timezone:</Text>
        <Text fontSize="sm" color="fg.muted">
          {geoData.location.timezone || 'Unknown'}
        </Text>
      </HStack>

      <HStack justify="space-between">
        <Text fontSize="sm" fontWeight="medium">Type:</Text>
        <Badge 
          colorPalette={geoData.location.isLocal ? "orange" : "green"}
          variant="subtle"
          fontSize="xs"
        >
          {geoData.location.isLocal ? "Local Network" : "Public IP"}
        </Badge>
      </HStack>

      {fetchTime && (
        <HStack justify="space-between">
          <Text fontSize="sm" fontWeight="medium">Fetch Time:</Text>
          <Text fontSize="sm" color="fg.muted">
            {fetchTime.toFixed(2)}ms
          </Text>
        </HStack>
      )}

      {geoData.location.latitude && geoData.location.longitude && (
        <Box>
          <Text fontSize="sm" fontWeight="medium" mb={1}>Coordinates:</Text>
          <Text fontSize="xs" color="fg.muted" fontFamily="mono">
            {geoData.location.latitude.toFixed(6)}, {geoData.location.longitude.toFixed(6)}
          </Text>
        </Box>
      )}
    </VStack>
  )
} 