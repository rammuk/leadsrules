'use client'

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
  IconButton,
  Select,
  Grid,
  GridItem,
  createListCollection
} from '@chakra-ui/react'
import { LuPlus, LuTrash2, LuSearch, LuGripVertical } from 'react-icons/lu'

export default function StepEditModal({ 
  isOpen, 
  onClose, 
  viewingStepIndex, 
  editingStepData, 
  setEditingStepData, 
  formData, 
  setFormData, 
  questionBank, 
  searchQuery, 
  setSearchQuery, 
  filteredQuestionBank, 
  handleDragStart, 
  handleDragOver, 
  handleDrop, 
  editingQuestionIndex, 
  startEditingQuestion, 
  stopEditingQuestion, 
  updateQuestionInStep, 
  addOptionToQuestionInStep, 
  removeOptionFromQuestionInStep, 
  updateOptionInStep, 
  removeQuestionFromStep, 
  saveStepChanges, 
  getQuestionTypeLabel, 
  getQuestionTypeColor 
}) {
  if (!isOpen) return null
  const displayTypeCollection = createListCollection({
    items: [
      { label: "List", value: "list" },
      { label: "Cards", value: "cards" },
    ],
  })

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
                    maxW="1200px"
                    w="95%"
                    maxH="90vh"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Card.Header>
                      <Heading size="md">Edit Step {viewingStepIndex !== null ? viewingStepIndex + 1 : ''}</Heading>
                    </Card.Header>
                    <Card.Body p={0}>
                      <Grid templateColumns="1fr 1fr" gap={6} h="calc(90vh - 200px)" p={6}>
            {/* Left Side - Step Details & Assigned Questions */}
            <GridItem>
              <VStack gap={4} align="stretch" h="full">
                {/* Step Details */}
                <Card.Root>
                  <Card.Header>
                    <Heading size="sm">Step Details</Heading>
                  </Card.Header>
                  <Card.Body>
                    <VStack gap={3} align="stretch">
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
                          rows={2}
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

                      <HStack justify="space-between">
                        <Text fontWeight="medium">Leave Behind Strategy</Text>
                        <Switch.Root
                          checked={editingStepData.leaveBehindStrategy || false}
                          onCheckedChange={(e) => setEditingStepData(prev => ({ ...prev, leaveBehindStrategy: e.checked }))}
                        >
                          <Switch.HiddenInput />
                          <Switch.Control />
                          <Switch.Label />
                        </Switch.Root>
                      </HStack>

                      <HStack justify="space-between">
                        <Text fontWeight="medium">Show Step Title</Text>
                        <Switch.Root
                          checked={editingStepData.showStepTitle !== false}
                          onCheckedChange={(e) => setEditingStepData(prev => ({ ...prev, showStepTitle: e.checked }))}
                        >
                          <Switch.HiddenInput />
                          <Switch.Control />
                          <Switch.Label />
                        </Switch.Root>
                      </HStack>

                      <HStack justify="space-between">
                        <Text fontWeight="medium">Show Question Titles</Text>
                        <Switch.Root
                          checked={editingStepData.showQuestionTitles !== false}
                          onCheckedChange={(e) => setEditingStepData(prev => ({ ...prev, showQuestionTitles: e.checked }))}
                        >
                          <Switch.HiddenInput />
                          <Switch.Control />
                          <Switch.Label />
                        </Switch.Root>
                      </HStack>
                    </VStack>
                  </Card.Body>
                </Card.Root>

                                            {/* Assigned Questions */}
                            <Card.Root flex={1} display="flex" flexDirection="column">
                              <Card.Header>
                                <Heading size="sm">Assigned Questions</Heading>
                              </Card.Header>
                              <Card.Body flex={1} display="flex" flexDirection="column" p={4}>
                                <Box
                                  flex={1}
                                  overflowY="auto"
                                  overflowX="hidden"
                                  onDragOver={handleDragOver}
                                  onDrop={handleDrop}
                                  border="2px dashed"
                                  borderColor="gray.200"
                                  borderRadius="md"
                                  p={4}
                                  _hover={{ borderColor: "blue.300" }}
                                  css={{
                                    '&::-webkit-scrollbar': {
                                      width: '8px',
                                    },
                                    '&::-webkit-scrollbar-track': {
                                      background: 'transparent',
                                    },
                                    '&::-webkit-scrollbar-thumb': {
                                      background: '#cbd5e0',
                                      borderRadius: '4px',
                                    },
                                    '&::-webkit-scrollbar-thumb:hover': {
                                      background: '#a0aec0',
                                    },
                                  }}
                                >
                      {formData.steps[viewingStepIndex]?.questions?.length === 0 ? (
                        <VStack gap={2} justify="center" h="full" color="fg.muted">
                          <Text textAlign="center">No questions assigned yet</Text>
                          <Text fontSize="sm" textAlign="center">
                            Drag questions from the right panel to assign them to this step
                          </Text>
                        </VStack>
                      ) : (
                        <VStack gap={2}>
                          {Array.isArray(formData.steps[viewingStepIndex]?.questions) && 
                           formData.steps[viewingStepIndex].questions.map((question, questionIndex) => (
                            <Card.Root key={questionIndex} variant="subtle" w="full">
                              <Card.Body>
                                {editingQuestionIndex === questionIndex ? (
                                  // Edit Mode
                                  <VStack gap={3} align="stretch">
                                    <HStack justify="space-between">
                                      <Text fontSize="sm" fontWeight="medium">Edit Question</Text>
                                      <HStack gap={2}>
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          onClick={stopEditingQuestion}
                                        >
                                          Cancel
                                        </Button>
                                        <Button
                                          size="sm"
                                          onClick={stopEditingQuestion}
                                        >
                                          Save
                                        </Button>
                                      </HStack>
                                    </HStack>

                                    {/* Question Text - Read Only */}
                                    <Box>
                                      <Text mb={2} fontSize="sm" fontWeight="medium">Question Text</Text>
                                      <Input
                                        value={question.question}
                                        placeholder="Question text (read-only)"
                                        size="sm"
                                        disabled
                                        opacity={0.7}
                                      />
                                    </Box>

                                    {/* Question Type - Read Only */}
                                    <Box>
                                      <Text mb={2} fontSize="sm" fontWeight="medium">Question Type</Text>
                                      <Input
                                        value={getQuestionTypeLabel(question.questionType)}
                                        placeholder="Question type (read-only)"
                                        size="sm"
                                        disabled
                                        opacity={0.7}
                                      />
                                    </Box>

                                    {/* Display Type */}
                                    <Box>
                                      <Text mb={2} fontSize="sm" fontWeight="medium">Display Type</Text>
                                      <Select.Root
                                        collection={displayTypeCollection}
                                        value={question.displayType || 'list'}
                                        onChange={(e) => updateQuestionInStep(questionIndex, 'displayType', e.value[0])}
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
                                          {displayTypeCollection.items.map((item) => (
                                  <Select.Item item={item} key={item.value}>
                                              {item.label}
                                              <Select.ItemIndicator />
                                            </Select.Item>
                                          ))}
                                          </Select.Content>
                                        </Select.Positioner>
                                      </Select.Root>
                                    </Box>

                                    {/* Required Toggle */}
                                    <HStack justify="space-between">
                                      <Text fontSize="sm" fontWeight="medium">Required</Text>
                                      <Switch.Root
                                        checked={question.isRequired}
                                        onCheckedChange={(e) => updateQuestionInStep(questionIndex, 'isRequired', e.checked)}
                                        size="sm"
                                      >
                                        <Switch.HiddenInput />
                                        <Switch.Control />
                                        <Switch.Label />
                                      </Switch.Root>
                                    </HStack>

                                    {/* Options for multiple choice questions - Read Only */}
                                    {question.questionType === 'options' && (
                                      <Box>
                                        <HStack justify="space-between" mb={2}>
                                          <Text fontSize="sm" fontWeight="medium">Options</Text>
                                          <Text fontSize="xs" color="fg.muted">(Read-only)</Text>
                                        </HStack>

                                        <VStack gap={2}>
                                          {Array.isArray(question.options) && question.options.map((option, optionIndex) => (
                                            <HStack key={optionIndex} gap={2} w="full">
                                              <Input
                                                value={option.description}
                                                placeholder="Option text (read-only)"
                                                size="sm"
                                                flex={1}
                                                disabled
                                                opacity={0.7}
                                              />
                                            </HStack>
                                          ))}
                                        </VStack>
                                      </Box>
                                    )}
                                  </VStack>
                                ) : (
                                  // View Mode
                                  <HStack justify="space-between">
                                    <HStack gap={2} flex={1}>
                                      <LuGripVertical color="gray" />
                                      <VStack gap={1} align="flex-start" flex={1}>
                                        <Text fontSize="sm" fontWeight="medium" noOfLines={1}>
                                          {question.question}
                                        </Text>
                                        <HStack gap={2}>
                                          <Badge size="sm" colorPalette={getQuestionTypeColor(question.questionType)}>
                                            {getQuestionTypeLabel(question.questionType)}
                                          </Badge>
                                          {question.questionBankId && (
                                            <Badge size="sm" colorPalette="blue" variant="subtle">
                                              From Bank
                                            </Badge>
                                          )}
                                          {question.isRequired && (
                                            <Badge size="sm" colorPalette="red" variant="subtle">
                                              Required
                                            </Badge>
                                          )}
                                        </HStack>
                                      </VStack>
                                    </HStack>
                                    <HStack gap={1}>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        colorPalette="blue"
                                        onClick={() => startEditingQuestion(questionIndex)}
                                      >
                                        Edit
                                      </Button>
                                      <IconButton
                                        size="sm"
                                        icon={<LuTrash2 />}
                                        onClick={() => removeQuestionFromStep(viewingStepIndex, questionIndex)}
                                        colorPalette="red"
                                        variant="outline"
                                      />
                                    </HStack>
                                  </HStack>
                                )}
                              </Card.Body>
                            </Card.Root>
                          ))}
                        </VStack>
                      )}
                    </Box>
                  </Card.Body>
                </Card.Root>
              </VStack>
            </GridItem>

            {/* Right Side - Question Bank */}
            <GridItem>
              <Card.Root h="full" display="flex"  flexDirection="column">
                <Card.Header>
                  <Heading size="sm">Question Bank</Heading>
                </Card.Header>
                <Card.Body flex={1} display="flex" flexDirection="column" p={4}>
                  <VStack gap={4} align="stretch" h="full">
                    {/* Search */}
                    <Box flexShrink={0}>
                      <HStack>
                        <LuSearch />
                        <Input
                          placeholder="Search questions..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                        />
                      </HStack>
                    </Box>

                    {/* Question List */}
                    <Box 
                      
                      overflowX="hidden"
                      css={{
                        '&::-webkit-scrollbar': {
                          width: '8px',
                        },
                        '&::-webkit-scrollbar-track': {
                          background: 'transparent',
                        },
                        '&::-webkit-scrollbar-thumb': {
                          background: '#cbd5e0',
                          borderRadius: '4px',
                        },
                        '&::-webkit-scrollbar-thumb:hover': {
                          background: '#a0aec0',
                        },
                      }}
                    >
                      <VStack gap={2} pb={2} overflow="scroll" h="full" flex={1} 
                      maxH="600px" >
                        {filteredQuestionBank.map((question) => (
                          <Card.Root
                            key={question.id}
                            variant="outline"
                            w="full"
                            draggable
                            onDragStart={(e) => handleDragStart(e, question)}
                            cursor="grab"
                            _hover={{ shadow: "md" }}
                            flexShrink={0}
                          >
                            <Card.Body>
                              <VStack gap={2} align="stretch">
                                <HStack justify="space-between">
                                  <Text fontSize="sm" fontWeight="medium" noOfLines={2}>
                                    {question.question}
                                  </Text>
                                  <Badge size="sm" colorPalette={getQuestionTypeColor(question.questionType)}>
                                    {getQuestionTypeLabel(question.questionType)}
                                  </Badge>
                                </HStack>
                                
                                {question.options && Array.isArray(question.options) && question.options.length > 0 && (
                                  <Text fontSize="xs" color="fg.muted">
                                    {question.options.length} options
                                  </Text>
                                )}
                                
                                <HStack gap={1}>
                                  <LuGripVertical color="gray" />
                                  <Text fontSize="xs" color="fg.muted">
                                    Drag to assign
                                  </Text>
                                </HStack>
                              </VStack>
                            </Card.Body>
                          </Card.Root>
                        ))}
                      </VStack>
                    </Box>
                  </VStack>
                </Card.Body>
              </Card.Root>
            </GridItem>
          </Grid>
        </Card.Body>
        <Card.Footer>
          <HStack gap={2} justify="flex-end">
            <Button variant="outline" onClick={onClose}>
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
  )
} 