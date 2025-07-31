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
  Select,
  createListCollection
} from '@chakra-ui/react'

export default function BasicInformation({ 
  formData, 
  setFormData, 
  websites 
}) {
  return (
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
            {websites && (
              <Select.Root
                collection={websites}
                value={formData.websiteId || ''}
                onValueChange={(e) => {
                  console.log('e', e)
                  setFormData(prev => ({ ...prev, websiteId: e.value }))
                }}
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
                      )
                    })}
                  </Select.Content>
                </Select.Positioner>
              </Select.Root>
            )}
          </Box>
          
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
  )
} 