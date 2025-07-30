import { Inter } from "next/font/google"
import "./globals.css"
import Provider from "./provider"
import { getServerSession } from "next-auth/next"
import { authOptions } from "./api/auth/[...nextauth]/route"

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
})

export default async function RootLayout({
  children,
}) {
  const session = await getServerSession(authOptions)

  return (
    <html className={inter.className} suppressHydrationWarning>
      <head />
      <body>
        <Provider session={session}>{children}</Provider>
      </body>
    </html>
  )
}