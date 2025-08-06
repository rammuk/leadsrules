import { Card, HStack, Button } from '@chakra-ui/react'

export default function QuestionnaireNavigation({ 
  showReview,
  currentStepIndex,
  questionnaire,
  onPrevious,
  onNext,
  onBackToQuestionnaire,
  onSubmit,
  submitting
}) {
  return (
    <Card.Root w="full" key={`navigation-${showReview ? 'review' : 'questionnaire'}`}>
      <Card.Body>
        <HStack gap={4} justify="space-between">
          {showReview ? (
            <>
              <Button
                variant="outline"
                onClick={onBackToQuestionnaire}
              >
                Back to Questionnaire
              </Button>
              <Button
                colorPalette="blue"
                onClick={onSubmit}
                loading={submitting}
                disabled={submitting}
              >
                Submit Questionnaire
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                onClick={onPrevious}
                disabled={currentStepIndex === 0}
              >
                Previous
              </Button>

              <Button
                colorPalette="blue"
                onClick={onNext}
              >
                {currentStepIndex === questionnaire.steps.length - 1 ? 'Review Answers' : 'Next'}
              </Button>
            </>
          )}
        </HStack>
      </Card.Body>
    </Card.Root>
  )
} 