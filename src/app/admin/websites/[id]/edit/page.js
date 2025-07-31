import { getServerSession } from "next-auth/next"
import { redirect } from "next/navigation"
import { authOptions } from "../../../../api/auth/[...nextauth]/route"
import { prisma } from "../../../../../lib/db"
import {
  Box,
  VStack,
} from "@chakra-ui/react"
import WebsiteForm from "../../../../../components/ui/website-form"

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
    where: { id }
  })

  if (!website) {
    redirect('/admin/websites')
  }

  return (
    <Box minH="100vh" p="8">
      <VStack gap="8" align="stretch">
        <WebsiteForm website={website} mode="edit" />
      </VStack>
    </Box>
  )
} 