import type { CollectionConfig } from 'payload'

const PREVIEW_SECRET = process.env.PAYLOAD_SECRET || 'dev-payload-secret'

const CATEGORY_PATH_MAP: Record<string, string> = {
  tech: 'tech',
  inside: 'inside',
  daily: 'daily',
}

type PostPreviewData = {
  category?: unknown
  slug?: unknown
}

function normalizeSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/&/g, '-and-')
    .replace(/--+/g, '-')
}

function resolvePreviewPath(data?: PostPreviewData | null) {
  if (!data || typeof data.slug !== 'string' || data.slug.length === 0) {
    return null
  }

  const normalizedCategory =
    typeof data.category === 'string' ? data.category.toLowerCase() : 'tech'
  const categoryPath = CATEGORY_PATH_MAP[normalizedCategory] || 'tech'

  const params = new URLSearchParams()
  if (PREVIEW_SECRET) {
    params.set('previewSecret', PREVIEW_SECRET)
  }

  const encodedSlug = encodeURIComponent(data.slug)
  const query = params.size > 0 ? `?${params.toString()}` : ''

  return `/preview/blog/${categoryPath}/${encodedSlug}${query}`
}

export const Posts: CollectionConfig = {
  slug: 'posts',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'category', 'publishedAt', 'updatedAt'],
    livePreview: {
      url: ({ data }) => resolvePreviewPath(data as PostPreviewData),
    },
    preview: (data) => resolvePreviewPath(data as PostPreviewData),
  },
  versions: {
    drafts: {
      autosave: {
        interval: 500,
      },
    },
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      hooks: {
        beforeValidate: [
          ({ value, data }) => {
            if (typeof value === 'string' && value.length > 0) {
              return normalizeSlug(value)
            }

            if (typeof data?.title === 'string' && data.title.length > 0) {
              return normalizeSlug(data.title)
            }

            return value
          },
        ],
      },
    },
    {
      name: 'category',
      type: 'select',
      required: true,
      defaultValue: 'Tech',
      options: [
        {
          label: 'Tech',
          value: 'Tech',
        },
        {
          label: 'Inside',
          value: 'Inside',
        },
        {
          label: 'Daily',
          value: 'Daily',
        },
      ],
    },
    {
      name: 'summary',
      type: 'textarea',
      required: true,
    },
    {
      name: 'content',
      type: 'textarea',
      required: true,
      admin: {
        rows: 24,
        description: 'Support Markdown / MDX string content.',
      },
    },
    {
      name: 'publishedAt',
      type: 'date',
      required: true,
      defaultValue: () => new Date().toISOString(),
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'rssImage',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'ai',
      type: 'textarea',
    },
  ],
}
