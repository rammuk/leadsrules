import { getServerSession } from "next-auth/next"
import { redirect } from "next/navigation"
import { authOptions } from "../../../api/auth/[...nextauth]/route"
import {
  Box,
  VStack,
} from "@chakra-ui/react"
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
        <WebsiteForm mode="create" />
      </VStack>
    </Box>
  )
} 