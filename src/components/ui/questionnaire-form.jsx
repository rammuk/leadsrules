'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Box,
  Button,
  Card,
  Heading,
  Text,
  VStack,
  HStack,
  Input,
  Textarea,
  Switch,
  Badge,
  Alert,
  IconButton,
  Select,
  useDisclosure,
  createListCollection,
  Table
} from '@chakra-ui/react'
import { LuPlus, LuTrash2, LuArrowUp, LuArrowDown, LuDatabase } from 'react-icons/lu'


export default function QuestionnaireForm({ mode = 'create', questionnaire = null }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    websiteId: '',
    isActive: true,
    steps: []
  })
  const [websites, setWebsites] = useState(null)
  const [questionBank, setQuestionBank] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [selectedStepIndex, setSelectedStepIndex] = useState(null)
  const [selectedQuestionBankId, setSelectedQuestionBankId] = useState('')
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [stepModalIsOpen, setStepModalIsOpen] = useState(false)
  const [newStepData, setNewStepData] = useState({
    title: '',
    description: '',
    isActive: true
  })
  const [viewStepModalIsOpen, setViewStepModalIsOpen] = useState(false)
  const [viewingStepIndex, setViewingStepIndex] = useState(null)
  const [editingStepData, setEditingStepData] = useState({
    title: '',
    description: '',
    isActive: true
  })
  const router = useRouter()
  let websitesCollection = null
  // Handle ESC key to close modal
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    
    if (isOpen) {
      document.addEventListener('keydown', handleEsc)
      return () => document.removeEventListener('keydown', handleEsc)
    }
  }, [isOpen, onClose])



  useEffect(() => {
    fetchWebsites()
    fetchQuestionBank()
    
    if (mode === 'edit' && questionnaire) {
      setFormData({
        title: questionnaire.title,
        description: questionnaire.description || '',
        websiteId: questionnaire.websiteId,
        isActive: questionnaire.isActive,
        steps: Array.isArray(questionnaire.steps) ? questionnaire.steps.map(step => ({
          id: step.id,
          title: step.title,
          description: step.description || '',
          isActive: step.isActive,
          order: step.order,
          questions: Array.isArray(step.questions) ? step.questions.map(q => ({
            id: q.id,
            question: q.question,
            questionType: q.questionType,
            displayType: q.displayType,
            isMultiSelect: q.isMultiSelect,
            isRequired: q.isRequired,
            validationRules: q.validationRules,
            order: q.order,
            isActive: q.isActive,
            questionBankId: q.questionBankId,
            options: Array.isArray(q.options) ? q.options.map(opt => ({
              id: opt.id,
              description: opt.description,
              image: opt.image || '',
              order: opt.order
            })) : []
          })) : []
        })) : []
      })
    }
  }, [mode, questionnaire])

  const fetchWebsites = async () => {
    try {
      const response = await fetch('/api/websites')
      if (response.ok) {
        const data = await response.json()
        
        // Filter out websites that already have questionnaires
        const availableWebsites = data.filter(website => !website.questionnaire)
        
        websitesCollection = createListCollection({
          items: availableWebsites.map(website => ({
            label: website.name,
            value: website.id
          })),
        })
        setWebsites(websitesCollection)
      }
    } catch (error) {
      console.error('Error fetching websites:', error)
    }
  }

  const fetchQuestionBank = async () => {
    try {
      const response = await fetch('/api/question-bank')
      if (response.ok) {
        const data = await response.json()
        setQuestionBank(data)
      }
    } catch (error) {
      console.error('Error fetching question bank:', error)
    }
  }

  const openStepModal = () => {
    setNewStepData({
      title: '',
      description: '',
      isActive: true
    })
    setStepModalIsOpen(true)
  }

  const closeStepModal = () => {
    setStepModalIsOpen(false)
  }

  const addStep = () => {
    setFormData(prev => ({
      ...prev,
      steps: [...prev.steps, {
        title: newStepData.title,
        description: newStepData.description,
        isActive: newStepData.isActive,
        order: prev.steps.length,
        questions: []
      }]
    }))
    closeStepModal()
  }

  const openViewStepModal = (stepIndex) => {
    const step = formData.steps[stepIndex]
    setViewingStepIndex(stepIndex)
    setEditingStepData({
      title: step.title,
      description: step.description,
      isActive: step.isActive
    })
    setViewStepModalIsOpen(true)
  }

  const closeViewStepModal = () => {
    setViewStepModalIsOpen(false)
    setViewingStepIndex(null)
  }

  const saveStepChanges = () => {
    setFormData(prev => ({
      ...prev,
      steps: prev.steps.map((step, index) => 
        index === viewingStepIndex 
          ? { ...step, ...editingStepData }
          : step
      )
    }))
    closeViewStepModal()
  }

  const removeStep = (stepIndex) => {
    setFormData(prev => ({
      ...prev,
      steps: prev.steps.filter((_, index) => index !== stepIndex)
    }))
  }

  const updateStep = (stepIndex, field, value) => {
    setFormData(prev => ({
      ...prev,
      steps: prev.steps.map((step, index) => 
        index === stepIndex ? { ...step, [field]: value } : step
      )
    }))
  }

  const openQuestionBankModal = (stepIndex) => {
    setSelectedStepIndex(stepIndex)
    setSelectedQuestionBankId('')
    onOpen()
  }

  const selectQuestionFromBank = () => {
    if (!selectedQuestionBankId) return

    const selectedQuestion = questionBank.find(q => q.id === selectedQuestionBankId)
    if (!selectedQuestion) return

    setFormData(prev => ({
      ...prev,
      steps: prev.steps.map((step, index) => 
        index === selectedStepIndex ? {
          ...step,
          questions: [...step.questions, {
            question: selectedQuestion.question,
            questionType: selectedQuestion.questionType || 'options',
            displayType: selectedQuestion.displayType || 'list',
            isMultiSelect: selectedQuestion.isMultiSelect || false,
            isRequired: false, // Can be different from question bank
            validationRules: selectedQuestion.validationRules || null,
            order: step.questions.length,
            isActive: true,
            questionBankId: selectedQuestion.id,
            options: selectedQuestion.options && Array.isArray(selectedQuestion.options) ? selectedQuestion.options.map(opt => ({
              description: opt.description,
              image: opt.image || '',
              order: opt.order
            })) : []
          }]
        } : step
      )
    }))

    onClose()
    setSelectedQuestionBankId('')
    setSelectedStepIndex(null)
  }

  const addQuestionToStep = (stepIndex) => {
    setFormData(prev => ({
      ...prev,
      steps: prev.steps.map((step, index) => 
        index === stepIndex ? {
          ...step,
          questions: [...step.questions, {
            question: '',
            questionType: 'options',
            displayType: 'list',
            isMultiSelect: false,
            isRequired: false,
            validationRules: null,
            order: step.questions.length,
            isActive: true,
            questionBankId: null,
            options: []
          }]
        } : step
      )
    }))
  }

  const removeQuestionFromStep = (stepIndex, questionIndex) => {
    setFormData(prev => ({
      ...prev,
      steps: prev.steps.map((step, index) => 
        index === stepIndex ? {
          ...step,
          questions: step.questions.filter((_, qIndex) => qIndex !== questionIndex)
        } : step
      )
    }))
  }

  const updateQuestion = (stepIndex, questionIndex, field, value) => {
    setFormData(prev => ({
      ...prev,
      steps: prev.steps.map((step, index) => 
        index === stepIndex ? {
          ...step,
          questions: step.questions.map((question, qIndex) => 
            qIndex === questionIndex ? { ...question, [field]: value } : question
          )
        } : step
      )
    }))
  }

  const addOptionToQuestion = (stepIndex, questionIndex) => {
    setFormData(prev => ({
      ...prev,
      steps: prev.steps.map((step, index) => 
        index === stepIndex ? {
          ...step,
          questions: step.questions.map((question, qIndex) => 
            qIndex === questionIndex ? {
              ...question,
              options: [...question.options, {
                description: '',
                image: '',
                order: question.options.length
              }]
            } : question
          )
        } : step
      )
    }))
  }

  const removeOptionFromQuestion = (stepIndex, questionIndex, optionIndex) => {
    setFormData(prev => ({
      ...prev,
      steps: prev.steps.map((step, index) => 
        index === stepIndex ? {
          ...step,
          questions: step.questions.map((question, qIndex) => 
            qIndex === questionIndex ? {
              ...question,
              options: question.options.filter((_, oIndex) => oIndex !== optionIndex)
            } : question
          )
        } : step
      )
    }))
  }

  const updateOption = (stepIndex, questionIndex, optionIndex, field, value) => {
    setFormData(prev => ({
      ...prev,
      steps: prev.steps.map((step, index) => 
        index === stepIndex ? {
          ...step,
          questions: step.questions.map((question, qIndex) => 
            qIndex === questionIndex ? {
              ...question,
              options: question.options.map((option, oIndex) => 
                oIndex === optionIndex ? { ...option, [field]: value } : option
              )
            } : question
          )
        } : step
      )
    }))
  }

  console.log('formData', formData)
  console.log('websites', websites)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const url = mode === 'create' ? '/api/questionnaires' : `/api/questionnaires/${questionnaire.id}`
      const method = mode === 'create' ? 'POST' : 'PUT'


      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to save questionnaire')
      }

      router.push('/admin/questionnaires')
    } catch (error) {
      console.error('Error saving questionnaire:', error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const getQuestionTypeLabel = (type) => {
    const labels = {
      options: 'Multiple Choice',
      date: 'Date Input',
      text: 'Text Input',
      textarea: 'Text Area'
    }
    return labels[type] || type
  }

  const getQuestionTypeColor = (type) => {
    const colors = {
      options: 'blue',
      date: 'green',
      text: 'orange',
      textarea: 'purple'
    }
    return colors[type] || 'gray'
  }

  return (
    <Box p={6}>
      <VStack gap={6} align="stretch">
        <Heading size="lg">
          {mode === 'create' ? 'Create Questionnaire' : 'Edit Questionnaire'}
        </Heading>

        {error && (
          <Alert status="error">
            <Alert.Title>Error!</Alert.Title>
            <Alert.Description>{error}</Alert.Description>
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <VStack gap={6} align="stretch">
            {/* Basic Information */}
            <Card.Root>
              <Card.Body>
                <VStack gap={4} align="stretch">
                  <Heading size="md">Basic Information</Heading>
                
                <Box>
                  <Text mb={2} fontWeight="medium">Title</Text>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter questionnaire title"
                    required
                  />
                </Box>

                <Box>
                  <Text mb={2} fontWeight="medium">Description</Text>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Enter questionnaire description"
                    rows={3}
                  />
                </Box>

                <Box>
                  <Text mb={2} fontWeight="medium">Website</Text>
                  
                </Box>
                {
                  websites && (
                    <Select.Root
                    collection={websites}
                    value={formData.websiteId || ''}
                    onValueChange={(e) => {
                      console.log('e', e)
                      setFormData(prev => ({ ...prev, websiteId: e.value }))}}
                  >
                    <Select.Control>
                      <Select.Trigger>
                        <Select.ValueText placeholder="Select a website" />
                        <Select.IndicatorGroup>
                          <Select.Indicator />
                        </Select.IndicatorGroup>
                      </Select.Trigger>
                    </Select.Control>
                    <Select.Positioner>
                      <Select.Content>
                        {websites?.items?.map(website => {
                          return(
                          <Select.Item key={website.value} item={website}>
                            {website.label}
                            <Select.ItemIndicator />
                          </Select.Item>
                        )})}
                      </Select.Content>
                    </Select.Positioner>
                  </Select.Root>
                  
                  )
                }
                
                <HStack justify="space-between">
                  <Text fontWeight="medium">Active</Text>
                  <Switch.Root
                    checked={formData.isActive}
                    onCheckedChange={(e) => setFormData(prev => ({ ...prev, isActive: e.checked }))}
                  >
                    <Switch.HiddenInput />
                    <Switch.Control />
                    <Switch.Label />
                  </Switch.Root>
                </HStack>
              </VStack>
            </Card.Body>
          </Card.Root>

            {/* Steps */}
            <Card.Root>
              <Card.Body>
                <VStack gap={4} align="stretch">
                  <HStack justify="space-between">
                    <Heading size="md">Steps</Heading>
                  <Button
                    leftIcon={<LuPlus />}
                    onClick={openStepModal}
                    size="sm"
                  >
                    Add Step
                  </Button>
                </HStack>

                {formData.steps.length === 0 ? (
                  <Text color="fg.muted" textAlign="center" py={8}>
                    No steps added yet. Add your first step to get started.
                  </Text>
                ) : (
                  <Box>
                    <Table.Root>
                      <Table.Header>
                        <Table.Row>
                          <Table.ColumnHeader>Order</Table.ColumnHeader>
                          <Table.ColumnHeader>Title</Table.ColumnHeader>
                          <Table.ColumnHeader>Description</Table.ColumnHeader>
                          <Table.ColumnHeader>Questions</Table.ColumnHeader>
                          <Table.ColumnHeader>Status</Table.ColumnHeader>
                          <Table.ColumnHeader>Actions</Table.ColumnHeader>
                        </Table.Row>
                      </Table.Header>
                      <Table.Body>
                        {Array.isArray(formData.steps) && formData.steps.map((step, stepIndex) => (
                          <Table.Row key={stepIndex}>
                            <Table.Cell>
                              <Text fontWeight="medium">{stepIndex + 1}</Text>
                            </Table.Cell>
                            <Table.Cell>
                              <Text>{step.title || 'Untitled Step'}</Text>
                            </Table.Cell>
                            <Table.Cell>
                              <Text color="fg.muted" noOfLines={2}>
                                {step.description || 'No description'}
                              </Text>
                            </Table.Cell>
                            <Table.Cell>
                              <Badge colorPalette="blue">
                                {Array.isArray(step.questions) ? step.questions.length : 0} questions
                              </Badge>
                            </Table.Cell>
                            <Table.Cell>
                              <Badge 
                                colorPalette={step.isActive ? "green" : "gray"}
                                variant={step.isActive ? "solid" : "subtle"}
                              >
                                {step.isActive ? 'Active' : 'Inactive'}
                              </Badge>
                            </Table.Cell>
                            <Table.Cell>
                              <HStack gap={2}>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => openViewStepModal(stepIndex)}
                                >
                                  View/Edit
                                </Button>
                                <IconButton
                                  size="sm"
                                  icon={<LuTrash2 />}
                                  onClick={() => removeStep(stepIndex)}
                                  colorPalette="red"
                                  variant="outline"
                                />
                              </HStack>
                            </Table.Cell>
                          </Table.Row>
                        ))}
                      </Table.Body>
                    </Table.Root>
                  </Box>
                )}
          </VStack>
        </Card.Body>
      </Card.Root>

            {/* Submit Button */}
            <HStack gap={4} justify="flex-end">
              <Button
                variant="outline"
                onClick={() => router.push('/admin/questionnaires')}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                loading={loading}
                disabled={loading}
              >
                {mode === 'create' ? 'Create Questionnaire' : 'Update Questionnaire'}
              </Button>
            </HStack>
          </VStack>
        </form>

        {/* Question Bank Selection Modal */}
        {isOpen && (
          <Box
            position="fixed"
            top={0}
            left={0}
            right={0}
            bottom={0}
            bg="blackAlpha.600"
            zIndex={1000}
            display="flex"
            alignItems="center"
            justifyContent="center"
            onClick={onClose}
          >
            <Card.Root
              maxW="500px"
              w="90%"
              onClick={(e) => e.stopPropagation()}
            >
              <Card.Header>
                <Heading size="md">Select Question from Question Bank</Heading>
              </Card.Header>
              <Card.Body>
                <VStack gap={4} align="stretch">
                  <Text fontSize="sm" color="fg.muted">
                    Choose a question from the question bank to add to this step. The question will be duplicated and can be modified independently.
                  </Text>
                  
                  <Box>
                    <Text mb={2} fontWeight="medium">Select Question</Text>
                    <Select.Root
                      value={selectedQuestionBankId || ''}
                      onChange={(value) => setSelectedQuestionBankId(value)}
                    >
                      <Select.Control>
                        <Select.Trigger>
                          <Select.ValueText placeholder="Choose a question from the bank" />
                        </Select.Trigger>
                        <Select.IndicatorGroup>
                          <Select.Indicator />
                        </Select.IndicatorGroup>
                      </Select.Control>
                      <Select.Positioner>
                        <Select.Content>
                          {Array.isArray(questionBank) && questionBank.map((question) => (
                            <Select.Item key={question.id} value={question.id}>
                              <Select.ItemText>
                                {question.question} ({getQuestionTypeLabel(question.questionType)})
                              </Select.ItemText>
                              <Select.ItemIndicator />
                            </Select.Item>
                          ))}
                        </Select.Content>
                      </Select.Positioner>
                    </Select.Root>
                  </Box>

                  {selectedQuestionBankId && (
                    <Card.Root variant="subtle">
                      <Card.Body>
                        <VStack gap={2} align="stretch">
                          <HStack justify="space-between">
                            <Text fontWeight="medium">Preview</Text>
                            <Badge colorPalette={getQuestionTypeColor(questionBank.find(q => q.id === selectedQuestionBankId)?.questionType)}>
                              {getQuestionTypeLabel(questionBank.find(q => q.id === selectedQuestionBankId)?.questionType)}
                            </Badge>
                          </HStack>
                          <Text fontSize="sm">
                            {questionBank.find(q => q.id === selectedQuestionBankId)?.question}
                          </Text>
                          {questionBank.find(q => q.id === selectedQuestionBankId)?.options && (
                            <Text fontSize="sm" color="fg.muted">
                              {questionBank.find(q => q.id === selectedQuestionBankId)?.options.length} options
                            </Text>
                          )}
                        </VStack>
                      </Card.Body>
                    </Card.Root>
                  )}
                </VStack>
              </Card.Body>
              <Card.Footer>
                <HStack gap={2} justify="flex-end">
                  <Button variant="outline" onClick={onClose}>
                    Cancel
                  </Button>
                  <Button
                    onClick={selectQuestionFromBank}
                    disabled={!selectedQuestionBankId}
                  >
                    Add Question
                  </Button>
                </HStack>
              </Card.Footer>
            </Card.Root>
          </Box>
        )}

        {/* Step Creation Modal */}
        {stepModalIsOpen && (
          <Box
            position="fixed"
            top={0}
            left={0}
            right={0}
            bottom={0}
            bg="blackAlpha.600"
            zIndex={1000}
            display="flex"
            alignItems="center"
            justifyContent="center"
            onClick={closeStepModal}
          >
            <Card.Root
              maxW="500px"
              w="90%"
              onClick={(e) => e.stopPropagation()}
            >
              <Card.Header>
                <Heading size="md">Add New Step</Heading>
              </Card.Header>
              <Card.Body>
                <VStack gap={4} align="stretch">
                  <Box>
                    <Text mb={2} fontWeight="medium">Title</Text>
                    <Input
                      value={newStepData.title}
                      onChange={(e) => setNewStepData(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Enter step title"
                      required
                    />
                  </Box>

                  <Box>
                    <Text mb={2} fontWeight="medium">Description</Text>
                    <Textarea
                      value={newStepData.description}
                      onChange={(e) => setNewStepData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Enter step description"
                      rows={3}
                    />
                  </Box>

                  <HStack justify="space-between">
                    <Text fontWeight="medium">Active</Text>
                    <Switch.Root
                      checked={newStepData.isActive}
                      onCheckedChange={(e) => setNewStepData(prev => ({ ...prev, isActive: e.checked }))}
                    >
                      <Switch.HiddenInput />
                      <Switch.Control />
                      <Switch.Label />
                    </Switch.Root>
                  </HStack>
                </VStack>
              </Card.Body>
              <Card.Footer>
                <HStack gap={2} justify="flex-end">
                  <Button variant="outline" onClick={closeStepModal}>
                    Cancel
                  </Button>
                  <Button
                    onClick={addStep}
                    disabled={!newStepData.title.trim()}
                  >
                    Add Step
                  </Button>
                </HStack>
              </Card.Footer>
            </Card.Root>
          </Box>
        )}

        {/* View/Edit Step Modal */}
        {viewStepModalIsOpen && (
          <Box
            position="fixed"
            top={0}
            left={0}
            right={0}
            bottom={0}
            bg="blackAlpha.600"
            zIndex={1000}
            display="flex"
            alignItems="center"
            justifyContent="center"
            onClick={closeViewStepModal}
          >
            <Card.Root
              maxW="600px"
              w="90%"
              maxH="80vh"
              onClick={(e) => e.stopPropagation()}
            >
              <Card.Header>
                <Heading size="md">Edit Step {viewingStepIndex !== null ? viewingStepIndex + 1 : ''}</Heading>
              </Card.Header>
              <Card.Body>
                <VStack gap={4} align="stretch">
                  <Box>
                    <Text mb={2} fontWeight="medium">Title</Text>
                    <Input
                      value={editingStepData.title}
                      onChange={(e) => setEditingStepData(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Enter step title"
                      required
                    />
                  </Box>

                  <Box>
                    <Text mb={2} fontWeight="medium">Description</Text>
                    <Textarea
                      value={editingStepData.description}
                      onChange={(e) => setEditingStepData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Enter step description"
                      rows={3}
                    />
                  </Box>

                  <HStack justify="space-between">
                    <Text fontWeight="medium">Active</Text>
                    <Switch.Root
                      checked={editingStepData.isActive}
                      onCheckedChange={(e) => setEditingStepData(prev => ({ ...prev, isActive: e.checked }))}
                    >
                      <Switch.HiddenInput />
                      <Switch.Control />
                      <Switch.Label />
                    </Switch.Root>
                  </HStack>

                  {/* Questions Section */}
                  <Box>
                    <HStack justify="space-between" mb={3}>
                      <Text fontWeight="medium">Questions</Text>
                      <HStack gap={2}>
                        <Button
                          size="sm"
                          leftIcon={<LuDatabase />}
                          onClick={() => openQuestionBankModal(viewingStepIndex)}
                        >
                          From Question Bank
                        </Button>
                        <Button
                          size="sm"
                          leftIcon={<LuPlus />}
                          onClick={() => addQuestionToStep(viewingStepIndex)}
                        >
                          Add New Question
                        </Button>
                      </HStack>
                    </HStack>

                    {formData.steps[viewingStepIndex]?.questions?.length === 0 ? (
                      <Text color="fg.muted" textAlign="center" py={4}>
                        No questions added yet. Add your first question to this step.
                      </Text>
                    ) : (
                      <VStack gap={3}>
                        {Array.isArray(formData.steps[viewingStepIndex]?.questions) && 
                         formData.steps[viewingStepIndex].questions.map((question, questionIndex) => (
                          <Card.Root key={questionIndex} variant="subtle">
                            <Card.Body>
                              <VStack gap={3} align="stretch">
                                <HStack justify="space-between">
                                  <HStack gap={2}>
                                    <Badge colorPalette={getQuestionTypeColor(question.questionType)}>
                                      {getQuestionTypeLabel(question.questionType)}
                                    </Badge>
                                    {question.questionBankId && (
                                      <Badge colorPalette="blue" variant="subtle">
                                        From Question Bank
                                      </Badge>
                                    )}
                                  </HStack>
                                  <HStack gap={1}>
                                    <IconButton
                                      size="xs"
                                      icon={<LuTrash2 />}
                                      onClick={() => removeQuestionFromStep(viewingStepIndex, questionIndex)}
                                      colorPalette="red"
                                      variant="outline"
                                    />
                                  </HStack>
                                </HStack>

                                <Box>
                                  <Text mb={2} fontSize="sm" fontWeight="medium">Question</Text>
                                  <Input
                                    value={question.question}
                                    onChange={(e) => updateQuestion(viewingStepIndex, questionIndex, 'question', e.target.value)}
                                    placeholder="Enter question text"
                                    size="sm"
                                    required
                                  />
                                </Box>

                                <HStack gap={4}>
                                  <Box flex={1}>
                                    <Text mb={2} fontSize="sm" fontWeight="medium">Type</Text>
                                    <Select.Root
                                      value={question.questionType || ''}
                                      onChange={(value) => updateQuestion(viewingStepIndex, questionIndex, 'questionType', value)}
                                      size="sm"
                                    >
                                      <Select.Control>
                                        <Select.Trigger>
                                          <Select.ValueText />
                                        </Select.Trigger>
                                        <Select.IndicatorGroup>
                                          <Select.Indicator />
                                        </Select.IndicatorGroup>
                                      </Select.Control>
                                      <Select.Positioner>
                                        <Select.Content>
                                          <Select.Item value="options">
                                            <Select.ItemText>Multiple Choice</Select.ItemText>
                                            <Select.ItemIndicator />
                                          </Select.Item>
                                          <Select.Item value="date">
                                            <Select.ItemText>Date Input</Select.ItemText>
                                            <Select.ItemIndicator />
                                          </Select.Item>
                                          <Select.Item value="text">
                                            <Select.ItemText>Text Input</Select.ItemText>
                                            <Select.ItemIndicator />
                                          </Select.Item>
                                          <Select.Item value="textarea">
                                            <Select.ItemText>Text Area</Select.ItemText>
                                            <Select.ItemIndicator />
                                          </Select.Item>
                                        </Select.Content>
                                      </Select.Positioner>
                                    </Select.Root>
                                  </Box>

                                  <Box flex={1}>
                                    <Text mb={2} fontSize="sm" fontWeight="medium">Required</Text>
                                    <Switch.Root
                                      checked={question.isRequired}
                                      onCheckedChange={(e) => updateQuestion(viewingStepIndex, questionIndex, 'isRequired', e.checked)}
                                      size="sm"
                                    >
                                      <Switch.HiddenInput />
                                      <Switch.Control />
                                      <Switch.Label />
                                    </Switch.Root>
                                  </Box>
                                </HStack>

                                {/* Options for multiple choice questions */}
                                {question.questionType === 'options' && (
                                  <Box>
                                    <HStack justify="space-between" mb={2}>
                                      <Text fontSize="sm" fontWeight="medium">Options</Text>
                                      <Button
                                        size="xs"
                                        leftIcon={<LuPlus />}
                                        onClick={() => addOptionToQuestion(viewingStepIndex, questionIndex)}
                                      >
                                        Add Option
                                      </Button>
                                    </HStack>

                                    <VStack gap={2}>
                                      {Array.isArray(question.options) && question.options.map((option, optionIndex) => (
                                        <HStack key={optionIndex} gap={2} w="full">
                                          <Input
                                            value={option.description}
                                            onChange={(e) => updateOption(viewingStepIndex, questionIndex, optionIndex, 'description', e.target.value)}
                                            placeholder="Enter option text"
                                            size="sm"
                                            flex={1}
                                          />
                                          <IconButton
                                            size="xs"
                                            icon={<LuTrash2 />}
                                            onClick={() => removeOptionFromQuestion(viewingStepIndex, questionIndex, optionIndex)}
                                            colorPalette="red"
                                            variant="outline"
                                          />
                                        </HStack>
                                      ))}
                                    </VStack>
                                  </Box>
                                )}
                              </VStack>
                            </Card.Body>
                          </Card.Root>
                        ))}
                      </VStack>
                    )}
                  </Box>
                </VStack>
              </Card.Body>
              <Card.Footer>
                <HStack gap={2} justify="flex-end">
                  <Button variant="outline" onClick={closeViewStepModal}>
                    Cancel
                  </Button>
                  <Button
                    onClick={saveStepChanges}
                    disabled={!editingStepData.title.trim()}
                  >
                    Save Changes
                  </Button>
                </HStack>
              </Card.Footer>
            </Card.Root>
          </Box>
        )}
      </VStack>
    </Box>
  )
} 