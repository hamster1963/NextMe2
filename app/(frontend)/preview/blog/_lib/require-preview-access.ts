import { notFound } from 'next/navigation'

const PREVIEW_SECRET = process.env.PAYLOAD_SECRET || 'dev-payload-secret'

type PreviewSearchParams = {
  previewSecret?: string | string[]
}

export function requirePreviewAccess(searchParams: PreviewSearchParams) {
  if (!PREVIEW_SECRET) {
    return
  }

  const previewSecret = Array.isArray(searchParams.previewSecret)
    ? searchParams.previewSecret[0]
    : searchParams.previewSecret

  if (previewSecret !== PREVIEW_SECRET) {
    notFound()
  }
}
