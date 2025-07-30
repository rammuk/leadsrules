import {
  Box,
  Button,
  Card,
  Checkbox,
  ClientOnly,
  HStack,
  Heading,
  Progress,
  RadioGroup,
  Skeleton,
  VStack,
  Text,
} from "@chakra-ui/react"
import { ColorModeButton } from "../components/ui/color-mode"
import SignOutButton from "../components/ui/sign-out-button"
import SignOutMenu from "../components/ui/sign-out-menu"
import { getServerSession } from "next-auth/next"
import { authOptions } from "./api/auth/[...nextauth]/route"
import Link from "next/link"

export default async function Page() {
  const session = await getServerSession(authOptions)

  return (
    <Box textAlign="center" fontSize="xl" pt="30vh">
      <VStack gap="8">
      
        <Heading size="2xl" letterSpacing="tight">
          Welcome to LeadRules Admin
        </Heading>

        {session ? (
          <Card.Root width="320px">
            <Card.Body>
              <Card.Title>Welcome, {session.user.name}!</Card.Title>
              <Card.Description>
                You are signed in as: {session.user.role}
              </Card.Description>
              {session.user.role === 'admin' && (
                <Button as={Link} href="/admin" mt="4" w="full">
                  Go to Admin Console
                </Button>
              )}
              <HStack gap="2" mt="4">
                <SignOutButton />
              </HStack>
            </Card.Body>
          </Card.Root>
        ) : (
          <Card.Root width="320px">
            <Card.Body>
              <Card.Description>
                    You are not signed in
                  </Card.Description>
                  <Button as={Link} href="/auth/signin" mt="4" w="full">
              Admin Login
            </Button>
              
            </Card.Body>
          </Card.Root>
         
        )}

      </VStack>
      <Box pos="absolute" top="4" right="4">
        <ClientOnly fallback={<Skeleton w="10" h="10" rounded="md" />}>
          <ColorModeButton />
        </ClientOnly>
      </Box>
    </Box>
  )
}