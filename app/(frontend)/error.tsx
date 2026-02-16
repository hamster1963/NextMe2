'use client'

import { useEffect } from 'react'

export default function ErrorPage({
  error,
}: { error: Error; reset: () => void }) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center">
      <p className="font-semibold text-sm">
        Something went wrong. Try refreshing the page.
      </p>
    </div>
  )
}
