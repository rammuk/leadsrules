"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  Button,
  Card,
  Box,
  Field,
  HStack,
  Input,
  Select,
  Switch,
  Text,
  Textarea,
  VStack,
  Portal,
  createListCollection,
  Table,
} from "@chakra-ui/react"

export default function QuestionBankForm({ mode = "create", question = null }) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    question: "",
    questionType: "options",
    displayType: "list",
    isMultiSelect: false,
    isActive: true,
    options: [{ description: "", image: "" }],
    validationRules: {
      minLength: 0,
      maxLength: 0,
      pattern: "",
      type: "text" // text, email, phone, number
    }
  })

  // Create collections for dropdown options
  const questionTypeCollection = createListCollection({
    items: [
      { label: "Multiple Choice", value: "options" },
      { label: "Date Input", value: "date" },
      { label: "Text Input", value: "text" },
      { label: "Text Area", value: "textarea" },
    ],
  })

  const displayTypeCollection = createListCollection({
    items: [
      { label: "List", value: "list" },
      { label: "Cards", value: "cards" },
    ],
  })

  const validationTypeCollection = createListCollection({
    items: [
      { label: "Text", value: "text" },
      { label: "Email", value: "email" },
      { label: "Phone", value: "phone" },
      { label: "Number", value: "number" },
    ],
  })

  useEffect(() => {
    if (mode === "edit" && question) {
      setFormData({
        question: question.question,
        questionType: question.questionType || "options",
        displayType: question.displayType,
        isMultiSelect: question.isMultiSelect,
        isActive: question.isActive,
        options: question.options.map(opt => ({
          description: opt.description,
          image: opt.image || ""
        })),
        validationRules: question.validationRules || {
          minLength: 0,
          maxLength: 0,
          pattern: "",
          type: "text"
        }
      })
    }
  }, [mode, question])

  const addOption = () => {
    setFormData(prev => ({
      ...prev,
      options: [...prev.options, { description: "", image: "" }]
    }))
  }

  const removeOption = (index) => {
    if (formData.options.length > 1) {
      setFormData(prev => ({
        ...prev,
        options: prev.options.filter((_, i) => i !== index)
      }))
    }
  }

  const updateOption = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      options: prev.options.map((option, i) =>
        i === index ? { ...option, [field]: value } : option
      )
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const url = mode === "create" 
        ? "/api/question-bank" 
        : `/api/question-bank/${question.id}`
      
      const method = mode === "create" ? "POST" : "PUT"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: formData.question,
          questionType: formData.questionType,
          displayType: formData.displayType,
          isMultiSelect: formData.isMultiSelect,
          options: formData.questionType === "options" ? formData.options.filter(opt => opt.description.trim()) : []
        }),
      })

      if (response.ok) {
        router.push("/admin/question-bank")
      } else {
        const error = await response.json()
        alert(error.error || "An error occurred")
      }
    } catch (error) {
      console.error("Error saving question:", error)
      alert("An error occurred while saving the question")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this question?")) return

    setIsLoading(true)
    try {
      const response = await fetch(`/api/question-bank/${question.id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        router.push("/admin/question-bank")
      } else {
        const error = await response.json()
        alert(error.error || "An error occurred")
      }
    } catch (error) {
      console.error("Error deleting question:", error)
      alert("An error occurred while deleting the question")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Box minH="100vh" p="8">
      <VStack gap="8" align="stretch">
        <Card.Root>
          <Card.Body>
            <VStack gap={6} align="stretch">
              <VStack align="start" gap={2}>
                <Text fontSize="2xl" fontWeight="bold">
                  {mode === "create" ? "Add New Question" : "Edit Question"}
                </Text>
                <Text color="fg.muted">
                  {mode === "create" 
                    ? "Create a reusable question for questionnaires"
                    : "Update the question details"
                  }
                </Text>
              </VStack>

              <form onSubmit={handleSubmit}>
                <VStack gap={6} align="stretch">
                  {/* Question Text */}
                  <Field.Root>
                    <Field.Label>Question Text</Field.Label>
                    <Textarea
                      value={formData.question}
                      onChange={(e) => setFormData(prev => ({ ...prev, question: e.target.value }))}
                      placeholder="Enter your question here..."
                      required
                    />
                  </Field.Root>

                  {/* Question Type */}
                  <Field.Root>
                    <Field.Label>Question Type</Field.Label>
                    <Select.Root
                      collection={questionTypeCollection}
                      value={[formData.questionType]}
                      onValueChange={(e) => setFormData(prev => ({ ...prev, questionType: e.value[0] }))}
                    >
                      <Select.HiddenSelect />
                      <Select.Control>
                        <Select.Trigger>
                          <Select.ValueText placeholder="Select question type" />
                        </Select.Trigger>
                        <Select.IndicatorGroup>
                          <Select.Indicator />
                        </Select.IndicatorGroup>
                      </Select.Control>
                      <Portal>
                        <Select.Positioner>
                          <Select.Content>
                            {questionTypeCollection.items.map((item) => (
                              <Select.Item item={item} key={item.value}>
                                {item.label}
                                <Select.ItemIndicator />
                              </Select.Item>
                            ))}
                          </Select.Content>
                        </Select.Positioner>
                      </Portal>
                    </Select.Root>
                  </Field.Root>

                  {/* Display Type - Only show for options type */}
                  {formData.questionType === "options" && (
                    <Field.Root>
                      <Field.Label>Display Type</Field.Label>
                      <Select.Root
                        collection={displayTypeCollection}
                        value={[formData.displayType]}
                        onValueChange={(e) => setFormData(prev => ({ ...prev, displayType: e.value[0] }))}
                      >
                        <Select.HiddenSelect />
                        <Select.Control>
                          <Select.Trigger>
                            <Select.ValueText placeholder="Select display type" />
                          </Select.Trigger>
                          <Select.IndicatorGroup>
                            <Select.Indicator />
                          </Select.IndicatorGroup>
                        </Select.Control>
                        <Portal>
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
                        </Portal>
                      </Select.Root>
                    </Field.Root>
                  )}

                  {/* Multi-select Toggle - Only show for options type */}
                  {formData.questionType === "options" && (
                    <Field.Root>
                      <HStack justify="space-between">
                        <Field.Label>Allow Multiple Selections</Field.Label>
                        <Switch.Root
                          checked={formData.isMultiSelect}
                          onCheckedChange={(e) => setFormData(prev => ({ ...prev, isMultiSelect: e.checked }))}
                        >
                          <Switch.HiddenInput />
                          <Switch.Control />
                          <Switch.Label />
                        </Switch.Root>
                      </HStack>
                    </Field.Root>
                  )}

                  {/* Date Input Preview */}
                  {formData.questionType === "date" && (
                    <Field.Root>
                      <Field.Label>Date Input Preview</Field.Label>
                      <VStack gap={3} p={4} border="1px solid" borderColor="border.subtle" rounded="md">
                        <Text fontSize="sm" color="fg.muted">
                          Users will see three input fields for day, month, and year
                        </Text>
                        <HStack gap={2}>
                          <Input
                            placeholder="DD"
                            size="sm"
                            maxLength={2}
                            w="60px"
                            disabled
                          />
                          <Text>/</Text>
                          <Input
                            placeholder="MM"
                            size="sm"
                            maxLength={2}
                            w="60px"
                            disabled
                          />
                          <Text>/</Text>
                          <Input
                            placeholder="YYYY"
                            size="sm"
                            maxLength={4}
                            w="80px"
                            disabled
                          />
                        </HStack>
                        <Text fontSize="xs" color="fg.muted">
                          Format: DD/MM/YYYY
                        </Text>
                      </VStack>
                    </Field.Root>
                  )}

                  {/* Text Input Validation Rules */}
                  {(formData.questionType === "text" || formData.questionType === "textarea") && (
                    <VStack align="start" gap={4}>
                      <Text fontWeight="semibold">Validation Rules</Text>
                      
                      {/* Input Type */}
                      <Field.Root>
                        <Field.Label>Input Type</Field.Label>
                        <Select.Root
                          collection={validationTypeCollection}
                          value={[formData.validationRules.type]}
                          onValueChange={(e) => setFormData(prev => ({
                            ...prev,
                            validationRules: { ...prev.validationRules, type: e.value[0] }
                          }))}
                        >
                          <Select.HiddenSelect />
                          <Select.Control>
                            <Select.Trigger>
                              <Select.ValueText placeholder="Select input type" />
                            </Select.Trigger>
                            <Select.IndicatorGroup>
                              <Select.Indicator />
                            </Select.IndicatorGroup>
                          </Select.Control>
                          <Portal>
                            <Select.Positioner>
                              <Select.Content>
                                {validationTypeCollection.items.map((item) => (
                                  <Select.Item item={item} key={item.value}>
                                    {item.label}
                                    <Select.ItemIndicator />
                                  </Select.Item>
                                ))}
                              </Select.Content>
                            </Select.Positioner>
                          </Portal>
                        </Select.Root>
                      </Field.Root>

                      {/* Min Length */}
                      <Field.Root>
                        <Field.Label>Minimum Length</Field.Label>
                        <Input
                          type="number"
                          value={formData.validationRules.minLength}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            validationRules: { ...prev.validationRules, minLength: parseInt(e.target.value) || 0 }
                          }))}
                          placeholder="0"
                          size="sm"
                        />
                      </Field.Root>

                      {/* Max Length */}
                      <Field.Root>
                        <Field.Label>Maximum Length</Field.Label>
                        <Input
                          type="number"
                          value={formData.validationRules.maxLength}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            validationRules: { ...prev.validationRules, maxLength: parseInt(e.target.value) || 0 }
                          }))}
                          placeholder="0 (no limit)"
                          size="sm"
                        />
                      </Field.Root>

                      {/* Custom Pattern */}
                      <Field.Root>
                        <Field.Label>Custom Pattern (Regex)</Field.Label>
                        <Input
                          value={formData.validationRules.pattern}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            validationRules: { ...prev.validationRules, pattern: e.target.value }
                          }))}
                          placeholder="^[A-Za-z]+$ (optional)"
                          size="sm"
                        />
                        <Field.HelperText>
                          Optional regex pattern for custom validation
                        </Field.HelperText>
                      </Field.Root>

                      {/* Preview */}
                      <Field.Root>
                        <Field.Label>Input Preview</Field.Label>
                        <VStack gap={3} p={4} border="1px solid" borderColor="border.subtle" rounded="md">
                          <Text fontSize="sm" color="fg.muted">
                            Users will see a {formData.questionType === "textarea" ? "text area" : "text input"} field
                          </Text>
                          {formData.questionType === "text" ? (
                            <Input
                              placeholder={`Enter ${formData.validationRules.type}...`}
                              size="sm"
                              disabled
                              type={formData.validationRules.type === "number" ? "number" : "text"}
                            />
                          ) : (
                            <Textarea
                              placeholder="Enter text..."
                              size="sm"
                              disabled
                              rows={3}
                            />
                          )}
                          <Text fontSize="xs" color="fg.muted">
                            Type: {formData.validationRules.type} | 
                            Min: {formData.validationRules.minLength} | 
                            Max: {formData.validationRules.maxLength || "No limit"}
                          </Text>
                        </VStack>
                      </Field.Root>
                    </VStack>
                  )}

                  {/* Active Toggle */}
                  <Field.Root>
                    <HStack justify="space-between">
                      <Field.Label>Active</Field.Label>
                      <Switch.Root
                        checked={formData.isActive}
                        onCheckedChange={(e) => setFormData(prev => ({ ...prev, isActive: e.checked }))}
                      >
                        <Switch.HiddenInput />
                        <Switch.Control />
                        <Switch.Label />
                      </Switch.Root>
                    </HStack>
                  </Field.Root>

                  {/* Options - Only show for options type */}
                  {formData.questionType === "options" && (
                    <VStack align="start" gap={4}>
                      <HStack justify="space-between" w="full">
                        <Text fontWeight="semibold">Options</Text>
                        <Button size="sm" onClick={addOption}>
                          Add Option
                        </Button>
                      </HStack>

                      <Table.Root size="sm" variant="outline">
                        <Table.Header>
                          <Table.Row>
                            <Table.ColumnHeader>#</Table.ColumnHeader>
                            <Table.ColumnHeader>Description</Table.ColumnHeader>
                            <Table.ColumnHeader>Image URL</Table.ColumnHeader>
                            <Table.ColumnHeader>Actions</Table.ColumnHeader>
                          </Table.Row>
                        </Table.Header>
                        <Table.Body>
                          {formData.options.map((option, index) => (
                            <Table.Row key={index}>
                              <Table.Cell fontWeight="medium">{index + 1}</Table.Cell>
                              <Table.Cell>
                                <Input
                                  value={option.description}
                                  onChange={(e) => updateOption(index, "description", e.target.value)}
                                  placeholder="Enter option description..."
                                  size="sm"
                                  required
                                />
                              </Table.Cell>
                              <Table.Cell>
                                <Input
                                  value={option.image}
                                  onChange={(e) => updateOption(index, "image", e.target.value)}
                                  placeholder="https://example.com/image.jpg"
                                  size="sm"
                                />
                              </Table.Cell>
                              <Table.Cell>
                                {formData.options.length > 1 && (
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    colorPalette="red"
                                    onClick={() => removeOption(index)}
                                  >
                                    Remove
                                  </Button>
                                )}
                              </Table.Cell>
                            </Table.Row>
                          ))}
                        </Table.Body>
                      </Table.Root>
                    </VStack>
                  )}

                  {/* Actions */}
                  <HStack gap={4} justify="end">
                    <Button
                      variant="outline"
                      onClick={() => router.push("/admin/question-bank")}
                      disabled={isLoading}
                    >
                      Cancel
                    </Button>
                    
                    {mode === "edit" && (
                      <Button
                        variant="ghost"
                        colorPalette="red"
                        onClick={handleDelete}
                        disabled={isLoading}
                      >
                        Delete
                      </Button>
                    )}
                    
                    <Button
                      type="submit"
                      colorPalette="blue"
                      isLoading={isLoading}
                    >
                      {mode === "create" ? "Create Question" : "Update Question"}
                    </Button>
                  </HStack>
                </VStack>
              </form>
            </VStack>
          </Card.Body>
        </Card.Root>
      </VStack>
    </Box>
  )
} 