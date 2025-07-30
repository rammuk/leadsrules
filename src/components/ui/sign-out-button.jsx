'use client'

import { signOut } from 'next-auth/react'
import { Button } from '@chakra-ui/react'
import { LuLogOut } from 'react-icons/lu'

export default function SignOutButton() {
  const handleSignOut = async () => {
    await signOut({ 
      callbackUrl: '/',
      redirect: true 
    })
  }

  return (
    <Button
      variant="outline"
      colorPalette="red"
      onClick={handleSignOut}
      leftIcon={<LuLogOut />}
    >
      Sign Out
    </Button>
  )
} 