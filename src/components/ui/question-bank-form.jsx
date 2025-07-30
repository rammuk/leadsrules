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
    displayType: "list",
    isMultiSelect: false,
    isActive: true,
    options: [{ description: "", image: "" }]
  })

  // Create collection for display type options
  const displayTypeCollection = createListCollection({
    items: [
      { label: "List", value: "list" },
      { label: "Cards", value: "cards" },
    ],
  })

  useEffect(() => {
    if (mode === "edit" && question) {
      setFormData({
        question: question.question,
        displayType: question.displayType,
        isMultiSelect: question.isMultiSelect,
        isActive: question.isActive,
        options: question.options.map(opt => ({
          description: opt.description,
          image: opt.image || ""
        }))
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
          displayType: formData.displayType,
          isMultiSelect: formData.isMultiSelect,
          options: formData.options.filter(opt => opt.description.trim())
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

                  {/* Display Type */}
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

                  {/* Multi-select Toggle */}
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

                  {/* Options */}
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