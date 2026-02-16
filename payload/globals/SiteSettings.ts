import type { GlobalConfig } from 'payload'

const DEFAULT_SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  process.env.SITE_URL ||
  'http://localhost:3052'

function normalizeSiteUrl(value: string) {
  const trimmed = value.trim()
  if (!trimmed) {
    return DEFAULT_SITE_URL
  }

  const withProtocol =
    /^https?:\/\//i.test(trimmed) ||
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://')
      ? trimmed
      : trimmed.startsWith('localhost') || trimmed.startsWith('127.0.0.1')
        ? `http://${trimmed}`
        : `https://${trimmed}`

  const url = new URL(withProtocol)
  const normalizedPath = url.pathname.replace(/\/+$/, '')
  return `${url.origin}${normalizedPath}`
}

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  label: 'Site Settings',
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'siteName',
      type: 'text',
      required: true,
      defaultValue: 'Hamster1963',
    },
    {
      name: 'siteUrl',
      type: 'text',
      required: true,
      defaultValue: DEFAULT_SITE_URL,
      admin: {
        description:
          'Site URL for SEO, for example https://example.com (without trailing slash).',
      },
      hooks: {
        beforeValidate: [
          ({ value }) => {
            if (typeof value !== 'string') {
              return value
            }

            try {
              return normalizeSiteUrl(value)
            } catch {
              return value
            }
          },
        ],
      },
      validate: (value) => {
        if (typeof value !== 'string' || value.trim().length === 0) {
          return 'Please provide the site URL'
        }

        try {
          const normalized = normalizeSiteUrl(value)
          const parsed = new URL(normalized)
          if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
            return 'Site URL must start with http or https'
          }
          return true
        } catch {
          return 'Please enter a valid site URL, for example https://example.com'
        }
      },
    },
    {
      name: 'description',
      type: 'textarea',
      defaultValue: 'Developer, writer, and creator.',
    },
    {
      name: 'locale',
      type: 'text',
      defaultValue: 'en_US',
    },
  ],
}
