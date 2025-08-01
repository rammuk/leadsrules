'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Box,
  Card,
  Heading,
  Text,
  VStack,
  HStack,
  Button,
  Progress,
  Input,
  Textarea,
  Select,
  Badge,
  Alert,
  useDisclosure
} from '@chakra-ui/react'
import { publicConfig } from '@/config/public'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import PublicNavigation from '@/components/ui/PublicNavigation'

export default function PublicQuestionnairePage() {
  const [questionnaire, setQuestionnaire] = useState(null)
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [answers, setAnswers] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [showReview, setShowReview] = useState(false)
  const router = useRouter()

  useEffect(() => {
    loadQuestionnaireData()
  }, [])

  // Handle review state changes
  useEffect(() => {
    if (showReview) {
      console.log('Review mode activated')
    }
  }, [showReview])

  const loadQuestionnaireData = () => {
    try {
      const questionnaireData = sessionStorage.getItem('questionnaireData')
      if (questionnaireData) {
        const parsedData = JSON.parse(questionnaireData)
        setQuestionnaire(parsedData)
        setLoading(false)
      } else {
        setError('No questionnaire data found. Please return to the homepage.')
        setLoading(false)
      }
    } catch (error) {
      console.error('Error parsing questionnaire data:', error)
      setError('Invalid questionnaire data. Please return to the homepage.')
      setLoading(false)
    }
  }

  const handleAnswerChange = (questionId, value) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }))
  }

  const handleNext = () => {
    console.log('handleNext called', { currentStepIndex, totalSteps: questionnaire.steps.length })
    if (currentStepIndex < questionnaire.steps.length - 1) {
      setCurrentStepIndex(prev => prev + 1)
    } else {
      console.log('Setting showReview to true')
      // Add a small delay to prevent DOM conflicts
      setTimeout(() => {
        setShowReview(true)
      }, 100)
    }
  }

  const handlePrevious = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1)
      setShowReview(false)
    }
  }

  const handleBackToQuestionnaire = () => {
    console.log('handleBackToQuestionnaire called')
    // Add a small delay to prevent DOM conflicts
    setTimeout(() => {
      setShowReview(false)
    }, 100)
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    try {
      const response = await fetch(`/api/public/websites/${publicConfig.websiteId}/questionnaires/${questionnaire.id}/responses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          questionnaireId: questionnaire.id,
          answers: answers
        })
      })

      if (response.ok) {
        // Clear session storage after successful submission
        sessionStorage.removeItem('questionnaireData')
        router.push('/public/thank-you')
      } else {
        setError('Failed to submit questionnaire')
      }
    } catch (error) {
      console.error('Error submitting questionnaire:', error)
      setError('Failed to submit questionnaire')
    } finally {
      setSubmitting(false)
    }
  }

  const renderQuestion = (question) => {
    const value = answers[question.id] || ''

    switch (question.questionType) {
      case 'text':
        return (
          <Input
            value={value}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            placeholder="Enter your answer"
            required={question.isRequired}
            size="lg"
          />
        )
      
      case 'textarea':
        return (
          <Textarea
            value={value}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            placeholder="Enter your answer"
            rows={4}
            required={question.isRequired}
            size="lg"
          />
        )
      
      case 'date':
        return (
          <Input
            type="date"
            value={value}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            required={question.isRequired}
            size="lg"
          />
        )
      
      case 'options':
        return (
          <VStack gap={3} align="stretch">
            {question.options.map((option, index) => (
              <Button
                key={option.id}
                variant={value === option.description ? 'solid' : 'outline'}
                colorPalette="blue"
                onClick={() => handleAnswerChange(question.id, option.description)}
                justifyContent="flex-start"
                h="auto"
                p={4}
                borderRadius="lg"
                _hover={{
                  transform: 'translateY(-1px)',
                  boxShadow: 'md'
                }}
                transition="all 0.2s"
              >
                <VStack gap={2} align="flex-start" w="full">
                  <HStack gap={2} w="full">
                    <Box
                      w="20px"
                      h="20px"
                      borderRadius="full"
                      border="2px solid"
                      borderColor={value === option.description ? "blue.500" : "gray.300"}
                      bg={value === option.description ? "blue.500" : "transparent"}
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      flexShrink={0}
                    >
                      {value === option.description && (
                        <Box w="8px" h="8px" borderRadius="full" bg="white" />
                      )}
                    </Box>
                    <Text fontWeight="medium" fontSize="md">{option.description}</Text>
                  </HStack>
                  {option.image && (
                    <Text fontSize="sm" color="fg.muted" ml="28px">
                      Image: {option.image}
                    </Text>
                  )}
                </VStack>
              </Button>
            ))}
          </VStack>
        )
      
      default:
        return <Text color="fg.muted">Unsupported question type</Text>
    }
  }

  if (loading) {
    return <LoadingSpinner message="Loading questionnaire..." />
  }

  if (error) {
    return (
      <Box minH="100vh" bg="gray.50" p={8}>
        <VStack gap={8} maxW="800px" mx="auto">
          <Card.Root w="full">
            <Card.Body>
              <Alert.Root colorPalette="red">
                <Alert.Content>
                  <Alert.Title>Error!</Alert.Title>
                  <Alert.Description>{error}</Alert.Description>
                </Alert.Content>
              </Alert.Root>
            </Card.Body>
          </Card.Root>
        </VStack>
      </Box>
    )
  }

  if (!questionnaire) {
    return (
      <Box minH="100vh" bg="gray.50" p={8}>
        <VStack gap={8} maxW="800px" mx="auto">
          <Card.Root w="full">
            <Card.Body>
              <VStack gap={4} align="center">
                <Heading size="lg">No Questionnaire Available</Heading>
                <Text color="fg.muted">No questionnaire data was provided or the data is invalid.</Text>
                <Button onClick={() => router.push('/public')}>
                  Go Back
                </Button>
              </VStack>
            </Card.Body>
          </Card.Root>
        </VStack>
      </Box>
    )
  }

  if (!questionnaire || !questionnaire.steps || questionnaire.steps.length === 0) {
    return (
      <Box minH="100vh" bg="gray.50" p={8}>
        <VStack gap={8} maxW="800px" mx="auto">
          <Card.Root w="full">
            <Card.Body>
              <VStack gap={4} align="center">
                <Heading size="lg">Invalid Questionnaire Data</Heading>
                <Text color="fg.muted">The questionnaire data is incomplete or invalid.</Text>
                <Button onClick={() => router.push('/public')}>
                  Go Back
                </Button>
              </VStack>
            </Card.Body>
          </Card.Root>
        </VStack>
      </Box>
    )
  }
  
  const currentStep = questionnaire.steps[currentStepIndex]
  const progress = (currentStepIndex / (questionnaire.steps.length - 1)) * 100
  
  console.log('Render state:', { 
    currentStepIndex, 
    totalSteps: questionnaire.steps.length, 
    progress, 
    showReview,
    answers: Object.keys(answers)
  })
  
  if (!currentStep && !showReview) {
    return (
      <Box minH="100vh" bg="gray.50" p={8}>
        <VStack gap={8} maxW="800px" mx="auto">
          <Card.Root w="full">
            <Card.Body>
              <VStack gap={4} align="center">
                <Heading size="lg">Step Not Found</Heading>
                <Text color="fg.muted">The current step could not be loaded.</Text>
                <Button onClick={() => router.push('/public')}>
                  Go Back
                </Button>
              </VStack>
            </Card.Body>
          </Card.Root>
        </VStack>
      </Box>
    )
  }

  return (
    <Box minH="100vh" bg="gray.50">
      <PublicNavigation websiteName="Questionnaire" />
      <Box p={8}>
        <VStack gap={8} maxW="800px" mx="auto">
        {/* Header */}
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

        {/* Progress */}
        <Card.Root w="full" key={`progress-${showReview ? 'review' : currentStepIndex}`}>
          <Card.Body>
            <VStack gap={4} align="stretch">
              <HStack justify="space-between">
                <Text fontWeight="medium">Progress</Text>
                <Text fontSize="sm" color="fg.muted">
                  {showReview ? 'Review Answers' : `Step ${currentStepIndex + 1} of ${questionnaire.steps.length}`}
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
                {questionnaire.steps.map((step, index) => (
                  <Box
                    key={index}
                    w="8px"
                    h="8px"
                    borderRadius="full"
                    bg={index <= currentStepIndex ? "blue.500" : "gray.300"}
                    transition="all 0.3s"
                  />
                ))}
              </HStack>
            </VStack>
          </Card.Body>
        </Card.Root>

        {/* Current Step or Review */}
        <Card.Root w="full" key={showReview ? 'review' : 'questionnaire'}>
          <Card.Body>
            {showReview ? (
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
                                                      <Heading size="sm" color="blue.600" bg="blue.50" p={3} borderRadius="md" border="1px solid" borderColor="blue.200">
                            Step {stepIndex + 1}: {step.title}
                          </Heading>
                            
                            {step.questions && step.questions.map((question, questionIndex) => {
                              const answer = answers[question.id]
                              console.log('Rendering question:', questionIndex, question.id, answer)
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
                                  <Text fontWeight="semibold" fontSize="md" color="gray.800" mb={2}>
                                    {questionIndex + 1}. {question.question}
                                  </Text>
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
            ) : (
              <VStack gap={6} align="stretch">
                <VStack gap={2} align="flex-start">
                  <Heading size="md">Step {currentStepIndex + 1}: {currentStep.title}</Heading>
                  {currentStep.description && (
                    <Text color="fg.muted">{currentStep.description}</Text>
                  )}
                </VStack>

                <VStack gap={4} align="stretch">
                  {currentStep.questions.map((question, questionIndex) => (
                    <Card.Root key={question.id} variant="outline">
                      <Card.Body>
                        <VStack gap={4} align="stretch">
                          <HStack justify="space-between">
                            <Text fontWeight="medium">
                              {questionIndex + 1}. {question.question}
                            </Text>
                            {question.isRequired && (
                              <Badge colorPalette="red" variant="subtle" size="sm">
                                Required
                              </Badge>
                            )}
                          </HStack>
                          
                          {renderQuestion(question)}
                        </VStack>
                      </Card.Body>
                    </Card.Root>
                  ))}
                </VStack>
              </VStack>
            )}
          </Card.Body>
        </Card.Root>

        {/* Navigation */}
        <Card.Root w="full" key={`navigation-${showReview ? 'review' : 'questionnaire'}`}>
          <Card.Body>
            <HStack gap={4} justify="space-between">
              {showReview ? (
                <>
                  <Button
                    variant="outline"
                    onClick={handleBackToQuestionnaire}
                  >
                    Back to Questionnaire
                  </Button>
                  <Button
                    colorPalette="blue"
                    onClick={handleSubmit}
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
                    onClick={handlePrevious}
                    disabled={currentStepIndex === 0}
                  >
                    Previous
                  </Button>

                  <Button
                    colorPalette="blue"
                    onClick={handleNext}
                  >
                    {currentStepIndex === questionnaire.steps.length - 1 ? 'Review Answers' : 'Next'}
                  </Button>
                </>
              )}
            </HStack>
          </Card.Body>
        </Card.Root>
        </VStack>
      </Box>
    </Box>
  )
} 