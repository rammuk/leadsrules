import { Card, VStack, HStack, Text, Badge } from '@chakra-ui/react'
import QuestionRenderer from './QuestionRenderer'

export default function QuestionCard({ 
  question, 
  questionIndex, 
  value, 
  onAnswerChange,
  showStepTitle,
  showQuestionTitles 
}) {
  // Determine question title based on settings
  let questionTitle = ''
  
  if (showStepTitle && showQuestionTitles) {
    // Both step title and question titles are shown
    questionTitle = `${questionIndex + 1}. ${question.question}`
  } else if (!showStepTitle && showQuestionTitles) {
    // Step title is hidden, use question title as step title
    questionTitle = `${questionIndex + 1}. ${question.question}`
  } else if (showStepTitle && !showQuestionTitles) {
    // Step title is shown, but question titles are hidden
    questionTitle = ''
  } else {
    // Both are hidden or undefined, show question title as step title
    questionTitle = `${questionIndex + 1}. ${question.question}`
  }

  return (
    <Card.Root variant="outline">
      <Card.Body>
        <VStack gap={4} align="stretch">
          {questionTitle && (
            <HStack justify="space-between">
              <Text fontWeight="medium">
                {questionTitle}
              </Text>
              {question.isRequired && (
                <Badge colorPalette="red" variant="subtle" size="sm">
                  Required
                </Badge>
              )}
            </HStack>
          )}
          
          <QuestionRenderer 
            question={question}
            value={value}
            onAnswerChange={onAnswerChange}
          />
        </VStack>
      </Card.Body>
    </Card.Root>
  )
} 