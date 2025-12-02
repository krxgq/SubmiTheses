'use client'

import { useRouter } from '@/lib/navigation'
import { Button } from 'flowbite-react'
import { ArrowLeft } from 'lucide-react'

/**
 * Back Button Component
 *
 * Client component that uses browser history to navigate back to previous page.
 * Uses locale-aware router from @/lib/navigation to maintain current locale.
 * Used in the restricted access page to allow users to return where they came from.
 *
 * @param label - Button text (from i18n translations)
 */
export function BackButton({ label }: { label: string }) {
  const router = useRouter()

  return (
    <Button 
      color="gray" 
      onClick={() => router.back()}
      className="bg-interactive-secondary hover:bg-interactive-secondary-hover text-text-primary border-border"
    >
      <ArrowLeft className="mr-2 h-4 w-4" />
      {label}
    </Button>
  )
}
