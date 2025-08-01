import QuestionnaireForm from '@/components/ui/questionnaire-form'
import {
  Box,
  VStack,
  HStack,
  Heading,
  Text,
  Badge,
} from "@chakra-ui/react"
import { ColorModeButton } from '@/components/ui/color-mode'
import SignOutButton from '@/components/ui/sign-out-button'
import { ClientOnly, Skeleton } from "@chakra-ui/react"
import BackButton from '@/components/ui/BackButton'

export default async function NewQuestionnairePage({ searchParams }) {
  const params = await searchParams
  const websiteId = params?.websiteId
  
  return (
    <Box minH="100vh" p="8">
      <VStack gap="8" align="stretch">
        {/* Header */}
        <HStack justify="space-between" align="center">
          <Box>
            <Heading size="xl">Create New Questionnaire</Heading>
            <Text color="fg.muted">
              Build a new questionnaire with steps and questions
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

        <QuestionnaireForm mode="create" websiteId={websiteId} />
      </VStack>
    </Box>
  )
} 