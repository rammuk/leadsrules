import { VStack, HStack, Heading, Text, Badge, Alert } from '@chakra-ui/react'

export default function StepTitle({ 
  currentStep, 
  currentStepIndex, 
  showStepTitle 
}) {
  if (!showStepTitle) return null

  return (
    <VStack gap={2} align="flex-start">
      <HStack gap={2} align="center">
        <Heading size="md">Step {currentStepIndex + 1}: {currentStep.title}</Heading>
        {currentStep.leaveBehindStrategy && (
          <Badge colorPalette="orange" variant="subtle" size="sm">
            Leave Behind
          </Badge>
        )}
      </HStack>
      {currentStep.description && (
        <Text color="fg.muted">{currentStep.description}</Text>
      )}
      {currentStep.leaveBehindStrategy && (
        <Alert.Root colorPalette="orange" variant="subtle" size="sm">
          <Alert.Indicator />
          <Alert.Content>
            <Alert.Description>
              After answering, the next question will open in a new tab and this page will redirect to a leave behind page.
            </Alert.Description>
          </Alert.Content>
        </Alert.Root>
      )}
    </VStack>
  )
} 