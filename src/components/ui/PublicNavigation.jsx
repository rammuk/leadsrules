import { Box, HStack, Text, Button } from '@chakra-ui/react'
import Link from 'next/link'

export default function PublicNavigation({ websiteName = "Our Website" }) {
  return (
    <Box 
      as="nav" 
      bg="white" 
      borderBottom="1px solid" 
      borderColor="gray.200"
      px={6}
      py={4}
    >
      <HStack justify="space-between" maxW="1200px" mx="auto">
        <Link href="/public" passHref>
          <Text fontSize="lg" fontWeight="bold" color="blue.600" cursor="pointer">
            {websiteName}
          </Text>
        </Link>
        
        <HStack gap={4}>
          <Link href="/public" passHref>
            <Button variant="ghost" size="sm">
              Home
            </Button>
          </Link>
          <Link href="/public/questionnaire" passHref>
            <Button variant="ghost" size="sm">
              Questionnaire
            </Button>
          </Link>
        </HStack>
      </HStack>
    </Box>
  )
} 