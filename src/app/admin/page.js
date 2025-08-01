
import { getServerSession } from "next-auth/next"
import { redirect } from "next/navigation"
import { authOptions } from "../api/auth/[...nextauth]/route"
import { prisma } from "../../lib/prisma"
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
  Table,
} from "@chakra-ui/react"
import { ColorModeButton } from "../../components/ui/color-mode"
import SignOutButton from "../../components/ui/sign-out-button"
import DeleteWebsiteButton from "../../components/ui/DeleteWebsiteButton"
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

  // Fetch statistics and websites
  const [websitesCount, questionnairesCount, responsesCount, questionsCount, websites] = await Promise.all([
    prisma.website.count(),
    prisma.questionnaire.count(),
    prisma.response.count(),
    prisma.questionBank.count(),
    prisma.website.findMany({
      include: {
        _count: {
          select: {
            questionnaires: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })
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
                <Text fontSize="sm" color="fg.muted">Question Bank</Text>
                <Text fontSize="2xl" fontWeight="bold">{questionsCount}</Text>
                <Text fontSize="sm" color="fg.muted">Available questions</Text>
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
              <Button as={Link} href="/admin/questionnaires" variant="outline">
                Manage Questionnaires
              </Button>
              <Button as={Link} href="/admin/questionnaires/new" colorPalette="blue">
                Create Questionnaire
              </Button>
              <Button as={Link} href="/admin/question-bank" variant="outline">
                Question Bank
              </Button>
              <Button as={Link} href="/admin/question-bank/new" colorPalette="blue">
                Add Question
              </Button>
              <Button variant="outline">System Settings</Button>
              <Button variant="outline">View Logs</Button>
            </HStack>
          </Card.Body>
        </Card.Root>

        {/* Websites Table */}
        <Card.Root>
          <Card.Header>
            <Card.Title>Recent Websites</Card.Title>
            <Card.Description>
              Quick access to manage your websites
            </Card.Description>
          </Card.Header>
          <Card.Body>
            {websites.length > 0 ? (
              <Table.Root>
                <Table.Header>
                  <Table.Row>
                    <Table.ColumnHeader>Name</Table.ColumnHeader>
                    <Table.ColumnHeader>Identifier</Table.ColumnHeader>
                    <Table.ColumnHeader>Phone</Table.ColumnHeader>
                    <Table.ColumnHeader>Questionnaires</Table.ColumnHeader>
                    <Table.ColumnHeader>Status</Table.ColumnHeader>
                    <Table.ColumnHeader>Actions</Table.ColumnHeader>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {websites.map((website) => (
                    <Table.Row key={website.id}>
                      <Table.Cell>
                        <Text fontWeight="medium">{website.name}</Text>
                      </Table.Cell>
                      <Table.Cell>
                        <Text fontSize="sm" color="fg.muted">{website.identifier}</Text>
                      </Table.Cell>
                      <Table.Cell>
                        <Text fontSize="sm" color="fg.muted">
                          {website.phone || '-'}
                        </Text>
                      </Table.Cell>
                      <Table.Cell>
                        <Badge colorPalette="blue" variant="subtle">
                          {website._count.questionnaires}
                        </Badge>
                      </Table.Cell>
                      <Table.Cell>
                        <Badge 
                          colorPalette={website.isActive ? "green" : "gray"} 
                          variant="subtle"
                        >
                          {website.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </Table.Cell>
                      <Table.Cell>
                        <HStack gap="2">
                          <Button
                            as={Link}
                            href={`/public?website=${website.identifier}`}
                            size="sm"
                            variant="outline"
                            colorPalette="green"
                            target="_blank"
                          >
                            View
                          </Button>
                          <Button
                            as={Link}
                            href={`/admin/websites/${website.id}/edit`}
                            size="sm"
                            variant="outline"
                            colorPalette="blue"
                          >
                            Edit
                          </Button>
                          <DeleteWebsiteButton 
                            websiteId={website.id} 
                            websiteName={website.name} 
                          />
                        </HStack>
                      </Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table.Root>
            ) : (
              <VStack gap="4" py="8">
                <Text color="fg.muted">No websites found</Text>
                <Button as={Link} href="/admin/websites/new" colorPalette="blue">
                  Create First Website
                </Button>
              </VStack>
            )}
          </Card.Body>
        </Card.Root>
      </VStack>
    </Box>
  )
} 