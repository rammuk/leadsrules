import {
  Box,
  Button,
  Card,
  Checkbox,
  ClientOnly,
  HStack,
  Heading,
  Menu,
  Progress,
  RadioGroup,
  Skeleton,
  VStack,
} from "@chakra-ui/react"
import Image from "next/image"
import { ColorModeButton } from "../components/ui/color-mode"

export default async function Page() {
  return (
    <Box textAlign="center" fontSize="xl" pt="30vh">
      <VStack gap="8">
        <Image
          alt="chakra logo"
          src="/static/logo.svg"
          width="80"
          height="80"
        />
        <Heading size="2xl" letterSpacing="tight">
          Welcome to Chakra UI v3 + Next.js (App)
        </Heading>

        <Card.Root width="320px">
          <Card.Body>
            <Card.Title>I am a card</Card.Title>
            <Card.Description>
              This is a simple card component added to the page.
            </Card.Description>
          </Card.Body>
        </Card.Root>

        <Menu.Root>
          <Menu.Trigger asChild>
            <Button variant="outline">Open Menu</Button>
          </Menu.Trigger>
          <Menu.Positioner>
            <Menu.Content>
              <Menu.ItemGroup>
                <Menu.Item>Profile</Menu.Item>
                <Menu.Item>Settings</Menu.Item>
                <Menu.Item>Help</Menu.Item>
              </Menu.ItemGroup>
              <Menu.Separator />
              <Menu.ItemGroup>
                <Menu.Item>Sign out</Menu.Item>
              </Menu.ItemGroup>
            </Menu.Content>
          </Menu.Positioner>
        </Menu.Root>

        <HStack gap="10">
          <Checkbox.Root defaultChecked>
            <Checkbox.HiddenInput />
            <Checkbox.Control>
              <Checkbox.Indicator />
            </Checkbox.Control>
            <Checkbox.Label>Checkbox</Checkbox.Label>
          </Checkbox.Root>

          <RadioGroup.Root display="inline-flex" defaultValue="1">
            <RadioGroup.Item value="1" mr="2">
              <RadioGroup.ItemHiddenInput />
              <RadioGroup.ItemControl>
                <RadioGroup.ItemIndicator />
              </RadioGroup.ItemControl>
              <RadioGroup.ItemText lineHeight="1">Radio</RadioGroup.ItemText>
            </RadioGroup.Item>

            <RadioGroup.Item value="2">
              <RadioGroup.ItemHiddenInput />
              <RadioGroup.ItemControl>
                <RadioGroup.ItemIndicator />
              </RadioGroup.ItemControl>
              <RadioGroup.ItemText lineHeight="1">Radio</RadioGroup.ItemText>
            </RadioGroup.Item>
          </RadioGroup.Root>
        </HStack>

        <Progress.Root width="300px" value={65} striped>
          <Progress.Track>
            <Progress.Range />
          </Progress.Track>
        </Progress.Root>

        <HStack>
          <Button>Let&apos;s go!</Button>
          <Button variant="outline">bun install @chakra-ui/react</Button>
        </HStack>
      </VStack>

      <Box pos="absolute" top="4" right="4">
        <ClientOnly fallback={<Skeleton w="10" h="10" rounded="md" />}>
          <ColorModeButton />
        </ClientOnly>
      </Box>
    </Box>
  )
}