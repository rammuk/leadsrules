import { getServerSession } from "next-auth/next"
import { redirect } from "next/navigation"
import { authOptions } from "../../api/auth/[...nextauth]/route"
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
import { ColorModeButton } from "../../../components/ui/color-mode"
import SignOutButton from "../../../components/ui/sign-out-button"
import { ClientOnly, Skeleton } from "@chakra-ui/react"
import Link from "next/link"
import { prisma } from "../../../lib/prisma"

export default async function QuestionnairesPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/auth/signin')
  }

  if (session.user.role !== 'admin') {
    redirect('/')
  }

  // Fetch questionnaires with nested data
  const questionnaires = await prisma.questionnaire.findMany({
    include: {
      website: true,
      steps: {
        include: {
          questions: {
            include: {
              options: {
                orderBy: {
                  order: 'asc'
                }
              }
            },
            orderBy: {
              order: 'asc'
            }
          }
        },
        orderBy: {
          order: 'asc'
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  })

  const getQuestionnaireStats = (questionnaire) => {
    const totalSteps = questionnaire.steps.length
    const totalQuestions = questionnaire.steps.reduce((sum, step) => 
      sum + step.questions.length, 0
    )
    const activeSteps = questionnaire.steps.filter(step => step.isActive).length
    const activeQuestions = questionnaire.steps.reduce((sum, step) => 
      sum + step.questions.filter(q => q.isActive).length, 0
    )

    return { totalSteps, totalQuestions, activeSteps, activeQuestions }
  }

  return (
    <Box minH="100vh" p="8">
      <VStack gap="8" align="stretch">
        {/* Header */}
        <HStack justify="space-between" align="center">
          <Box>
            <Heading size="xl">Manage Questionnaires</Heading>
            <Text color="fg.muted">
              Create and manage questionnaires for your websites
            </Text>
          </Box>
          <HStack gap="4">
            <Button as={Link} href="/admin" variant="outline">
              Back to Dashboard
            </Button>
            <Button as={Link} href="/admin/questionnaires/new" colorPalette="blue">
              Create Questionnaire
            </Button>
            <ClientOnly fallback={<Skeleton w="10" h="10" rounded="md" />}>
              <ColorModeButton />
            </ClientOnly>
            <SignOutButton />
          </HStack>
        </HStack>

        {/* Questionnaires Grid */}
        <Grid templateColumns="repeat(auto-fit, minmax(300px, 1fr))" gap="6">
          {questionnaires.map((questionnaire) => {
            const stats = getQuestionnaireStats(questionnaire)
            return (
              <Card.Root key={questionnaire.id}>
                <Card.Header>
                  <HStack justify="space-between" align="center">
                    <Card.Title>{questionnaire.title}</Card.Title>
                    <Badge 
                      colorPalette={questionnaire.isActive ? "green" : "gray"} 
                      variant="subtle"
                    >
                      {questionnaire.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </HStack>
                  <Card.Description>
                    Website: {questionnaire.website.name}
                  </Card.Description>
                </Card.Header>
                <Card.Body>
                  <VStack gap="4" align="stretch">
                    <HStack justify="space-between">
                      <Text fontSize="sm" color="fg.muted">Steps</Text>
                      <Text fontWeight="bold">{stats.totalSteps} / {stats.activeSteps} active</Text>
                    </HStack>
                    <HStack justify="space-between">
                      <Text fontSize="sm" color="fg.muted">Questions</Text>
                      <Text fontWeight="bold">{stats.totalQuestions} / {stats.activeQuestions} active</Text>
                    </HStack>
                    <HStack justify="space-between">
                      <Text fontSize="sm" color="fg.muted">Created</Text>
                      <Text fontSize="sm" color="fg.muted">
                        {new Date(questionnaire.createdAt).toLocaleDateString()}
                      </Text>
                    </HStack>
                    <HStack gap="2" justify="flex-end">
                      <Button 
                        as={Link} 
                        href={`/admin/questionnaires/${questionnaire.id}/edit`}
                        size="sm" 
                        variant="outline"
                      >
                        Edit
                      </Button>
                      <Button 
                        as={Link} 
                        href={`/admin/questionnaires/${questionnaire.id}`}
                        size="sm" 
                        variant="outline"
                      >
                        View
                      </Button>
                      <Button 
                        as={Link}
                        href={`/admin/questionnaires/${questionnaire.id}/delete`}
                        size="sm" 
                        variant="outline"
                        colorPalette="red"
                      >
                        Delete
                      </Button>
                    </HStack>
                  </VStack>
                </Card.Body>
              </Card.Root>
            )
          })}
        </Grid>
      </VStack>
    </Box>
  )
} 