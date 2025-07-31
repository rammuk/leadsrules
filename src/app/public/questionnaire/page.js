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
  const [website, setWebsite] = useState(null)
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [answers, setAnswers] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const router = useRouter()

  useEffect(() => {
    fetchWebsiteData()
  }, [])

  const fetchWebsiteData = async () => {
    try {
      const response = await fetch(`/api/public/websites/${publicConfig.websiteId}/questionnaires`)
      if (response.ok) {
        const data = await response.json()
        setWebsite(data)
      } else {
        setError('Failed to load questionnaire')
      }
    } catch (error) {
      console.error('Error fetching website data:', error)
      setError('Failed to connect to server')
    } finally {
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
    if (currentStepIndex < website.questionnaires[0].steps.length - 1) {
      setCurrentStepIndex(prev => prev + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1)
    }
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    try {
      const response = await fetch(`/api/public/websites/${publicConfig.websiteId}/questionnaires/${website.questionnaires[0].id}/responses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          questionnaireId: website.questionnaires[0].id,
          answers: answers
        })
      })

      if (response.ok) {
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
          />
        )
      
      case 'date':
        return (
          <Input
            type="date"
            value={value}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            required={question.isRequired}
          />
        )
      
      case 'options':
        return (
          <VStack gap={2} align="stretch">
            {question.options.map((option, index) => (
              <Button
                key={option.id}
                variant={value === option.description ? 'solid' : 'outline'}
                colorPalette="blue"
                onClick={() => handleAnswerChange(question.id, option.description)}
                justifyContent="flex-start"
                h="auto"
                p={3}
              >
                <VStack gap={1} align="flex-start" w="full">
                  <Text fontWeight="medium">{option.description}</Text>
                  {option.image && (
                    <Text fontSize="sm" color="fg.muted">
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
              <Alert status="error">
                <Alert.Title>Error!</Alert.Title>
                <Alert.Description>{error}</Alert.Description>
              </Alert>
            </Card.Body>
          </Card.Root>
        </VStack>
      </Box>
    )
  }

  if (!website || !website.questionnaires || website.questionnaires.length === 0) {
    return (
      <Box minH="100vh" bg="gray.50" p={8}>
        <VStack gap={8} maxW="800px" mx="auto">
          <Card.Root w="full">
            <Card.Body>
              <VStack gap={4} align="center">
                <Heading size="lg">No Questionnaire Available</Heading>
                <Text color="fg.muted">There is no active questionnaire for this website.</Text>
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

  const questionnaire = website.questionnaires[0]
  const currentStep = questionnaire.steps[currentStepIndex]
  const progress = ((currentStepIndex + 1) / questionnaire.steps.length) * 100

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
        <Card.Root w="full">
          <Card.Body>
            <VStack gap={4} align="stretch">
              <HStack justify="space-between">
                <Text fontWeight="medium">Progress</Text>
                <Text fontSize="sm" color="fg.muted">
                  Step {currentStepIndex + 1} of {questionnaire.steps.length}
                </Text>
              </HStack>
              <Progress value={progress} colorPalette="blue" />
            </VStack>
          </Card.Body>
        </Card.Root>

        {/* Current Step */}
        <Card.Root w="full">
          <Card.Body>
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
          </Card.Body>
        </Card.Root>

        {/* Navigation */}
        <Card.Root w="full">
          <Card.Body>
            <HStack gap={4} justify="space-between">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentStepIndex === 0}
              >
                Previous
              </Button>

              {currentStepIndex === questionnaire.steps.length - 1 ? (
                <Button
                  colorPalette="blue"
                  onClick={handleSubmit}
                  loading={submitting}
                  disabled={submitting}
                >
                  Submit Questionnaire
                </Button>
              ) : (
                <Button
                  colorPalette="blue"
                  onClick={handleNext}
                >
                  Next
                </Button>
              )}
            </HStack>
          </Card.Body>
        </Card.Root>
        </VStack>
      </Box>
    </Box>
  )
} 