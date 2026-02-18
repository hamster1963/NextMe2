import { unstable_cache } from 'next/cache'

export type SiteSettings = {
  siteName: string
  siteUrl: string
  description: string
  locale: string
  dateLocale: string
  timeZone: string
  profileName: string
  profileTagline: string
  introLines: string[]
  profileAvatar?: string
  profileAvatarAlt: string
  navHomeLabel: string
  navBlogLabel: string
  blogTechLabel: string
  blogTechDescription: string
  blogInsideLabel: string
  blogInsideDescription: string
  blogDailyLabel: string
  blogDailyDescription: string
  footerShowOnHome: boolean
  footerBuiltWithText: string
  footerPrimaryLinkLabel: string
  footerPrimaryLinkUrl: string
  footerSecondaryLinkLabel: string
  footerSecondaryLinkUrl: string
  footerOwnerLabel: string
  footerOwnerUrl: string
  footerCopyrightStartYear: number
}

const DEFAULT_SITE_NAME = 'Hamster1963'
const DEFAULT_SITE_DESCRIPTION = 'Developer, writer, and creator.'
const DEFAULT_SITE_LOCALE = 'en_US'
const DEFAULT_DATE_LOCALE = 'en-US'
const DEFAULT_TIME_ZONE = 'Asia/Shanghai'
const DEFAULT_PROFILE_NAME = 'Hamster1963'
const DEFAULT_PROFILE_TAGLINE = 'Developer and amateur guitarist.'
const DEFAULT_PROFILE_AVATAR_ALT = 'Hamster1963 avatar'
const DEFAULT_INTRO_LINES: string[] = []
const DEFAULT_NAV_HOME_LABEL = 'Home'
const DEFAULT_NAV_BLOG_LABEL = 'Blog'
const DEFAULT_BLOG_TECH_LABEL = 'Blog'
const DEFAULT_BLOG_TECH_DESCRIPTION = 'A collection of posts.'
const DEFAULT_BLOG_INSIDE_LABEL = 'Inside'
const DEFAULT_BLOG_INSIDE_DESCRIPTION = 'Personal reflections and notes.'
const DEFAULT_BLOG_DAILY_LABEL = 'Daily'
const DEFAULT_BLOG_DAILY_DESCRIPTION = 'Random thoughts and quick notes.'
const DEFAULT_FOOTER_SHOW_ON_HOME = true
const DEFAULT_FOOTER_BUILT_WITH_TEXT = 'Built with'
const DEFAULT_FOOTER_PRIMARY_LINK_LABEL = 'Next.js'
const DEFAULT_FOOTER_PRIMARY_LINK_URL = 'https://nextjs.org'
const DEFAULT_FOOTER_SECONDARY_LINK_LABEL = 'NextMe'
const DEFAULT_FOOTER_SECONDARY_LINK_URL =
  'https://github.com/hamster1963/NextMe'
const DEFAULT_FOOTER_OWNER_LABEL = '@Hamster1963'
const DEFAULT_FOOTER_OWNER_URL = 'https://github.com/hamster1963'
const DEFAULT_FOOTER_COPYRIGHT_START_YEAR = 2021
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

function normalizeText(value: unknown, fallback: string) {
  if (typeof value !== 'string') {
    return fallback
  }

  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : fallback
}

function normalizeDateLocale(value: unknown, fallback: string) {
  const locale = normalizeText(value, fallback)

  try {
    // Validate locale support without changing behavior.
    new Intl.DateTimeFormat(locale)
    return locale
  } catch {
    return fallback
  }
}

function normalizeTimeZone(value: unknown, fallback: string) {
  const timeZone = normalizeText(value, fallback)

  try {
    // Validate IANA timezone id.
    new Intl.DateTimeFormat('en-US', { timeZone })
    return timeZone
  } catch {
    return fallback
  }
}

function normalizeNumber(value: unknown, fallback: number) {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return fallback
  }

  const normalized = Math.trunc(value)
  if (normalized < 1970 || normalized > 2100) {
    return fallback
  }

  return normalized
}

function normalizeBoolean(value: unknown, fallback: boolean) {
  if (typeof value === 'boolean') {
    return value
  }

  return fallback
}

