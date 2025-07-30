'use client'

import { useState } from 'react'
import { signIn, getSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import {
  Box,
  Button,
  Card,
  Field,
  Heading,
  Input,
  Text,
  VStack,
} from "@chakra-ui/react"

export default function SignIn() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError('Invalid email or password')
      } else {
        router.push('/admin')
        router.refresh()
      }
    } catch (error) {
      setError('An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Box minH="100vh" display="flex" alignItems="center" justifyContent="center" p="4">
      <Card.Root maxW="sm" w="full">
        <Card.Header textAlign="center">
          <Card.Title>Admin Login</Card.Title>
          <Card.Description>
            Enter your credentials to access the admin console
          </Card.Description>
        </Card.Header>
        <Card.Body>
          <form onSubmit={handleSubmit}>
            <VStack gap="4">
              <Field.Root>
                <Field.Label>Email</Field.Label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@leadsrules.com"
                  required
                />
              </Field.Root>
              
              <Field.Root>
                <Field.Label>Password</Field.Label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                />
              </Field.Root>

              {error && (
                <Text color="red.500" fontSize="sm">
                  {error}
                </Text>
              )}

              <Button
                type="submit"
                isLoading={isLoading}
                loadingText="Signing in..."
                w="full"
              >
                Sign In
              </Button>
            </VStack>
          </form>
        </Card.Body>
      </Card.Root>
    </Box>
  )
} 