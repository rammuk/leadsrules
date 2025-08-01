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

  const handleSearchIP = async () => {
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
        <Card.Root p={6}>
          <Card.Body>
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
          </Card.Body>
        </Card.Root>

        {/* IP Search */}
        <Card.Root p={6}>
          <Card.Body>
            <Heading size="md" mb={4}>🔍 Search IP Address</Heading>
            <VStack spacing={4}>
              <HStack>
                <Input 
                  placeholder="Enter IP address (e.g., 8.8.8.8)"
                  value={searchIP}
                  onChange={(e) => setSearchIP(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearchIP()}
                />
                <Button onClick={handleSearchIP}>Search</Button>
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
          </Card.Body>
        </Card.Root>

        {/* Sample Records */}
        <Card.Root p={6}>
          <Card.Body>
            <Heading size="md" mb={4}>🎯 Sample Records</Heading>
            <Table.Root variant="simple">
              <Table.Header>
                <Table.Row>
                  <Table.ColumnHeader>IP Address</Table.ColumnHeader>
                  <Table.ColumnHeader>City</Table.ColumnHeader>
                  <Table.ColumnHeader>Region</Table.ColumnHeader>
                  <Table.ColumnHeader>Country</Table.ColumnHeader>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {sampleRecords.map((record, index) => (
                  <Table.Row key={index}>
                    <Table.Cell fontFamily="mono">{record.ip}</Table.Cell>
                    <Table.Cell>{record.city || 'N/A'}</Table.Cell>
                    <Table.Cell>{record.region || 'N/A'}</Table.Cell>
                    <Table.Cell>{record.country || 'N/A'}</Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table.Root>
          </Card.Body>
        </Card.Root>

        {/* Top Countries */}
        <Card.Root p={6}>
          <Card.Body>
            <Heading size="md" mb={4}>🌍 Top Countries</Heading>
            <Table.Root variant="simple">
              <Table.Header>
                <Table.Row>
                  <Table.ColumnHeader>Rank</Table.ColumnHeader>
                  <Table.ColumnHeader>Country</Table.ColumnHeader>
                  <Table.ColumnHeader>IP Count</Table.ColumnHeader>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {topCountries.map((country, index) => (
                  <Table.Row key={index}>
                    <Table.Cell>{index + 1}</Table.Cell>
                    <Table.Cell>{country.country || 'Unknown'}</Table.Cell>
                    <Table.Cell>{country.count.toLocaleString()}</Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table.Root>
          </Card.Body>
        </Card.Root>

        {/* Top Cities */}
        <Card.Root p={6}>
          <Card.Body>
            <Heading size="md" mb={4}>🏙️ Top Cities</Heading>
            <Table.Root variant="simple">
              <Table.Header>
                <Table.Row>
                  <Table.ColumnHeader>Rank</Table.ColumnHeader>
                  <Table.ColumnHeader>City</Table.ColumnHeader>
                  <Table.ColumnHeader>IP Count</Table.ColumnHeader>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {topCities.map((city, index) => (
                  <Table.Row key={index}>
                    <Table.Cell>{index + 1}</Table.Cell>
                    <Table.Cell>{city.city}</Table.Cell>
                    <Table.Cell>{city.count.toLocaleString()}</Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table.Root>
          </Card.Body>
        </Card.Root>

        {/* Data Quality */}
        {stats && (
          <Card.Root p={6}>
            <Card.Body>
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
            </Card.Body>
          </Card.Root>
        )}
      </VStack>
    </Box>
  )
} 