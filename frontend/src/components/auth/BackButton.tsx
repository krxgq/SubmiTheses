'use client'

import { useRouter } from 'next/navigation'
import { Button } from 'flowbite-react'
import { ArrowLeft } from 'lucide-react'

/**
 * Back Button Component
 *
 * Client component that uses browser history to navigate back to previous page.
 * Used in the restricted access page to allow users to return where they came from.
 *
 * @param label - Button text (from i18n translations)
 */
export function BackButton({ label }: { label: string }) {
  const router = useRouter()

  return (
    <Button color="gray" onClick={() => router.back()}>
      <ArrowLeft className="mr-2 h-4 w-4" />
      {label}
    </Button>
  )
}
