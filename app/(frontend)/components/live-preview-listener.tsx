'use client'

import { RefreshRouteOnSave } from '@payloadcms/live-preview-react'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function LivePreviewListener() {
  const router = useRouter()
  const pathname = usePathname()
  const [serverURL, setServerURL] = useState<string | null>(null)
  const isPreviewRoute = pathname.startsWith('/preview/')

  useEffect(() => {
    setServerURL(window.location.origin)
  }, [])

  if (!serverURL || !isPreviewRoute) {
    return null
  }

  return <RefreshRouteOnSave refresh={router.refresh} serverURL={serverURL} />
}
