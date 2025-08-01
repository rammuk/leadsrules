import { prisma } from '@/lib/prisma'
import QuestionnaireForm from '@/components/ui/questionnaire-form'
import {
  Box,
  VStack,
  HStack,
  Heading,
  Text,
  Badge,
  Button,
} from "@chakra-ui/react"
import { ColorModeButton } from '@/components/ui/color-mode'
import SignOutButton from '@/components/ui/sign-out-button'
import { ClientOnly, Skeleton } from "@chakra-ui/react"
import Link from "next/link"
import BackButton from '@/components/ui/BackButton'

export default async function EditQuestionnairePage({ params }) {
  const { id } = await params

  const questionnaire = await prisma.questionnaire.findUnique({
    where: { id },
    include: {
      website: true,
      steps: {
        include: {
          questions: {
            include: {
              options: {
                orderBy: { order: 'asc' }
              }
            },
            orderBy: { order: 'asc' }
          }
        },
        orderBy: { order: 'asc' }
      }
    }
  })

  if (!questionnaire) {
    return <div>Questionnaire not found</div>
  }

  return (
    <Box minH="100vh" p="8">
      <VStack gap="8" align="stretch">
        {/* Header */}
        <HStack justify="space-between" align="center">
          <Box>
            <Heading size="xl">Edit Questionnaire</Heading>
            <Text color="fg.muted">
              Update questionnaire settings and steps
            </Text>
          </Box>
          <HStack gap="4">
            <BackButton />
            <Badge colorPalette="green" variant="subtle">
              Admin
            </Badge>
            <ClientOnly fallback={<Skeleton w="10" h="10" rounded="md" />}>
              <ColorModeButton />
            </ClientOnly>
            <SignOutButton />
          </HStack>
        </HStack>

        <QuestionnaireForm mode="edit" questionnaire={questionnaire} />
      </VStack>
    </Box>
  )
} 