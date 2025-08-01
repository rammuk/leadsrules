import { getServerSession } from "next-auth/next"
import { redirect } from "next/navigation"
import { authOptions } from "../../../api/auth/[...nextauth]/route"
import {
  Box,
  VStack,
  HStack,
  Heading,
  Text,
  Badge,
} from "@chakra-ui/react"
import { ColorModeButton } from "../../../../components/ui/color-mode"
import SignOutButton from "../../../../components/ui/sign-out-button"
import { ClientOnly, Skeleton } from "@chakra-ui/react"
import WebsiteForm from "../../../../components/ui/website-form"

export default async function NewWebsitePage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/auth/signin')
  }

  if (session.user.role !== 'admin') {
    redirect('/')
  }

  return (
    <Box minH="100vh" p="8">
      <VStack gap="8" align="stretch">
        {/* Header */}
        <HStack justify="space-between" align="center">
          <Box>
            <Heading size="xl">Create New Website</Heading>
            <Text color="fg.muted">
              Add a new website to deploy questionnaires
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

        <WebsiteForm mode="create" />
      </VStack>
    </Box>
  )
} 