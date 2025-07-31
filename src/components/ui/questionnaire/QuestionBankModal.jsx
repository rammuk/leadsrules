'use client'

import {
  Box,
  Button,
  Card,
  Heading,
  Text,
  VStack,
  HStack,
  Badge,
  Select
} from '@chakra-ui/react'

export default function QuestionBankModal({ 
  isOpen, 
  onClose, 
  selectedQuestionBankId, 
  setSelectedQuestionBankId, 
  questionBank, 
  selectQuestionFromBank, 
  getQuestionTypeLabel, 
  getQuestionTypeColor 
}) {
  if (!isOpen) return null

  return (
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
  )
} 