import { VStack, Card, Heading, Text, Box, HStack } from '@chakra-ui/react'

export default function ReviewSection({ questionnaire, answers }) {
  return (
    <VStack gap={6} align="stretch">
      <VStack gap={2} align="flex-start">
        <Heading size="md">Review Your Answers</Heading>
        <Text color="fg.muted">Please review your answers before submitting the questionnaire.</Text>
      </VStack>

      <VStack gap={4} align="stretch">
        {questionnaire.steps.map((step, stepIndex) => {
          console.log('Rendering step:', stepIndex, step)
          return (
            <Card.Root key={stepIndex} variant="outline">
              <Card.Body>
                <VStack gap={4} align="stretch">
                  {/* Step Title - Show only if showStepTitle is explicitly true */}
                  {(step.showStepTitle === true || step.showStepTitle === "true") && (
                    <Heading size="sm" color="blue.600" bg="blue.50" p={3} borderRadius="md" border="1px solid" borderColor="blue.200">
                      Step {stepIndex + 1}: {step.title}
                    </Heading>
                  )}
                  
                  {step.questions && step.questions.map((question, questionIndex) => {
                    const answer = answers[question.id]
                    console.log('Rendering question:', questionIndex, question.id, answer)
                    
                    // Determine question title based on settings
                    let questionTitle = ''
                    const showStepTitle = step.showStepTitle === true || step.showStepTitle === "true"
                    const showQuestionTitles = step.showQuestionTitles === true || step.showQuestionTitles === "true"
                    
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
                      <Box 
                        key={question.id} 
                        p={4} 
                        bg={answer ? "green.50" : "gray.50"} 
                        borderRadius="md"
                        border="1px solid"
                        borderColor={answer ? "green.200" : "gray.200"}
                        position="relative"
                      >
                        {answer && (
                          <Box
                            position="absolute"
                            top={2}
                            right={2}
                            w="8px"
                            h="8px"
                            borderRadius="full"
                            bg="green.500"
                          />
                        )}
                        <VStack gap={2} align="stretch">
                          {questionTitle && (
                            <Text fontWeight="semibold" fontSize="md" color="gray.800" mb={2}>
                              {questionTitle}
                            </Text>
                          )}
                          <Box>
                            <Text fontSize="sm" color="fg.muted" mb={1} fontWeight="medium">
                              Your Answer:
                            </Text>
                            <Box 
                              p={3} 
                              bg={answer ? "blue.50" : "gray.50"} 
                              borderRadius="lg" 
                              border="2px solid" 
                              borderColor={answer ? "blue.200" : "gray.200"}
                              minH="50px"
                              display="flex"
                              alignItems="center"
                              _hover={{
                                borderColor: answer ? "blue.300" : "gray.300",
                                transform: "translateY(-1px)",
                                boxShadow: "sm"
                              }}
                              transition="all 0.2s"
                            >
                              <Text 
                                color={answer ? "blue.700" : "gray.500"}
                                fontWeight={answer ? "medium" : "normal"}
                                fontSize="md"
                              >
                                {answer || 'No answer provided'}
                              </Text>
                            </Box>
                          </Box>
                        </VStack>
                      </Box>
                    )
                  })}
                </VStack>
              </Card.Body>
            </Card.Root>
          )
        })}
      </VStack>
    </VStack>
  )
} 