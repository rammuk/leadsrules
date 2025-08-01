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
  Switch
} from '@chakra-ui/react'

export default function StepCreationModal({ 
  isOpen, 
  onClose, 
  newStepData, 
  setNewStepData, 
  addStep 
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

            <HStack justify="space-between">
              <Text fontWeight="medium">Leave Behind Strategy</Text>
              <Switch.Root
                checked={newStepData.leaveBehindStrategy || false}
                onCheckedChange={(e) => setNewStepData(prev => ({ ...prev, leaveBehindStrategy: e.checked }))}
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
            <Button variant="outline" onClick={onClose}>
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
  )
} 