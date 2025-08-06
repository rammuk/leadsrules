import { getServerSession } from "next-auth/next"
import { redirect } from "next/navigation"
import { authOptions } from "../../../../api/auth/[...nextauth]/route"
import { prisma } from "../../../../../lib/prisma"
import {
  Box,
  VStack,
  HStack,
  Heading,
  Text,
  Badge,
  Button,
} from "@chakra-ui/react"
import { ColorModeButton } from "../../../../../components/ui/color-mode"
import SignOutButton from "../../../../../components/ui/sign-out-button"
import { ClientOnly, Skeleton } from "@chakra-ui/react"
import WebsiteForm from "../../../../../components/ui/website-form"
import Link from "next/link"

export default async function EditWebsitePage({ params }) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/auth/signin')
  }

  if (session.user.role !== 'admin') {
    redirect('/')
  }

  const { id } = await params

  const website = await prisma.website.findUnique({
    where: { id },
    include: {
      questionnaires: {
        include: {
          steps: {
            include: {
              questions: true
            }
          }
        }
      }
    }
  })

  if (!website) {
    redirect('/admin/websites')
  }

  return (
    <Box minH="100vh" p="8">
      <VStack gap="8" align="stretch">
        {/* Header */}
        <HStack justify="space-between" align="center">
          <Box>
            <Heading size="xl">Edit Website</Heading>
            <Text color="fg.muted">
              Update website information and settings
            </Text>
          </Box>
          <HStack gap="4">
            <Button as={Link} href="/admin/websites" variant="outline">
              Back to Websites
            </Button>
            <Badge colorPalette="green" variant="subtle">
              Admin
            </Badge>
            <ClientOnly fallback={<Skeleton w="10" h="10" rounded="md" />}>
              <ColorModeButton />
            </ClientOnly>
            <SignOutButton />
          </HStack>
        </HStack>

        <WebsiteForm website={website} mode="edit" />
      </VStack>
    </Box>
  )
} 