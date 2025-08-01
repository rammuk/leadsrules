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
        // Use the new database lookup endpoint
        const response = await fetch('/api/geoip/db-lookup')
        const data = await response.json()
        
        const endTime = performance.now()
        const timeTaken = endTime - startTime
        
        if (!response.ok) {
          console.error('GeoIP API error:', data)
          throw new Error(data.message || 'Failed to fetch location data')
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

  if (!geoData || !geoData.success) {
    return (
      <VStack gap={3} align="stretch">
        <Text fontWeight="medium">Location Information:</Text>
        <Text fontSize="sm" color="fg.muted">
          {geoData?.message || 'Unable to determine location'}
        </Text>
      </VStack>
    )
  }

  return (
    <VStack gap={3} align="stretch">
      <Text fontWeight="medium">Location Information:</Text>
      
      <HStack justify="space-between">
        <Text fontSize="sm" fontWeight="medium">Your IP:</Text>
        <Text fontSize="sm" fontFamily="mono" color="fg.muted">
          {geoData.originalIP || geoData.ip}
        </Text>
      </HStack>

      {geoData.originalIP !== geoData.ip && (
        <HStack justify="space-between">
          <Text fontSize="sm" fontWeight="medium">Test IP:</Text>
          <Text fontSize="sm" fontFamily="mono" color="fg.muted">
            {geoData.ip}
          </Text>
        </HStack>
      )}

      <HStack justify="space-between">
        <Text fontSize="sm" fontWeight="medium">City:</Text>
        <Text fontSize="sm" color="fg.muted">
          {geoData.location?.city || 'Unknown'}
        </Text>
      </HStack>

      <HStack justify="space-between">
        <Text fontSize="sm" fontWeight="medium">Region:</Text>
        <Text fontSize="sm" color="fg.muted">
          {geoData.location?.region || 'Unknown'}
        </Text>
      </HStack>

      <HStack justify="space-between">
        <Text fontSize="sm" fontWeight="medium">Country:</Text>
        <Text fontSize="sm" color="fg.muted">
          {geoData.location?.country || 'Unknown'}
        </Text>
      </HStack>

      {geoData.location?.coordinates && (
        <HStack justify="space-between">
          <Text fontSize="sm" fontWeight="medium">Coordinates:</Text>
          <Text fontSize="sm" color="fg.muted" fontFamily="mono">
            {geoData.location.coordinates.lat.toFixed(4)}, {geoData.location.coordinates.lng.toFixed(4)}
          </Text>
        </HStack>
      )}

      {geoData.location?.timezone && (
        <HStack justify="space-between">
          <Text fontSize="sm" fontWeight="medium">Timezone:</Text>
          <Text fontSize="sm" color="fg.muted">
            {geoData.location.timezone}
          </Text>
        </HStack>
      )}

      {geoData.location?.isp && (
        <HStack justify="space-between">
          <Text fontSize="sm" fontWeight="medium">ISP:</Text>
          <Text fontSize="sm" color="fg.muted">
            {geoData.location.isp}
          </Text>
        </HStack>
      )}

      <HStack justify="space-between">
        <Text fontSize="sm" fontWeight="medium">Method:</Text>
        <Badge colorPalette="blue" variant="subtle" fontSize="xs">
          {geoData.method}
        </Badge>
      </HStack>

      <HStack justify="space-between">
        <Text fontSize="sm" fontWeight="medium">Fetch Time:</Text>
        <Text fontSize="sm" color="fg.muted" fontFamily="mono">
          {geoData.fetchTime}ms
        </Text>
      </HStack>

      {fetchTime && (
        <HStack justify="space-between">
          <Text fontSize="sm" fontWeight="medium">Total Time:</Text>
          <Text fontSize="sm" color="fg.muted" fontFamily="mono">
            {Math.round(fetchTime)}ms
          </Text>
        </HStack>
      )}
    </VStack>
  )
} 