import {
  BlocksFeature,
  FixedToolbarFeature,
  HeadingFeature,
  HorizontalRuleFeature,
  InlineCodeFeature,
  InlineToolbarFeature,
  UploadFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'
import type { CollectionConfig } from 'payload'
import { authenticated } from '../access/authenticated.ts'
import { authenticatedOrPublished } from '../access/authenticatedOrPublished.ts'
import { BannerBlock } from '../blocks/BannerBlock.ts'
import { CodeBlock } from '../blocks/CodeBlock.ts'
import { MediaBlock } from '../blocks/MediaBlock.ts'
import {
  revalidateDeletePost,
  revalidatePost,
} from '../hooks/revalidatePost.ts'

const PREVIEW_SECRET = process.env.PAYLOAD_SECRET || 'dev-payload-secret'

const CATEGORY_PATH_MAP: Record<string, string> = {
  tech: 'tech',
  inside: 'inside',
  daily: 'daily',
}

type PostPreviewData = {
  id?: unknown
  category?: unknown
  slug?: unknown
}

function getPreviewDocId(data?: PostPreviewData | null) {
  if (!data) {
    return undefined
  }

  if (typeof data.id === 'number') {
    return data.id.toString()
  }

  if (typeof data.id === 'string' && data.id.trim().length > 0) {
    return data.id.trim()
  }

  return undefined
}

function getPreviewSlug(data?: PostPreviewData | null) {
  if (!data) {
    return undefined
  }

  if (typeof data.slug === 'string' && data.slug.trim().length > 0) {
    return data.slug.trim()
  }

  return getPreviewDocId(data)
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
  const normalizedCategory =
    typeof data?.category === 'string' ? data.category.toLowerCase() : 'tech'
  const categoryPath = CATEGORY_PATH_MAP[normalizedCategory] || 'tech'
  const previewSlug = getPreviewSlug(data)
  const previewDocId = getPreviewDocId(data)

  const params = new URLSearchParams()
  if (PREVIEW_SECRET) {
    params.set('previewSecret', PREVIEW_SECRET)
  }
  params.set('previewLocked', '1')
  if (previewDocId) {
    params.set('previewDocId', previewDocId)
  }

  const query = params.size > 0 ? `?${params.toString()}` : ''

  if (!previewSlug) {
    return `/preview/blog/pending${query}`
  }

  const encodedSlug = encodeURIComponent(previewSlug)

  return `/preview/blog/${categoryPath}/${encodedSlug}${query}`
}

export const Posts: CollectionConfig = {
  slug: 'posts',
  access: {
    create: authenticated,
    delete: authenticated,
    read: authenticatedOrPublished,
    update: authenticated,
  },
  defaultPopulate: {
    title: true,
    slug: true,
    category: true,
    summary: true,
    publishedAt: true,
    image: true,
    meta: {
      title: true,
      description: true,
      image: true,
    },
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: [
      'title',
      'category',
      '_status',
      'publishedAt',
      'updatedAt',
    ],
    livePreview: {
      url: ({ data }) => resolvePreviewPath(data as PostPreviewData),
    },
    preview: (data) => resolvePreviewPath(data as PostPreviewData),
  },
  versions: {
    drafts: {
      autosave: {
        interval: 200,
      },
      schedulePublish: true,
    },
    maxPerDoc: 50,
  },
  hooks: {
    afterChange: [revalidatePost],
    afterDelete: [revalidateDeletePost],
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
      type: 'tabs',
      tabs: [
        {
          label: 'Content',
          fields: [
            {
              name: 'summary',
              type: 'textarea',
              required: true,
            },
            {
              name: 'image',
              type: 'upload',
              relationTo: 'media',
            },
            {
              name: 'content',
              type: 'richText',
              required: true,
              label: false,
              admin: {
                description:
                  'Use the toolbar to insert headings, code blocks, banners, and images.',
              },
              editor: lexicalEditor({
                features: ({ rootFeatures }) => {
                  return [
                    ...rootFeatures,
                    HeadingFeature({
                      enabledHeadingSizes: ['h1', 'h2', 'h3', 'h4'],
                    }),
                    InlineCodeFeature(),
                    BlocksFeature({
                      blocks: [BannerBlock, CodeBlock, MediaBlock],
                    }),
                    UploadFeature({ enabledCollections: ['media'] }),
                    HorizontalRuleFeature(),
                    FixedToolbarFeature(),
                    InlineToolbarFeature(),
                  ]
                },
              }),
            },
          ],
        },
        {
          label: 'Meta',
          fields: [
            {
              name: 'category',
              type: 'select',
              label: 'Section',
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
              name: 'categories',
              type: 'relationship',
              relationTo: 'categories',
              hasMany: true,
            },
            {
              name: 'relatedPosts',
              type: 'relationship',
              relationTo: 'posts',
              hasMany: true,
              filterOptions: ({ id }) => {
                return {
                  id: {
                    not_in: [id],
                  },
                }
              },
            },
            {
              name: 'publishedAt',
              type: 'date',
              required: true,
              defaultValue: () => new Date().toISOString(),
              admin: {
                date: {
                  pickerAppearance: 'dayAndTime',
                },
              },
              hooks: {
                beforeChange: [
                  ({ siblingData, value }) => {
                    if (siblingData._status === 'published' && !value) {
                      return new Date()
                    }
                    return value
                  },
                ],
              },
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
        },
        {
          label: 'SEO',
          fields: [
            {
              name: 'meta',
              type: 'group',
              fields: [
                {
                  name: 'title',
                  type: 'text',
                  admin: {
                    description: 'Optional SEO title (defaults to post title).',
                  },
                },
                {
                  name: 'description',
                  type: 'textarea',
                  admin: {
                    description:
                      'Optional SEO description (defaults to post summary).',
                  },
                },
                {
                  name: 'image',
                  type: 'upload',
                  relationTo: 'media',
                  admin: {
                    description:
                      'Optional SEO image (defaults to post cover image).',
                  },
                },
              ],
            },
          ],
        },
      ],
    },
  ],
}
