import type { GlobalConfig } from 'payload'
import { authenticated } from '../access/authenticated.ts'
import { revalidateSiteSettings } from '../hooks/revalidateSiteSettings.ts'

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
    update: authenticated,
  },
  hooks: {
    afterChange: [revalidateSiteSettings],
  },
  fields: [
    {
      name: 'siteName',
      type: 'text',
      required: true,
      defaultValue: 'Hamster1963',
    },
    {
      name: 'profileName',
      type: 'text',
      required: true,
      defaultValue: 'Hamster1963',
      admin: {
        description: 'Displayed on the homepage and blog author section.',
      },
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
      name: 'profileTagline',
      type: 'text',
      defaultValue: 'Developer and amateur guitarist.',
    },
    {
      name: 'introLines',
      type: 'array',
      labels: {
        singular: 'Intro line',
        plural: 'Intro lines',
      },
      defaultValue: [
        {
          text: "👋 Hi, I'm Hamster.",
        },
        {
          text: 'I enjoy writing code and sharing ideas.',
        },
        {
          text: 'I share posts about technology and random thoughts here.',
        },
      ],
      fields: [
        {
          name: 'text',
          type: 'text',
          required: true,
        },
      ],
    },
    {
      name: 'profileAvatar',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description: 'Avatar shown on homepage and post author info.',
      },
    },
    {
      name: 'profileAvatarAlt',
      type: 'text',
      defaultValue: 'Hamster1963 avatar',
    },
    {
      name: 'locale',
      type: 'text',
      defaultValue: 'en_US',
      admin: {
        description: 'Open Graph locale, for example en_US.',
      },
    },
    {
      name: 'dateLocale',
      type: 'text',
      defaultValue: 'en-US',
      admin: {
        description:
          'Date display locale, for example en-US, zh-CN, ja-JP, de-DE.',
      },
    },
    {
      name: 'timeZone',
      type: 'text',
      defaultValue: 'Asia/Shanghai',
      admin: {
        description:
          'IANA timezone used for date rendering, for example Asia/Shanghai.',
      },
    },
    {
      name: 'navHomeLabel',
      type: 'text',
      defaultValue: 'Home',
    },
    {
      name: 'navBlogLabel',
      type: 'text',
      defaultValue: 'Blog',
    },
    {
      name: 'blogTechLabel',
      type: 'text',
      defaultValue: 'Blog',
    },
    {
      name: 'blogTechDescription',
      type: 'textarea',
      defaultValue: 'A collection of posts.',
    },
    {
      name: 'blogInsideLabel',
      type: 'text',
      defaultValue: 'Inside',
    },
    {
      name: 'blogInsideDescription',
      type: 'textarea',
      defaultValue: 'Personal reflections and notes.',
    },
    {
      name: 'blogDailyLabel',
      type: 'text',
      defaultValue: 'Daily',
    },
    {
      name: 'blogDailyDescription',
      type: 'textarea',
      defaultValue: 'Random thoughts and quick notes.',
    },
    {
      name: 'footerShowOnHome',
      type: 'checkbox',
      defaultValue: true,
    },
    {
      name: 'footerBuiltWithText',
      type: 'text',
      defaultValue: 'Built with',
    },
    {
      name: 'footerPrimaryLinkLabel',
      type: 'text',
      defaultValue: 'Next.js',
    },
    {
      name: 'footerPrimaryLinkUrl',
      type: 'text',
      defaultValue: 'https://nextjs.org',
    },
    {
      name: 'footerSecondaryLinkLabel',
      type: 'text',
      defaultValue: 'NextMe',
    },
    {
      name: 'footerSecondaryLinkUrl',
      type: 'text',
      defaultValue: 'https://github.com/hamster1963/NextMe',
    },
    {
      name: 'footerOwnerLabel',
      type: 'text',
      defaultValue: '@Hamster1963',
    },
    {
      name: 'footerOwnerUrl',
      type: 'text',
      defaultValue: 'https://github.com/hamster1963',
    },
    {
      name: 'footerCopyrightStartYear',
      type: 'number',
      defaultValue: 2021,
      validate: (value) => {
        if (typeof value !== 'number') {
          return 'Please provide a valid start year'
        }

        if (!Number.isInteger(value)) {
          return 'Start year must be an integer'
        }

        if (value < 1970 || value > 2100) {
          return 'Start year must be between 1970 and 2100'
        }

        return true
      },
    },
  ],
}
