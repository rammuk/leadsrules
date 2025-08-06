import { Card, Heading, Text, VStack } from '@chakra-ui/react'

export default function QuestionnaireHeader({ questionnaire }) {
  return (
    <Card.Root w="full">
      <Card.Body>
        <VStack gap={4} align="center">
          <Heading size="xl" textAlign="center">
            {questionnaire.title}
          </Heading>
          {questionnaire.description && (
            <Text color="fg.muted" textAlign="center">
              {questionnaire.description}
            </Text>
          )}
        </VStack>
      </Card.Body>
    </Card.Root>
  )
} 