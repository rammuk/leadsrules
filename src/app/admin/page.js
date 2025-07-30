import { getServerSession } from "next-auth/next"
import { redirect } from "next/navigation"
import { authOptions } from "../api/auth/[...nextauth]/route"
import { prisma } from "../../lib/db"
import {
  Box,
  Button,
  Card,
  Heading,
  HStack,
  Text,
  VStack,
  Badge,
  Grid,
} from "@chakra-ui/react"
import { ColorModeButton } from "../../components/ui/color-mode"
import SignOutButton from "../../components/ui/sign-out-button"
import { ClientOnly, Skeleton } from "@chakra-ui/react"
import Link from "next/link"

export default async function AdminPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/auth/signin')
  }

  if (session.user.role !== 'admin') {
    redirect('/')
  }

  // Fetch statistics
  const [websitesCount, questionnairesCount, responsesCount] = await Promise.all([
    prisma.website.count(),
    prisma.questionnaire.count(),
    prisma.response.count()
  ])

  return (
    <Box minH="100vh" p="8">
      <VStack gap="8" align="stretch">
        {/* Header */}
        <HStack justify="space-between" align="center">
          <Box>
            <Heading size="xl">Admin Console</Heading>
            <Text color="fg.muted">
              Welcome back, {session.user.name} ({session.user.email})
            </Text>
          </Box>
          <HStack gap="4">
            <Badge colorPalette="green" variant="subtle">
              Admin
            </Badge>
            <ClientOnly fallback={<Skeleton w="10" h="10" rounded="md" />}>
              <ColorModeButton />
            </ClientOnly>
            <SignOutButton />
          </HStack>
        </HStack>

        {/* Stats Grid */}
        <Grid templateColumns="repeat(auto-fit, minmax(250px, 1fr))" gap="6">
          <Card.Root>
            <Card.Body>
              <VStack align="start" gap="2">
                <Text fontSize="sm" color="fg.muted">Total Websites</Text>
                <Text fontSize="2xl" fontWeight="bold">{websitesCount}</Text>
                <Text fontSize="sm" color="fg.muted">Active websites</Text>
              </VStack>
            </Card.Body>
          </Card.Root>

          <Card.Root>
            <Card.Body>
              <VStack align="start" gap="2">
                <Text fontSize="sm" color="fg.muted">Questionnaires</Text>
                <Text fontSize="2xl" fontWeight="bold">{questionnairesCount}</Text>
                <Text fontSize="sm" color="fg.muted">Created questionnaires</Text>
              </VStack>
            </Card.Body>
          </Card.Root>

          <Card.Root>
            <Card.Body>
              <VStack align="start" gap="2">
                <Text fontSize="sm" color="fg.muted">Total Responses</Text>
                <Text fontSize="2xl" fontWeight="bold">{responsesCount}</Text>
                <Text fontSize="sm" color="fg.muted">Collected responses</Text>
              </VStack>
            </Card.Body>
          </Card.Root>

          <Card.Root>
            <Card.Body>
              <VStack align="start" gap="2">
                <Text fontSize="sm" color="fg.muted">System Status</Text>
                <Badge colorPalette="green">Online</Badge>
                <Text fontSize="sm" color="fg.muted">All systems operational</Text>
              </VStack>
            </Card.Body>
          </Card.Root>
        </Grid>

        {/* Quick Actions */}
        <Card.Root>
          <Card.Header>
            <Card.Title>Quick Actions</Card.Title>
            <Card.Description>
              Common administrative tasks
            </Card.Description>
          </Card.Header>
          <Card.Body>
            <HStack gap="4" wrap="wrap">
              <Button as={Link} href="/admin/websites" variant="outline">
                Manage Websites
              </Button>
              <Button as={Link} href="/admin/websites/new" colorPalette="blue">
                Add New Website
              </Button>
              <Button variant="outline">System Settings</Button>
              <Button variant="outline">View Logs</Button>
              <Button variant="outline">Backup Database</Button>
            </HStack>
          </Card.Body>
        </Card.Root>
      </VStack>
    </Box>
  )
} 