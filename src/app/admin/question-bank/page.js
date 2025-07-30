import { redirect } from "next/navigation"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../../api/auth/[...nextauth]/route"
import { prisma } from "../../../lib/db"
import {
  Box,
  Button,
  Card,
  HStack,
  Heading,
  Link,
  Text,
  VStack,
  Badge,
  Input,
  Textarea,
} from "@chakra-ui/react"
import { ColorModeButton } from "../../../components/ui/color-mode"
import SignOutButton from "../../../components/ui/sign-out-button"
import { ClientOnly, Skeleton } from "@chakra-ui/react"

export default async function QuestionBankPage() {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== "admin") {
    redirect("/auth/signin")
  }

  const questions = await prisma.questionBank.findMany({
    include: {
      options: {
        orderBy: { order: "asc" }
      }
    },
    orderBy: { createdAt: "desc" }
  })

  const getQuestionTypeLabel = (type) => {
    switch (type) {
      case "options":
        return "Multiple Choice"
      case "date":
        return "Date Input"
      case "text":
        return "Text Input"
      case "textarea":
        return "Text Area"
      default:
        return "Unknown"
    }
  }

  const getQuestionTypeColor = (type) => {
    switch (type) {
      case "options":
        return "blue"
      case "date":
        return "green"
      case "text":
        return "purple"
      case "textarea":
        return "orange"
      default:
        return "gray"
    }
  }

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

        {/* Questions List */}
        <VStack gap="4" align="stretch">
          {questions.length === 0 ? (
            <Card.Root>
              <Card.Body>
                <VStack gap="4" py="8">
                  <Text color="fg.muted">No questions found</Text>
                  <Button as={Link} href="/admin/question-bank/new" colorPalette="blue">
                    Create Your First Question
                  </Button>
                </VStack>
              </Card.Body>
            </Card.Root>
          ) : (
            questions.map((question) => (
              <Card.Root key={question.id}>
                <Card.Body>
                  <VStack align="start" gap="3">
                    <HStack justify="space-between" w="full">
                      <VStack align="start" gap="1">
                        <HStack gap="2">
                          <Text fontWeight="semibold" fontSize="lg">
                            {question.question}
                          </Text>
                          <Badge colorPalette={getQuestionTypeColor(question.questionType)}>
                            {getQuestionTypeLabel(question.questionType)}
                          </Badge>
                          {!question.isActive && (
                            <Badge colorPalette="red">Inactive</Badge>
                          )}
                        </HStack>
                        <Text fontSize="sm" color="fg.muted">
                          Created: {new Date(question.createdAt).toLocaleDateString()}
                        </Text>
                      </VStack>
                      <Button
                        as={Link}
                        href={`/admin/question-bank/${question.id}/edit`}
                        size="sm"
                        variant="outline"
                      >
                        Edit
                      </Button>
                    </HStack>

                    {/* Show options for multiple choice questions */}
                    {question.questionType === "options" && question.options.length > 0 && (
                      <Box w="full">
                        <Text fontSize="sm" fontWeight="medium" mb="2">
                          Options:
                        </Text>
                        <VStack align="start" gap="1">
                          {question.options.map((option, index) => (
                            <HStack key={option.id} gap="2">
                              <Text fontSize="sm" color="fg.muted" minW="20px">
                                {index + 1}.
                              </Text>
                              <Text fontSize="sm">{option.description}</Text>
                              {option.image && (
                                <Badge size="sm" colorPalette="blue">Image</Badge>
                              )}
                            </HStack>
                          ))}
                        </VStack>
                      </Box>
                    )}

                    {/* Show preview for date input questions */}
                    {question.questionType === "date" && (
                      <Box w="full">
                        <Text fontSize="sm" fontWeight="medium" mb="2">
                          Preview:
                        </Text>
                        <HStack gap="2" p="3" border="1px solid" borderColor="border.subtle" rounded="md" bg="bg.subtle">
                          <Input placeholder="DD" size="sm" maxLength={2} w="60px" disabled />
                          <Text>/</Text>
                          <Input placeholder="MM" size="sm" maxLength={2} w="60px" disabled />
                          <Text>/</Text>
                          <Input placeholder="YYYY" size="sm" maxLength={4} w="80px" disabled />
                        </HStack>
                      </Box>
                    )}

                    {/* Show preview for text input questions */}
                    {question.questionType === "text" && (
                      <Box w="full">
                        <Text fontSize="sm" fontWeight="medium" mb="2">
                          Preview:
                        </Text>
                        <VStack gap="2" p="3" border="1px solid" borderColor="border.subtle" rounded="md" bg="bg.subtle">
                          <Input 
                            placeholder={`Enter ${question.validationRules?.type || 'text'}...`} 
                            disabled 
                            type={question.validationRules?.type === "number" ? "number" : "text"}
                          />
                                                     {question.validationRules && (
                             <Text fontSize="xs" color="fg.muted">
                               Type: {question.validationRules.type} | 
                               Min: {question.validationRules.minLength} | 
                               Max: {question.validationRules.maxLength || "No limit"}
                               {question.validationRules.pattern && ` | Pattern: ${question.validationRules.pattern}`}
                             </Text>
                           )}
                        </VStack>
                      </Box>
                    )}

                    {/* Show preview for textarea questions */}
                    {question.questionType === "textarea" && (
                      <Box w="full">
                        <Text fontSize="sm" fontWeight="medium" mb="2">
                          Preview:
                        </Text>
                        <VStack gap="2" p="3" border="1px solid" borderColor="border.subtle" rounded="md" bg="bg.subtle">
                          <Textarea placeholder="Enter your answer..." disabled rows={3} />
                          {question.validationRules && (
                            <Text fontSize="xs" color="fg.muted">
                              Min: {question.validationRules.minLength} | 
                              Max: {question.validationRules.maxLength || "No limit"}
                              {question.validationRules.pattern && ` | Pattern: ${question.validationRules.pattern}`}
                            </Text>
                          )}
                        </VStack>
                      </Box>
                    )}
                  </VStack>
                </Card.Body>
              </Card.Root>
            ))
          )}
        </VStack>
      </VStack>
    </Box>
  )
} 