export type SiteSettings = {
  siteName: string
  siteUrl: string
  description: string
  locale: string
}

const DEFAULT_SITE_NAME = 'Hamster1963'
const DEFAULT_SITE_DESCRIPTION = 'Developer, writer, and creator.'
const DEFAULT_SITE_LOCALE = 'en_US'
const DEFAULT_SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  process.env.SITE_URL ||
  'http://localhost:3052'

function isMissingSQLiteTableError(error: unknown): boolean {
  if (!error || typeof error !== 'object') {
    return false
  }

  const maybeError = error as { message?: unknown; cause?: unknown }
  if (
    typeof maybeError.message === 'string' &&
    maybeError.message.includes('no such table')
  ) {
    return true
  }

  return isMissingSQLiteTableError(maybeError.cause)
}

function normalizeSiteUrl(value?: string) {
  const raw = typeof value === 'string' ? value.trim() : ''
  const candidate = raw.length > 0 ? raw : DEFAULT_SITE_URL
  const withProtocol =
    /^https?:\/\//i.test(candidate) ||
    candidate.startsWith('http://') ||
    candidate.startsWith('https://')
      ? candidate
      : candidate.startsWith('localhost') || candidate.startsWith('127.0.0.1')
        ? `http://${candidate}`
        : `https://${candidate}`

  try {
    const url = new URL(withProtocol)
    const normalizedPath = url.pathname.replace(/\/+$/, '')
    return `${url.origin}${normalizedPath}`
  } catch {
    return DEFAULT_SITE_URL
  }
}

function isAbsoluteUrl(value: string) {
  return value.startsWith('http://') || value.startsWith('https://')
}

export function toAbsoluteUrl(path: string, siteUrl: string) {
  if (isAbsoluteUrl(path)) {
    return path
  }

  const base = siteUrl.replace(/\/+$/, '')
  if (path.startsWith('/')) {
    return `${base}${path}`
  }

  return `${base}/${path}`
}

type OgImageArgs = {
  image?: string
  siteUrl: string
  title?: string
}

export function getOgImageUrl({ image, siteUrl, title }: OgImageArgs) {
  if (!image) {
    return toAbsoluteUrl(
      `/og?title=${encodeURIComponent(title || '')}`,
      siteUrl
    )
  }

  return toAbsoluteUrl(image, siteUrl)
}

export async function getSiteSettings(): Promise<SiteSettings> {
  const defaults: SiteSettings = {
    siteName: DEFAULT_SITE_NAME,
    siteUrl: normalizeSiteUrl(),
    description: DEFAULT_SITE_DESCRIPTION,
    locale: DEFAULT_SITE_LOCALE,
  }

  const [{ getPayload }, { default: config }] = await Promise.all([
    import('payload'),
    import('@payload-config'),
  ])
  const payload = await getPayload({ config })

  try {
    const globalData = await payload.findGlobal({
      slug: 'site-settings',
      depth: 0,
    })

    const siteName =
      typeof globalData?.siteName === 'string' && globalData.siteName.length > 0
        ? globalData.siteName
        : defaults.siteName

    const description =
      typeof globalData?.description === 'string' &&
      globalData.description.length > 0
        ? globalData.description
        : defaults.description

    const locale =
      typeof globalData?.locale === 'string' && globalData.locale.length > 0
        ? globalData.locale
        : defaults.locale

    return {
      siteName,
      siteUrl: normalizeSiteUrl(globalData?.siteUrl),
      description,
      locale,
    }
  } catch (error) {
    if (isMissingSQLiteTableError(error)) {
      return defaults
    }
    throw error
  }
}
