import { Card, Text, VStack, HStack, Progress, Box } from '@chakra-ui/react'

export default function QuestionnaireProgress({ 
  currentStepForProgress, 
  totalSteps, 
  showReview, 
  currentStepIndex 
}) {
  const progress = totalSteps <= 1 ? 100 : (currentStepForProgress / (totalSteps - 1)) * 100

  return (
    <Card.Root w="full" key={`progress-${showReview ? 'review' : currentStepIndex}`}>
      <Card.Body>
        <VStack gap={4} align="stretch">
          <HStack justify="space-between">
            <Text fontWeight="medium">Progress</Text>
            <Text fontSize="sm" color="fg.muted">
              {showReview ? 'Review Answers' : `Step ${currentStepForProgress + 1} of ${totalSteps}`}
            </Text>
          </HStack>
          <Progress.Root 
            value={showReview ? 100 : progress} 
            colorPalette="blue" 
            size="lg"
            borderRadius="full"
          >
            <Progress.Track>
              <Progress.Range />
            </Progress.Track>
          </Progress.Root>
          <HStack gap={2} justify="center">
            {Array.from({ length: totalSteps }, (_, index) => (
              <Box
                key={index}
                w="8px"
                h="8px"
                borderRadius="full"
                bg={index <= currentStepForProgress ? "blue.500" : "gray.300"}
                transition="all 0.3s"
              />
            ))}
          </HStack>
        </VStack>
      </Card.Body>
    </Card.Root>
  )
} 