import { notFound } from 'next/navigation'

const PREVIEW_SECRET = process.env.PAYLOAD_SECRET || 'dev-payload-secret'

type PreviewSearchParams = {
  [key: string]: string | string[] | undefined
  previewSecret?: string | string[]
}

function firstValue(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) {
    return value[0]
  }

  return value
}

export function getPreviewSecret(searchParams: PreviewSearchParams) {
  return firstValue(searchParams.previewSecret)
}

export function buildLockedPreviewPath({
  section,
  slug,
  searchParams,
}: {
  section: 'tech' | 'inside' | 'daily'
  slug: string
  searchParams: PreviewSearchParams
}) {
  const params = new URLSearchParams()
  const previewSecret = getPreviewSecret(searchParams)

  if (previewSecret) {
    params.set('previewSecret', previewSecret)
  }

  params.set('previewLocked', '1')

  return `/preview/blog/${section}/${encodeURIComponent(slug)}?${params.toString()}`
}

export function requirePreviewAccess(searchParams: PreviewSearchParams) {
  if (!PREVIEW_SECRET) {
    return
  }

  const previewSecret = getPreviewSecret(searchParams)

  if (previewSecret !== PREVIEW_SECRET) {
    notFound()
  }
}
