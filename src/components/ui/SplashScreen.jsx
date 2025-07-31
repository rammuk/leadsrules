import { Box, VStack, Heading, Text, Spinner } from '@chakra-ui/react'

export default function SplashScreen({ websiteName = "Our Website" }) {
  return (
    <Box 
      minH="100vh" 
      bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
      display="flex"
      alignItems="center"
      justifyContent="center"
      p={8}
    >
      <VStack gap={6} align="center" maxW="400px" textAlign="center">
        <VStack gap={4}>
          <Heading size="2xl" color="white" fontWeight="bold">
            {websiteName}
          </Heading>
          <Text fontSize="lg" color="white" opacity={0.9}>
            Questionnaire System
          </Text>
        </VStack>
        
        <VStack gap={4}>
          <Spinner size="lg" color="white" thickness="3px" />
          <Text fontSize="sm" color="white" opacity={0.8}>
            Loading your experience...
          </Text>
        </VStack>
      </VStack>
    </Box>
  )
} 