import { redirect } from "next/navigation"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../../api/auth/[...nextauth]/route"
import { prisma } from "../../../lib/db"
import {
  Box,
  Button,
  Card,
  Container,
  Grid,
  Heading,
  HStack,
  Link,
  Stack,
  Text,
  VStack,
  Badge,
} from "@chakra-ui/react"
import { ColorModeButton } from "../../../components/ui/color-mode"
import SignOutButton from "../../../components/ui/sign-out-button"
import { ClientOnly, Skeleton } from "@chakra-ui/react"

export default async function QuestionBankPage() {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== "admin") {
    redirect("/auth/signin")
  }

  // Fetch questions with their options
  const questions = await prisma.questionBank.findMany({
    include: {
      options: {
        orderBy: { order: "asc" }
      }
    },
    orderBy: { createdAt: "desc" }
  })

  return (
    <Box minH="100vh" p="8">
      <VStack gap="8" align="stretch">
        {/* Header */}
        <HStack justify="space-between" align="center">
          <Box>
            <Heading size="xl">Question Bank</Heading>
            <Text color="fg.muted">
              Manage reusable questions for questionnaires
            </Text>
          </Box>
          <HStack gap="4">
            <Button as={Link} href="/admin" variant="outline">
              Back to Dashboard
            </Button>
            <Button as={Link} href="/admin/question-bank/new" colorPalette="blue">
              Add New Question
            </Button>
            <ClientOnly fallback={<Skeleton w="10" h="10" rounded="md" />}>
              <ColorModeButton />
            </ClientOnly>
            <SignOutButton />
          </HStack>
        </HStack>

        {/* Questions Grid */}
        <Grid templateColumns="repeat(auto-fill, minmax(400px, 1fr))" gap={6}>
          {questions.map((question) => (
            <Card.Root key={question.id}>
              <Card.Body>
                <VStack align="start" gap={4}>
                  <VStack align="start" gap={2} w="full">
                    <HStack justify="space-between" w="full">
                      <Text fontWeight="semibold" fontSize="lg">
                        {question.question}
                      </Text>
                      <Badge
                        colorPalette={question.isActive ? "green" : "gray"}
                        variant="subtle"
                      >
                        {question.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </HStack>
                    
                    <HStack gap={4}>
                      <Badge variant="outline">
                        {question.displayType}
                      </Badge>
                      <Badge variant="outline">
                        {question.isMultiSelect ? "Multi-select" : "Single-select"}
                      </Badge>
                    </HStack>
                  </VStack>

                  <VStack align="start" gap={2} w="full">
                    <Text fontSize="sm" color="fg.muted">
                      Options ({question.options.length}):
                    </Text>
                    <VStack align="start" gap={1} w="full">
                      {question.options.map((option, index) => (
                        <Text key={option.id} fontSize="sm">
                          {index + 1}. {option.description}
                          {option.image && (
                            <Text as="span" color="fg.muted">
                              {" "}(with image)
                            </Text>
                          )}
                        </Text>
                      ))}
                    </VStack>
                  </VStack>

                  <HStack gap={2} w="full" justify="end">
                    <Button
                      as={Link}
                      href={`/admin/question-bank/${question.id}/edit`}
                      size="sm"
                      variant="outline"
                    >
                      Edit
                    </Button>
                  </HStack>
                </VStack>
              </Card.Body>
            </Card.Root>
          ))}
        </Grid>

        {questions.length === 0 && (
          <Card.Root>
            <Card.Body>
              <VStack gap={4} py={8}>
                <Text color="fg.muted">No questions found</Text>
                <Button as={Link} href="/admin/question-bank/new" colorPalette="blue">
                  Add Your First Question
                </Button>
              </VStack>
            </Card.Body>
          </Card.Root>
        )}
      </VStack>
    </Box>
  )
} 