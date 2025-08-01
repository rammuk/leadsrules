'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Box,
  Button,
  Card,
  Field,
  Grid,
  GridItem,
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
  const questionnaire = website?.questionnaires?.[0] || null
  const [name, setName] = useState(website?.name || '')
  const [identifier, setIdentifier] = useState(website?.identifier || '')
  const [phone, setPhone] = useState(website?.phone || '')
  const [logo, setLogo] = useState(website?.logo || '')
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
          phone,
          logo,
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

  const renderFormFields = () => (
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
        <Field.Label>Phone Number</Field.Label>
        <Input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="Enter phone number (e.g., +1-555-123-4567)"
          type="tel"
        />
        <Text fontSize="sm" color="fg.muted" mt="2">
          Optional: Contact phone number for the website
        </Text>
      </Field.Root>

      <Field.Root>
        <Field.Label>Logo URL</Field.Label>
        <Input
          value={logo}
          onChange={(e) => setLogo(e.target.value)}
          placeholder="Enter logo URL (e.g., https://example.com/logo.png)"
          type="url"
        />
        <Text fontSize="sm" color="fg.muted" mt="2">
          Optional: URL to the website logo image
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
  )

  const renderQuestionnaireCard = () => (
    <Card.Root>
      <Card.Header>
        <Card.Title>Questionnaire</Card.Title>
        <Card.Description>
          Manage the questionnaire for this website
        </Card.Description>
      </Card.Header>
      <Card.Body>
        {questionnaire ? (
          <VStack gap="4" align="stretch">
            <HStack justify="space-between">
              <Text fontWeight="medium">Title</Text>
              <Text>{questionnaire.title}</Text>
            </HStack>
            
            {questionnaire.description && (
              <HStack justify="space-between">
                <Text fontWeight="medium">Description</Text>
                <Text>{questionnaire.description}</Text>
              </HStack>
            )}

            <HStack justify="space-between">
              <Text fontWeight="medium">Steps</Text>
              <Badge colorPalette="blue" variant="subtle">
                {questionnaire.steps?.length || 0}
              </Badge>
            </HStack>

            <HStack justify="space-between">
              <Text fontWeight="medium">Status</Text>
              <Badge 
                colorPalette={questionnaire.isActive ? "green" : "gray"} 
                variant="subtle"
              >
                {questionnaire.isActive ? "Active" : "Inactive"}
              </Badge>
            </HStack>

            <HStack gap="2" mt="4">
              <Button
                as={Link}
                href={`/admin/questionnaires/${questionnaire.id}/edit`}
                colorPalette="blue"
                size="sm"
                flex="1"
              >
                Edit Questionnaire
              </Button>
              <Button
                as={Link}
                href={`/public?website=${website.identifier}`}
                target="_blank"
                variant="outline"
                size="sm"
                flex="1"
              >
                View Public
              </Button>
            </HStack>
          </VStack>
        ) : (
          <VStack gap="4" align="stretch">
            <Text color="fg.muted" textAlign="center">
              No questionnaire attached to this website
            </Text>
            <Button
              as={Link}
              href={`/admin/questionnaires/new?websiteId=${website.id}`}
              colorPalette="blue"
              w="full"
            >
              Create Questionnaire
            </Button>
          </VStack>
        )}
      </Card.Body>
    </Card.Root>
  )

  return (
    <Box maxW={mode === 'edit' ? "6xl" : "2xl"} mx="auto">
      {mode === 'edit' ? (
        <Grid templateColumns="1fr 1fr" gap="8">
          {/* Website Details Card */}
          <Card.Root>
            <Card.Header>
              <Card.Title>Website Details</Card.Title>
              <Card.Description>
                Update website information and settings
              </Card.Description>
            </Card.Header>
            <Card.Body>
              <form onSubmit={handleSubmit}>
                {renderFormFields()}
              </form>
            </Card.Body>
          </Card.Root>

          {/* Questionnaire Card */}
          {renderQuestionnaireCard()}
        </Grid>
      ) : (
        <Card.Root>
          <Card.Header>
            <Card.Title>Create New Website</Card.Title>
            <Card.Description>
              Add a new website to deploy questionnaires
            </Card.Description>
          </Card.Header>
          <Card.Body>
            <form onSubmit={handleSubmit}>
              {renderFormFields()}
            </form>
          </Card.Body>
        </Card.Root>
      )}
    </Box>
  )
} 