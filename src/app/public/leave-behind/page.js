'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Box,
  Card,
  Heading,
  Text,
  VStack,
  HStack,
  Button,
  Alert,
} from '@chakra-ui/react'

import PublicNavigation from '@/components/ui/PublicNavigation'

export default function LeaveBehindPage() {
  

  return (
    <Box minH="100vh" bg="gray.50">
      <PublicNavigation websiteName="Leave Behind" />
      <Box p={8}>
        <VStack gap={8} maxW="800px" mx="auto">
          {/* Header */}
          <Card.Root w="full">
            <Card.Body>
              <VStack gap={4} align="center">
                <Heading size="xl" textAlign="center">
                  Thank You for Your Response
                </Heading>
                <Text color="fg.muted" textAlign="center">
                  Your answer has been recorded. The next question is now available in a new tab.
                </Text>
              </VStack>
            </Card.Body>
          </Card.Root>

         
        </VStack>
      </Box>
    </Box>
  )
} 