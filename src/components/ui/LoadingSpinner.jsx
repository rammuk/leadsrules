import { Box, VStack, Text, Spinner } from '@chakra-ui/react'

export default function LoadingSpinner({ message = "Loading..." }) {
  return (
    <Box minH="100vh" bg="gray.50" p={8}>
      <VStack gap={8} maxW="800px" mx="auto" justify="center" minH="60vh">
        <VStack gap={4} align="center">
          <Spinner size="xl" color="blue.500" thickness="4px" />
          <Text fontSize="lg" color="fg.muted" textAlign="center">
            {message}
          </Text>
        </VStack>
      </VStack>
    </Box>
  )
} 