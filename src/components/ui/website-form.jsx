'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Box,
  Button,
  Card,
  Field,
  Heading,
  HStack,
  Input,
  Text,
  VStack,
  Badge,
  Checkbox,
} from "@chakra-ui/react"
import Link from "next/link"

export default function WebsiteForm({ website = null, mode = 'create' }) {
  const [name, setName] = useState(website?.name || '')
  const [identifier, setIdentifier] = useState(website?.identifier || '')
  const [isActive, setIsActive] = useState(website?.isActive ?? true)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const url = mode === 'create' ? '/api/websites' : `/api/websites/${website.id}`
      const method = mode === 'create' ? 'POST' : 'PUT'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          identifier,
          isActive
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to save website')
      }

      router.push('/admin/websites')
    } catch (error) {
      setError(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this website? This action cannot be undone.')) {
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const response = await fetch(`/api/websites/${website.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to delete website')
      }

      router.push('/admin/websites')
    } catch (error) {
      setError(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Box maxW="2xl" mx="auto">
      <Card.Root>
        <Card.Header>
          <Card.Title>
            {mode === 'create' ? 'Create New Website' : 'Edit Website'}
          </Card.Title>
          <Card.Description>
            {mode === 'create' 
              ? 'Add a new website to deploy questionnaires' 
              : 'Update website information'
            }
          </Card.Description>
        </Card.Header>
        <Card.Body>
          <form onSubmit={handleSubmit}>
            <VStack gap="6">
              <Field.Root>
                <Field.Label>Website Name</Field.Label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter website name"
                  required
                />
              </Field.Root>

              <Field.Root>
                <Field.Label>Unique Identifier</Field.Label>
                <Input
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="Enter unique identifier (e.g., my-website)"
                  required
                />
                <Text fontSize="sm" color="fg.muted" mt="2">
                  This identifier will be used by frontend websites to connect to this system
                </Text>
              </Field.Root>

              <Field.Root>
                <Checkbox.Root
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                >
                  <Checkbox.HiddenInput />
                  <Checkbox.Control>
                    <Checkbox.Indicator />
                  </Checkbox.Control>
                  <Checkbox.Label>Active</Checkbox.Label>
                </Checkbox.Root>
                <Text fontSize="sm" color="fg.muted" mt="2">
                  Inactive websites cannot receive questionnaires
                </Text>
              </Field.Root>

              {error && (
                <Text color="red.500" fontSize="sm">
                  {error}
                </Text>
              )}

              <HStack gap="4" w="full">
                <Button
                  type="submit"
                  isLoading={isLoading}
                  loadingText={mode === 'create' ? 'Creating...' : 'Saving...'}
                  colorPalette="blue"
                  flex="1"
                >
                  {mode === 'create' ? 'Create Website' : 'Save Changes'}
                </Button>
                <Button
                  as={Link}
                  href="/admin/websites"
                  variant="outline"
                  flex="1"
                >
                  Cancel
                </Button>
                {mode === 'edit' && (
                  <Button
                    onClick={handleDelete}
                    isLoading={isLoading}
                    loadingText="Deleting..."
                    colorPalette="red"
                    variant="outline"
                  >
                    Delete
                  </Button>
                )}
              </HStack>
            </VStack>
          </form>
        </Card.Body>
      </Card.Root>
    </Box>
  )
} 