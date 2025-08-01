'use client'

import { useState, useEffect } from 'react'
import { 
  Box, 
  Heading, 
  Text, 
  VStack, 
  HStack, 
  Card, 
  Badge, 
  Spinner,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Button,
  Input,
  Select
} from '@chakra-ui/react'

export default function DatabaseViewer() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [sampleRecords, setSampleRecords] = useState([])
  const [topCountries, setTopCountries] = useState([])
  const [topCities, setTopCities] = useState([])
  const [searchIP, setSearchIP] = useState('')
  const [searchResult, setSearchResult] = useState(null)

  useEffect(() => {
    fetchDatabaseStats()
  }, [])

  const fetchDatabaseStats = async () => {
    try {
      setLoading(true)
      
      // Fetch database statistics
      const response = await fetch('/api/admin/database-stats')
      const data = await response.json()
      
      if (response.ok) {
        setStats(data.stats)
        setSampleRecords(data.sampleRecords || [])
        setTopCountries(data.topCountries || [])
        setTopCities(data.topCities || [])
      } else {
        setError(data.error || 'Failed to fetch database stats')
      }
    } catch (err) {
      setError('Failed to connect to database')
    } finally {
      setLoading(false)
    }
  }

  const searchIP = async () => {
    if (!searchIP.trim()) return
    
    try {
      const response = await fetch(`/api/admin/search-ip?ip=${encodeURIComponent(searchIP)}`)
      const data = await response.json()
      
      if (response.ok) {
        setSearchResult(data)
      } else {
        setSearchResult({ error: data.error || 'IP not found' })
      }
    } catch (err) {
      setSearchResult({ error: 'Failed to search IP' })
    }
  }

  if (loading) {
    return (
      <Box p={8}>
        <VStack spacing={4}>
          <Spinner size="xl" />
          <Text>Loading production database...</Text>
        </VStack>
      </Box>
    )
  }

  if (error) {
    return (
      <Box p={8}>
        <VStack spacing={4}>
          <Heading size="lg" color="red.500">Database Error</Heading>
          <Text>{error}</Text>
          <Button onClick={fetchDatabaseStats}>Retry</Button>
        </VStack>
      </Box>
    )
  }

  return (
    <Box p={8}>
      <VStack spacing={8} align="stretch">
        <Heading size="xl">🗄️ Production Database Viewer</Heading>
        
        {/* Database Statistics */}
        <Card p={6}>
          <Heading size="md" mb={4}>📊 Database Statistics</Heading>
          <VStack spacing={3} align="stretch">
            <HStack justify="space-between">
              <Text>GeoIPData Records:</Text>
              <Badge colorPalette="green" size="lg">
                {stats?.geoipCount?.toLocaleString() || 0}
              </Badge>
            </HStack>
            <HStack justify="space-between">
              <Text>Websites:</Text>
              <Badge colorPalette="blue">{stats?.websiteCount || 0}</Badge>
            </HStack>
            <HStack justify="space-between">
              <Text>Questionnaires:</Text>
              <Badge colorPalette="purple">{stats?.questionnaireCount || 0}</Badge>
            </HStack>
            <HStack justify="space-between">
              <Text>Question Bank:</Text>
              <Badge colorPalette="orange">{stats?.questionBankCount || 0}</Badge>
            </HStack>
          </VStack>
        </Card>

        {/* IP Search */}
        <Card p={6}>
          <Heading size="md" mb={4}>🔍 Search IP Address</Heading>
          <VStack spacing={4}>
            <HStack>
              <Input 
                placeholder="Enter IP address (e.g., 8.8.8.8)"
                value={searchIP}
                onChange={(e) => setSearchIP(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && searchIP()}
              />
              <Button onClick={searchIP}>Search</Button>
            </HStack>
            
            {searchResult && (
              <Box p={4} bg="gray.50" borderRadius="md" w="full">
                {searchResult.error ? (
                  <Text color="red.500">{searchResult.error}</Text>
                ) : (
                  <VStack align="stretch" spacing={2}>
                    <Text fontWeight="bold">IP: {searchResult.ip}</Text>
                    <Text>Country: {searchResult.country || 'N/A'}</Text>
                    <Text>Region: {searchResult.region || 'N/A'}</Text>
                    <Text>City: {searchResult.city || 'N/A'}</Text>
                    <Text>Coordinates: {searchResult.latitude}, {searchResult.longitude}</Text>
                  </VStack>
                )}
              </Box>
            )}
          </VStack>
        </Card>

        {/* Sample Records */}
        <Card p={6}>
          <Heading size="md" mb={4}>🎯 Sample Records</Heading>
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>IP Address</Th>
                <Th>City</Th>
                <Th>Region</Th>
                <Th>Country</Th>
              </Tr>
            </Thead>
            <Tbody>
              {sampleRecords.map((record, index) => (
                <Tr key={index}>
                  <Td fontFamily="mono">{record.ip}</Td>
                  <Td>{record.city || 'N/A'}</Td>
                  <Td>{record.region || 'N/A'}</Td>
                  <Td>{record.country || 'N/A'}</Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Card>

        {/* Top Countries */}
        <Card p={6}>
          <Heading size="md" mb={4}>🌍 Top Countries</Heading>
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>Rank</Th>
                <Th>Country</Th>
                <Th>IP Count</Th>
              </Tr>
            </Thead>
            <Tbody>
              {topCountries.map((country, index) => (
                <Tr key={index}>
                  <Td>{index + 1}</Td>
                  <Td>{country.country || 'Unknown'}</Td>
                  <Td>{country.count.toLocaleString()}</Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Card>

        {/* Top Cities */}
        <Card p={6}>
          <Heading size="md" mb={4}>🏙️ Top Cities</Heading>
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>Rank</Th>
                <Th>City</Th>
                <Th>IP Count</Th>
              </Tr>
            </Thead>
            <Tbody>
              {topCities.map((city, index) => (
                <Tr key={index}>
                  <Td>{index + 1}</Td>
                  <Td>{city.city}</Td>
                  <Td>{city.count.toLocaleString()}</Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Card>

        {/* Data Quality */}
        {stats && (
          <Card p={6}>
            <Heading size="md" mb={4}>📋 Data Quality</Heading>
            <VStack spacing={3} align="stretch">
              <HStack justify="space-between">
                <Text>Records with city data:</Text>
                <Text fontWeight="bold">
                  {stats.withCity?.toLocaleString()} ({((stats.withCity / stats.geoipCount) * 100).toFixed(1)}%)
                </Text>
              </HStack>
              <HStack justify="space-between">
                <Text>Records with region data:</Text>
                <Text fontWeight="bold">
                  {stats.withRegion?.toLocaleString()} ({((stats.withRegion / stats.geoipCount) * 100).toFixed(1)}%)
                </Text>
              </HStack>
              <HStack justify="space-between">
                <Text>Records with coordinates:</Text>
                <Text fontWeight="bold">
                  {stats.withCoords?.toLocaleString()} ({((stats.withCoords / stats.geoipCount) * 100).toFixed(1)}%)
                </Text>
              </HStack>
            </VStack>
          </Card>
        )}
      </VStack>
    </Box>
  )
} 