'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@chakra-ui/react'

export default function BackButton() {
  const router = useRouter()

  const handleBack = () => {
    // Check if there's a previous page in the browser history
    if (window.history.length > 1) {
      router.back()
    } else {
      // Fallback to questionnaires list if no history
      router.push('/admin/questionnaires')
    }
  }

  return (
    <Button
      onClick={handleBack}
      variant="outline"
      size="sm"
    >
      ← Back
    </Button>
  )
} 