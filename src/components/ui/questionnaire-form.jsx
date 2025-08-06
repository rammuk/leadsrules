'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Box,
  Button,
  Heading,
  VStack,
  HStack,
  Alert,
  useDisclosure,
  createListCollection
} from '@chakra-ui/react'
import {
  BasicInformation,
  StepsTable,
  StepCreationModal,
  QuestionBankModal,
  StepEditModal
} from './questionnaire'

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
    isActive: true,
    leaveBehindStrategy: false,
    showStepTitle: true,
    showQuestionTitles: true
  })
  const [viewStepModalIsOpen, setViewStepModalIsOpen] = useState(false)
  const [viewingStepIndex, setViewingStepIndex] = useState(null)
  const [editingStepData, setEditingStepData] = useState({
    title: '',
    description: '',
    isActive: true,
    leaveBehindStrategy: false,
    showStepTitle: true,
    showQuestionTitles: true
  })
  const [searchQuery, setSearchQuery] = useState('')
  const [draggedQuestion, setDraggedQuestion] = useState(null)
  const [editingQuestionIndex, setEditingQuestionIndex] = useState(null)
  const [questionnaireCreated, setQuestionnaireCreated] = useState(mode === 'edit')
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
    if (mode === 'create') {
      fetchWebsites()
    } else if (mode === 'edit' && questionnaire) {
      // For edit mode, create a websites collection with just the connected website
      const connectedWebsite = {
        id: questionnaire.websiteId,
        name: questionnaire.website?.name || 'Unknown Website'
      }
      
      websitesCollection = createListCollection({
        items: [{
          label: connectedWebsite.name,
          value: connectedWebsite.id
        }],
      })
      setWebsites(websitesCollection)
      
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
          leaveBehindStrategy: step.leaveBehindStrategy || false,
          showStepTitle: step.showStepTitle !== false,
          showQuestionTitles: step.showQuestionTitles !== false,
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
    
    fetchQuestionBank()
  }, [mode, questionnaire])

  const fetchWebsites = async () => {
    try {
      const response = await fetch('/api/websites')
      if (response.ok) {
        const data = await response.json()
        
        // Filter out websites that already have questionnaires
        const availableWebsites = data.filter(website => !website.questionnaires || website.questionnaires.length === 0)
        
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
      isActive: true,
      leaveBehindStrategy: false,
      showStepTitle: true,
      showQuestionTitles: true
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
        leaveBehindStrategy: newStepData.leaveBehindStrategy || false,
        showStepTitle: newStepData.showStepTitle !== false,
        showQuestionTitles: newStepData.showQuestionTitles !== false,
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
      isActive: step.isActive,
      leaveBehindStrategy: step.leaveBehindStrategy || false,
      showStepTitle: step.showStepTitle !== false,
      showQuestionTitles: step.showQuestionTitles !== false
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

  const handleDragStart = (e, question) => {
    setDraggedQuestion(question)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = (e) => {
    e.preventDefault()
    if (draggedQuestion) {
      setFormData(prev => ({
        ...prev,
        steps: prev.steps.map((step, index) => 
          index === viewingStepIndex ? {
            ...step,
            questions: [...step.questions, {
              question: draggedQuestion.question,
              questionType: draggedQuestion.questionType || 'options',
              displayType: draggedQuestion.displayType || 'list',
              isMultiSelect: draggedQuestion.isMultiSelect || false,
              isRequired: false,
              validationRules: draggedQuestion.validationRules || null,
              order: step.questions.length,
              isActive: true,
              questionBankId: draggedQuestion.id,
              options: draggedQuestion.options && Array.isArray(draggedQuestion.options) ? draggedQuestion.options.map(opt => ({
                description: opt.description,
                image: opt.image || '',
                order: opt.order
              })) : []
            }]
          } : step
        )
      }))
      setDraggedQuestion(null)
    }
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

  const filteredQuestionBank = questionBank.filter(question =>
    question.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    getQuestionTypeLabel(question.questionType).toLowerCase().includes(searchQuery.toLowerCase())
  )

  const startEditingQuestion = (questionIndex) => {
    setEditingQuestionIndex(questionIndex)
  }

  const stopEditingQuestion = () => {
    setEditingQuestionIndex(null)
  }

  const updateQuestionInStep = (questionIndex, field, value) => {
    setFormData(prev => ({
      ...prev,
      steps: prev.steps.map((step, index) => 
        index === viewingStepIndex ? {
          ...step,
          questions: step.questions.map((question, qIndex) => 
            qIndex === questionIndex ? { ...question, [field]: value } : question
          )
        } : step
      )
    }))
  }

  const addOptionToQuestionInStep = (questionIndex) => {
    setFormData(prev => ({
      ...prev,
      steps: prev.steps.map((step, index) => 
        index === viewingStepIndex ? {
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

  const removeOptionFromQuestionInStep = (questionIndex, optionIndex) => {
    setFormData(prev => ({
      ...prev,
      steps: prev.steps.map((step, index) => 
        index === viewingStepIndex ? {
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

  const updateOptionInStep = (questionIndex, optionIndex, field, value) => {
    setFormData(prev => ({
      ...prev,
      steps: prev.steps.map((step, index) => 
        index === viewingStepIndex ? {
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

  const removeStep = (stepIndex) => {
    setFormData(prev => ({
      ...prev,
      steps: prev.steps.filter((_, index) => index !== stepIndex)
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
            isRequired: false,
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

      if (mode === 'create') {
        // For create mode, set the questionnaire as created and stay on the page
        setQuestionnaireCreated(true)
        // Update the form data with the created questionnaire ID
        const createdQuestionnaire = await response.json()
        setFormData(prev => ({
          ...prev,
          id: createdQuestionnaire.id
        }))
        // Switch to edit mode
        router.replace(`/admin/questionnaires/${createdQuestionnaire.id}/edit`)
      } else {
        // For edit mode, redirect to questionnaires list
        router.push('/admin/questionnaires')
      }
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
   
      <VStack gap={6} align="stretch">
       

        {error && (
          <Alert.Root status="error">
            <Alert.Indicator />
            <Alert.Content>
              <Alert.Title>Error!</Alert.Title>
              <Alert.Description>{error}</Alert.Description>
            </Alert.Content>
          </Alert.Root>
        )}

        {mode === 'create' && questionnaireCreated && (
          <Alert.Root status="success">
            <Alert.Indicator />
            <Alert.Content>
              <Alert.Title>Questionnaire Created!</Alert.Title>
              <Alert.Description>
                Your questionnaire has been created successfully. You can now add steps and questions to build your questionnaire.
              </Alert.Description>
            </Alert.Content>
          </Alert.Root>
        )}

        <form onSubmit={handleSubmit}>
          <VStack gap={6} align="stretch">
            {/* Basic Information */}
            <BasicInformation 
              formData={formData}
              setFormData={setFormData}
              websites={websites}
              mode={mode}
            />

            {/* Steps - Only show if questionnaire is created or in edit mode */}
            {questionnaireCreated && (
              <StepsTable 
                formData={formData}
                openStepModal={openStepModal}
                openViewStepModal={openViewStepModal}
                removeStep={removeStep}
              />
            )}

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
                {mode === 'create' && !questionnaireCreated ? 'Create Questionnaire' : 'Update Questionnaire'}
              </Button>
            </HStack>
          </VStack>
        </form>

        {/* Question Bank Selection Modal */}
        <QuestionBankModal 
          isOpen={isOpen}
          onClose={onClose}
          selectedQuestionBankId={selectedQuestionBankId}
          setSelectedQuestionBankId={setSelectedQuestionBankId}
          questionBank={questionBank}
          selectQuestionFromBank={selectQuestionFromBank}
          getQuestionTypeLabel={getQuestionTypeLabel}
          getQuestionTypeColor={getQuestionTypeColor}
        />

        {/* Step Creation Modal */}
        <StepCreationModal 
          isOpen={stepModalIsOpen}
          onClose={closeStepModal}
          newStepData={newStepData}
          setNewStepData={setNewStepData}
          addStep={addStep}
        />

        {/* View/Edit Step Modal */}
        <StepEditModal 
          isOpen={viewStepModalIsOpen}
          onClose={closeViewStepModal}
          viewingStepIndex={viewingStepIndex}
          editingStepData={editingStepData}
          setEditingStepData={setEditingStepData}
          formData={formData}
          setFormData={setFormData}
          questionBank={questionBank}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          filteredQuestionBank={filteredQuestionBank}
          handleDragStart={handleDragStart}
          handleDragOver={handleDragOver}
          handleDrop={handleDrop}
          editingQuestionIndex={editingQuestionIndex}
          startEditingQuestion={startEditingQuestion}
          stopEditingQuestion={stopEditingQuestion}
          updateQuestionInStep={updateQuestionInStep}
          addOptionToQuestionInStep={addOptionToQuestionInStep}
          removeOptionFromQuestionInStep={removeOptionFromQuestionInStep}
          updateOptionInStep={updateOptionInStep}
          removeQuestionFromStep={removeQuestionFromStep}
          saveStepChanges={saveStepChanges}
          getQuestionTypeLabel={getQuestionTypeLabel}
          getQuestionTypeColor={getQuestionTypeColor}
        />
      </VStack>
    
  )
} 