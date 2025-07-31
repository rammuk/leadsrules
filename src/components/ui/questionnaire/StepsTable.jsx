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
  IconButton,
  Table
} from '@chakra-ui/react'
import { LuPlus, LuTrash2 } from 'react-icons/lu'

export default function StepsTable({ 
  formData, 
  openStepModal, 
  openViewStepModal, 
  removeStep 
}) {
  return (
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
  )
} 