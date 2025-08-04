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
      } else {
        setError(data.error || 'Failed to fetch database stats')
      }
    } catch (err) {
      setError('Failed to connect to database')
    } finally {
      setLoading(false)
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






      </VStack>
    </Box>
  )
} 