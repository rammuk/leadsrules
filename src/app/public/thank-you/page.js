import { Card, Heading, Text, VStack, Button, Box } from '@chakra-ui/react'
import Link from 'next/link'
import PublicNavigation from '@/components/ui/PublicNavigation'

export default function ThankYouPage() {
  return (
    <Box minH="100vh" bg="gray.50">
      <PublicNavigation websiteName="Thank You" />
      <Box p={8}>
        <VStack gap={8} maxW="800px" mx="auto">
        <Card.Root w="full">
          <Card.Body>
            <VStack gap={6} align="center">
              <Heading size="2xl" textAlign="center" color="green.600">
                Thank You!
              </Heading>
              
              <Text fontSize="lg" textAlign="center" color="fg.muted">
                Your questionnaire has been submitted successfully.
              </Text>
              
              <Text fontSize="md" textAlign="center" color="fg.muted">
                We appreciate you taking the time to complete our questionnaire. 
                Your responses have been recorded and will be reviewed by our team.
              </Text>
              
              <VStack gap={4} pt={4}>
                <Text fontSize="sm" color="fg.muted" textAlign="center">
                  Response ID: {Date.now().toString(36).toUpperCase()}
                </Text>
                
                <Text fontSize="sm" color="fg.muted" textAlign="center">
                  Submitted on: {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}
                </Text>
              </VStack>
            </VStack>
          </Card.Body>
        </Card.Root>

        <Card.Root w="full" variant="subtle">
          <Card.Body>
            <VStack gap={4} align="center">
              <Text fontSize="sm" color="fg.muted" textAlign="center">
                This is a sample questionnaire system
              </Text>
              <Link href="/public" passHref>
                <Button variant="outline" size="sm">
                  Back to Home
                </Button>
              </Link>
            </VStack>
          </Card.Body>
        </Card.Root>
        </VStack>
      </Box>
    </Box>
  )
} 