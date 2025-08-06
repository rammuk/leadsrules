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
  Alert,
} from '@chakra-ui/react'
import { publicConfig } from '@/config/public'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import PublicNavigation from '@/components/ui/PublicNavigation'
import {
  QuestionnaireHeader,
  QuestionnaireProgress,
  StepTitle,
  QuestionCard,
  ReviewSection,
  QuestionnaireNavigation
} from '@/components/ui/questionnaire'

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

  const handleLeaveBehindStrategy = () => {
    const currentStep = questionnaire.steps[currentStepIndex]
    if (!currentStep?.leaveBehindStrategy) return false
    
    // Save current step data for leave behind page
    sessionStorage.setItem('leaveBehindData', JSON.stringify(currentStep))
    
    // Open next question in new tab if there is one
    if (currentStepIndex < questionnaire.steps.length - 1) {
      const nextStepIndex = currentStepIndex + 1
      const nextStep = questionnaire.steps[nextStepIndex]
      
      // Create a new questionnaire data with all remaining steps
      const remainingSteps = questionnaire.steps.slice(nextStepIndex)
      const nextQuestionnaireData = {
        ...questionnaire,
        steps: remainingSteps,
        originalTotalSteps: questionnaire.steps.length,
        stepOffset: nextStepIndex
      }
      
      // Open in new tab with data
      const newTab = window.open('', '_blank')
      if (newTab) {
        // Set the data first, then navigate
        newTab.sessionStorage.setItem('questionnaireData', JSON.stringify(nextQuestionnaireData))
        newTab.location.href = '/public/questionnaire'
      }
      
      // Redirect current page to leave behind page
      setTimeout(() => {
        router.push('/public/leave-behind')
      }, 500)
      return true
    }
    return false
  }

  const handleAnswerChange = (questionId, value) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }))

    // Check if current step has leave behind strategy
    if (handleLeaveBehindStrategy()) {
      return
    }
  }

  const handleNext = () => {
    console.log('handleNext called', { currentStepIndex, totalSteps: questionnaire.steps.length })
    
    // Check if current step has leave behind strategy
    if (handleLeaveBehindStrategy()) {
      return
    }
    
    // Normal navigation logic
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
  
  // Calculate progress based on original total steps if available
  let totalSteps = questionnaire.steps.length
  let currentStepForProgress = currentStepIndex
  
  if (questionnaire.originalTotalSteps && questionnaire.stepOffset !== undefined) {
    // We're in a new tab with remaining steps, calculate based on original
    totalSteps = questionnaire.originalTotalSteps
    currentStepForProgress = questionnaire.stepOffset + currentStepIndex
  }
  
  const progress = totalSteps <= 1 ? 100 : (currentStepForProgress / (totalSteps - 1)) * 100
  
  console.log('Render state:', { 
    currentStepIndex, 
    totalSteps: questionnaire.steps.length, 
    progress, 
    showReview,
    currentStep,
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
          <QuestionnaireHeader questionnaire={questionnaire} />

          {/* Progress */}
          <QuestionnaireProgress 
            currentStepForProgress={currentStepForProgress}
            totalSteps={totalSteps}
            showReview={showReview}
            currentStepIndex={currentStepIndex}
          />

          {/* Current Step or Review */}
          <Card.Root w="full" key={showReview ? 'review' : 'questionnaire'}>
            <Card.Body>
              {showReview ? (
                <ReviewSection questionnaire={questionnaire} answers={answers} />
              ) : (
                <VStack gap={6} align="stretch">
                  {/* Step Title */}
                  <StepTitle 
                    currentStep={currentStep}
                    currentStepIndex={currentStepIndex}
                    showStepTitle={(currentStep.showStepTitle === true )}
                  />

                  {/* Questions */}
                  <VStack gap={4} align="stretch">
                    {currentStep.questions.map((question, questionIndex) => {
                      const value = answers[question.id] || ''
                      const showStepTitle = currentStep.showStepTitle === true 
                      const showQuestionTitles = currentStep.showQuestionTitles === true 
                      
                      return (
                        <QuestionCard
                          key={question.id}
                          question={question}
                          questionIndex={questionIndex}
                          value={value}
                          onAnswerChange={handleAnswerChange}
                          showStepTitle={showStepTitle}
                          showQuestionTitles={showQuestionTitles}
                        />
                      )
                    })}
                  </VStack>
                </VStack>
              )}
            </Card.Body>
          </Card.Root>

          {/* Navigation */}
          <QuestionnaireNavigation 
            showReview={showReview}
            currentStepIndex={currentStepIndex}
            questionnaire={questionnaire}
            onPrevious={handlePrevious}
            onNext={handleNext}
            onBackToQuestionnaire={handleBackToQuestionnaire}
            onSubmit={handleSubmit}
            submitting={submitting}
          />
        </VStack>
      </Box>
    </Box>
  )
} 