'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@chakra-ui/react'

export default function DeleteWebsiteButton({ websiteId, websiteName }) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete "${websiteName}"? This action cannot be undone.`)) {
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch(`/api/websites/${websiteId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to delete website')
      }

      // Refresh the page to update the table
      router.refresh()
    } catch (error) {
      alert(`Error deleting website: ${error.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      onClick={handleDelete}
      size="sm"
      variant="outline"
      colorPalette="red"
      isLoading={isLoading}
      loadingText="Deleting..."
    >
      Delete
    </Button>
  )
} 