function normalizeIntroLines(value: unknown) {
  if (!Array.isArray(value)) {
    return DEFAULT_INTRO_LINES
  }

  const lines = value
    .map((item) => {
      if (!item || typeof item !== 'object') {
        return ''
      }

      const maybeText = (item as { text?: unknown }).text
      if (typeof maybeText !== 'string') {
        return ''
      }

      return maybeText.trim()
    })
    .filter((line): line is string => line.length > 0)

  return lines.length > 0 ? lines : DEFAULT_INTRO_LINES
}

function resolveMediaUrl(value: unknown): string | undefined {
  if (!value) {
    return undefined
  }

  if (typeof value === 'string') {
    if (
      value.startsWith('/') ||
      value.startsWith('http://') ||
      value.startsWith('https://')
    ) {
      return value
    }

    return undefined
  }

  if (typeof value === 'object') {
    const maybeUrl = (value as { url?: unknown }).url
    if (typeof maybeUrl === 'string' && maybeUrl.length > 0) {
      return maybeUrl
    }
  }

  return undefined
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

async function fetchSiteSettings(): Promise<SiteSettings> {
  const defaults: SiteSettings = {
    siteName: DEFAULT_SITE_NAME,
    siteUrl: normalizeSiteUrl(),
    description: DEFAULT_SITE_DESCRIPTION,
    locale: DEFAULT_SITE_LOCALE,
    dateLocale: DEFAULT_DATE_LOCALE,
    timeZone: DEFAULT_TIME_ZONE,
    profileName: DEFAULT_PROFILE_NAME,
    profileTagline: DEFAULT_PROFILE_TAGLINE,
    introLines: DEFAULT_INTRO_LINES,
    profileAvatar: undefined,
    profileAvatarAlt: DEFAULT_PROFILE_AVATAR_ALT,
    navHomeLabel: DEFAULT_NAV_HOME_LABEL,
    navBlogLabel: DEFAULT_NAV_BLOG_LABEL,
    blogTechLabel: DEFAULT_BLOG_TECH_LABEL,
    blogTechDescription: DEFAULT_BLOG_TECH_DESCRIPTION,
    blogInsideLabel: DEFAULT_BLOG_INSIDE_LABEL,
    blogInsideDescription: DEFAULT_BLOG_INSIDE_DESCRIPTION,
    blogDailyLabel: DEFAULT_BLOG_DAILY_LABEL,
    blogDailyDescription: DEFAULT_BLOG_DAILY_DESCRIPTION,
    footerShowOnHome: DEFAULT_FOOTER_SHOW_ON_HOME,
    footerBuiltWithText: DEFAULT_FOOTER_BUILT_WITH_TEXT,
    footerPrimaryLinkLabel: DEFAULT_FOOTER_PRIMARY_LINK_LABEL,
    footerPrimaryLinkUrl: DEFAULT_FOOTER_PRIMARY_LINK_URL,
    footerSecondaryLinkLabel: DEFAULT_FOOTER_SECONDARY_LINK_LABEL,
    footerSecondaryLinkUrl: DEFAULT_FOOTER_SECONDARY_LINK_URL,
    footerOwnerLabel: DEFAULT_FOOTER_OWNER_LABEL,
    footerOwnerUrl: DEFAULT_FOOTER_OWNER_URL,
    footerCopyrightStartYear: DEFAULT_FOOTER_COPYRIGHT_START_YEAR,
  }

  const [{ getPayload }, { default: config }] = await Promise.all([
    import('payload'),
    import('@payload-config'),
  ])
  const payload = await getPayload({ config })

  try {
    const globalData = await payload.findGlobal({
      slug: 'site-settings',
      depth: 1,
    })

    const siteName = normalizeText(globalData?.siteName, defaults.siteName)
    const description = normalizeText(
      globalData?.description,
      defaults.description
    )
    const locale = normalizeText(globalData?.locale, defaults.locale)
    const dateLocale = normalizeDateLocale(
      globalData?.dateLocale,
      defaults.dateLocale
    )
    const timeZone = normalizeTimeZone(globalData?.timeZone, defaults.timeZone)
    const profileName = normalizeText(
      globalData?.profileName,
      defaults.profileName
    )
    const profileTagline = normalizeText(
      globalData?.profileTagline,
      defaults.profileTagline
    )
    const introLines = normalizeIntroLines(globalData?.introLines)
    const profileAvatar = resolveMediaUrl(globalData?.profileAvatar)
    const profileAvatarAlt = normalizeText(
      globalData?.profileAvatarAlt,
      defaults.profileAvatarAlt
    )
    const navHomeLabel = normalizeText(
      globalData?.navHomeLabel,
      defaults.navHomeLabel
    )
    const navBlogLabel = normalizeText(
      globalData?.navBlogLabel,
      defaults.navBlogLabel
    )
    const blogTechLabel = normalizeText(
      globalData?.blogTechLabel,
      defaults.blogTechLabel
    )
    const blogTechDescription = normalizeText(
      globalData?.blogTechDescription,
      defaults.blogTechDescription
    )
    const blogInsideLabel = normalizeText(
      globalData?.blogInsideLabel,
      defaults.blogInsideLabel
    )
    const blogInsideDescription = normalizeText(
      globalData?.blogInsideDescription,
      defaults.blogInsideDescription
    )
    const blogDailyLabel = normalizeText(
      globalData?.blogDailyLabel,
      defaults.blogDailyLabel
    )
    const blogDailyDescription = normalizeText(
      globalData?.blogDailyDescription,
      defaults.blogDailyDescription
    )
    const footerShowOnHome = normalizeBoolean(
      globalData?.footerShowOnHome,
      defaults.footerShowOnHome
    )
    const footerBuiltWithText = normalizeText(
      globalData?.footerBuiltWithText,
      defaults.footerBuiltWithText
    )
    const footerPrimaryLinkLabel = normalizeText(
      globalData?.footerPrimaryLinkLabel,
      defaults.footerPrimaryLinkLabel
    )
    const footerPrimaryLinkUrl = normalizeText(
      globalData?.footerPrimaryLinkUrl,
      defaults.footerPrimaryLinkUrl
    )
    const footerSecondaryLinkLabel = normalizeText(
      globalData?.footerSecondaryLinkLabel,
      defaults.footerSecondaryLinkLabel
    )
    const footerSecondaryLinkUrl = normalizeText(
      globalData?.footerSecondaryLinkUrl,
      defaults.footerSecondaryLinkUrl
    )
    const footerOwnerLabel = normalizeText(
      globalData?.footerOwnerLabel,
      defaults.footerOwnerLabel
    )
    const footerOwnerUrl = normalizeText(
      globalData?.footerOwnerUrl,
      defaults.footerOwnerUrl
    )
    const footerCopyrightStartYear = normalizeNumber(
      globalData?.footerCopyrightStartYear,
      defaults.footerCopyrightStartYear
    )

    return {
      siteName,
      siteUrl: normalizeSiteUrl(globalData?.siteUrl),
      description,
      locale,
      dateLocale,
      timeZone,
      profileName,
      profileTagline,
      introLines,
      profileAvatar,
      profileAvatarAlt,
      navHomeLabel,
      navBlogLabel,
      blogTechLabel,
      blogTechDescription,
      blogInsideLabel,
      blogInsideDescription,
      blogDailyLabel,
      blogDailyDescription,
      footerShowOnHome,
      footerBuiltWithText,
      footerPrimaryLinkLabel,
      footerPrimaryLinkUrl,
      footerSecondaryLinkLabel,
      footerSecondaryLinkUrl,
      footerOwnerLabel,
      footerOwnerUrl,
      footerCopyrightStartYear,
    }
  } catch (error) {
    if (isMissingSQLiteTableError(error)) {
      return defaults
    }
    throw error
  }
}

const getCachedSiteSettings = unstable_cache(
  fetchSiteSettings,
  ['site-settings'],
  {
    tags: ['site-settings'],
    revalidate: 300,
  }
)

export async function getSiteSettings(): Promise<SiteSettings> {
  return getCachedSiteSettings()
}
