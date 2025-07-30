"use client"

import { ChakraProvider, defaultSystem } from "@chakra-ui/react"
import { ThemeProvider } from "next-themes"
import { SessionProvider } from 'next-auth/react'

export default function RootLayout(props) {
  return (
    <SessionProvider session={props.session}>
      <ChakraProvider value={defaultSystem}>
        <ThemeProvider attribute="class" disableTransitionOnChange>
          {props.children}
        </ThemeProvider>
      </ChakraProvider>
    </SessionProvider>
  )
}