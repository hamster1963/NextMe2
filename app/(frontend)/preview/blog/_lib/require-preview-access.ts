import { notFound } from 'next/navigation'

const PREVIEW_SECRET = process.env.PAYLOAD_SECRET || 'dev-payload-secret'

type PreviewSearchParams = {
  [key: string]: string | string[] | undefined
  previewSecret?: string | string[]
  previewDocId?: string | string[]
  previewTitle?: string | string[]
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

export function getPreviewDocId(searchParams: PreviewSearchParams) {
  return firstValue(searchParams.previewDocId)
}

export function getPreviewTitle(searchParams: PreviewSearchParams) {
  return firstValue(searchParams.previewTitle)
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
  const previewDocId = getPreviewDocId(searchParams)
  const previewTitle = getPreviewTitle(searchParams)

  if (previewSecret) {
    params.set('previewSecret', previewSecret)
  }
  if (previewDocId) {
    params.set('previewDocId', previewDocId)
  }
  if (previewTitle) {
    params.set('previewTitle', previewTitle)
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
