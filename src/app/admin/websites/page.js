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

export default async function WebsitesPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/auth/signin')
  }

  if (session.user.role !== 'admin') {
    redirect('/')
  }

  // Fetch websites with questionnaire counts
  const websites = await prisma.website.findMany({
    include: {
      _count: {
        select: {
          questionnaires: true
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  })

  return (
    <Box minH="100vh" p="8">
      <VStack gap="8" align="stretch">
        {/* Header */}
        <HStack justify="space-between" align="center">
          <Box>
            <Heading size="xl">Manage Websites</Heading>
            <Text color="fg.muted">
              Create and manage websites for questionnaire deployment
            </Text>
          </Box>
          <HStack gap="4">
            <Button as={Link} href="/admin" variant="outline">
              Back to Dashboard
            </Button>
            <Button as={Link} href="/admin/websites/new" colorPalette="blue">
              Add New Website
            </Button>
            <ClientOnly fallback={<Skeleton w="10" h="10" rounded="md" />}>
              <ColorModeButton />
            </ClientOnly>
            <SignOutButton />
          </HStack>
        </HStack>

        {/* Websites Grid */}
        <Grid templateColumns="repeat(auto-fit, minmax(300px, 1fr))" gap="6">
          {websites.map((website) => (
            <Card.Root key={website.id}>
              <Card.Header>
                <HStack justify="space-between" align="center">
                  <Card.Title>{website.name}</Card.Title>
                  <Badge 
                    colorPalette={website.isActive ? "green" : "gray"} 
                    variant="subtle"
                  >
                    {website.isActive ? "Active" : "Inactive"}
                  </Badge>
                </HStack>
                <Card.Description>
                  Identifier: {website.identifier}
                  {website.phone && (
                    <Text fontSize="sm" color="fg.muted" mt="1">
                      📞 {website.phone}
                    </Text>
                  )}
                </Card.Description>
              </Card.Header>
              <Card.Body>
                <VStack gap="4" align="stretch">
                  <HStack justify="space-between">
                    <Text fontSize="sm" color="fg.muted">Questionnaires</Text>
                    <Text fontWeight="bold">{website._count.questionnaires}</Text>
                  </HStack>
                  <HStack justify="space-between">
                    <Text fontSize="sm" color="fg.muted">Created</Text>
                    <Text fontSize="sm" color="fg.muted">
                      {new Date(website.createdAt).toLocaleDateString()}
                    </Text>
                  </HStack>
                  {website.logo && (
                    <HStack justify="space-between">
                      <Text fontSize="sm" color="fg.muted">Logo</Text>
                      <Text fontSize="sm" color="fg.muted" maxW="150px" overflow="hidden" textOverflow="ellipsis">
                        {website.logo}
                      </Text>
                    </HStack>
                  )}
                  <Button 
                    as={Link} 
                    href={`/admin/websites/${website.id}/edit`}
                    colorPalette="blue" 
                    size="sm"
                    w="full"
                    mt="4"
                  >
                    Edit
                  </Button>
                </VStack>
              </Card.Body>
            </Card.Root>
          ))}
        </Grid>

        {websites.length === 0 && (
          <Card.Root>
            <Card.Body textAlign="center" py="12">
              <VStack gap="4">
                <Text fontSize="lg" color="fg.muted">
                  No websites found
                </Text>
                <Text color="fg.muted">
                  Create your first website to start building questionnaires
                </Text>
                <Button as={Link} href="/admin/websites/new" colorPalette="blue">
                  Create First Website
                </Button>
              </VStack>
            </Card.Body>
          </Card.Root>
        )}
      </VStack>
    </Box>
  )
} 