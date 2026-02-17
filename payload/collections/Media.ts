import path from 'node:path'
import {
  FixedToolbarFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'
import { revalidatePath, revalidateTag } from 'next/cache'
import type { CollectionConfig, PayloadRequest } from 'payload'
import { anyone } from '../access/anyone.ts'
import { authenticated } from '../access/authenticated.ts'

const DEFAULT_UPLOAD_DIR =
  process.env.PAYLOAD_UPLOAD_DIR || path.resolve(process.cwd(), 'data/media')

function resolveRelationID(value: unknown): string | undefined {
  if (!value) {
    return undefined
  }

  if (typeof value === 'string' || typeof value === 'number') {
    return value.toString()
  }

  if (typeof value === 'object') {
    const maybeID = (value as { id?: unknown }).id
    if (typeof maybeID === 'string' || typeof maybeID === 'number') {
      return maybeID.toString()
    }
  }

  return undefined
}

function containsMediaReference(
  value: unknown,
  mediaID: string,
  seen = new Set<unknown>()
): boolean {
  if (!value || typeof value !== 'object') {
    return false
  }

  if (seen.has(value)) {
    return false
  }
  seen.add(value)

  if (Array.isArray(value)) {
    return value.some((item) => containsMediaReference(item, mediaID, seen))
  }

  const node = value as Record<string, unknown>

  if (node.type === 'block') {
    const fields =
      typeof node.fields === 'object' && node.fields
        ? (node.fields as Record<string, unknown>)
        : undefined

    if (fields?.blockType === 'mediaBlock') {
      const referencedID = resolveRelationID(fields.media)
      if (referencedID === mediaID) {
        return true
      }
    }
  }

  if (node.blockType === 'mediaBlock') {
    const referencedID = resolveRelationID(node.media)
    if (referencedID === mediaID) {
      return true
    }
  }

  if (node.type === 'upload') {
    const relationTo =
      typeof node.relationTo === 'string'
        ? node.relationTo
        : typeof (node.value as { relationTo?: unknown })?.relationTo ===
            'string'
          ? (node.value as { relationTo?: string }).relationTo
          : undefined

    if (relationTo === 'media') {
      const referencedID = resolveRelationID(node.value)
      if (referencedID === mediaID) {
        return true
      }
    }
  }

  return Object.values(node).some((item) =>
    containsMediaReference(item, mediaID, seen)
  )
}

async function isReferencedInRichContent(
  req: PayloadRequest,
  mediaID: string
): Promise<boolean> {
  let page = 1

  while (true) {
    const posts = await req.payload.find({
      collection: 'posts',
      depth: 0,
      draft: true,
      limit: 100,
      page,
    })

    for (const post of posts.docs || []) {
      if (
        containsMediaReference(
          (post as { content?: unknown; contentRich?: unknown }).content ||
            (post as { content?: unknown; contentRich?: unknown }).contentRich,
          mediaID
        )
      ) {
        return true
      }
    }

    if (!posts.hasNextPage) {
      return false
    }

    page += 1
  }
}

function revalidateMediaDependentRoutes(): void {
  revalidatePath('/', 'layout')
  revalidatePath('/')
  revalidatePath('/blog')
  revalidatePath('/blog/inside')
  revalidatePath('/blog/daily')
  revalidatePath('/sitemap.xml')
  revalidateTag('blog-posts')
  revalidateTag('site-settings')
}

export const Media: CollectionConfig = {
  slug: 'media',
  folders: true,
  access: {
    create: authenticated,
    delete: authenticated,
    read: anyone,
    update: authenticated,
  },
  hooks: {
    afterChange: [
      ({ doc }) => {
        revalidateMediaDependentRoutes()
        return doc
      },
    ],
    afterDelete: [
      ({ doc }) => {
        revalidateMediaDependentRoutes()
        return doc
      },
    ],
    beforeDelete: [
      async ({ id, req }) => {
        if (!id) {
          return
        }

        const mediaID = id.toString()
        const directRefs = await req.payload.find({
          collection: 'posts',
          depth: 0,
          draft: true,
          limit: 1,
          where: {
            or: [
              { image: { equals: id } },
              { rssImage: { equals: id } },
              { 'meta.image': { equals: id } },
            ],
          },
        })

        if ((directRefs.docs || []).length > 0) {
          throw new Error(
            'This media is used by at least one post image or SEO image. Remove those references first.'
          )
        }

        if (await isReferencedInRichContent(req, mediaID)) {
          throw new Error(
            'This media is used inside post content. Remove embedded references first.'
          )
        }

        const siteSettings = await req.payload.findGlobal({
          slug: 'site-settings',
          depth: 0,
        })
        const profileAvatarID = resolveRelationID(
          (siteSettings as { profileAvatar?: unknown }).profileAvatar
        )

        if (profileAvatarID === mediaID) {
          throw new Error(
            'This media is used as the site profile avatar. Please change the avatar first.'
          )
        }
      },
    ],
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
    },
    {
      name: 'caption',
      type: 'richText',
      editor: lexicalEditor({
        features: ({ rootFeatures }) => {
          return [
            ...rootFeatures,
            FixedToolbarFeature(),
            InlineToolbarFeature(),
          ]
        },
      }),
    },
  ],
  upload: {
    staticDir: DEFAULT_UPLOAD_DIR,
    staticURL: '/media',
    adminThumbnail: 'thumbnail',
    focalPoint: true,
    mimeTypes: ['image/*'],
    imageSizes: [
      {
        name: 'thumbnail',
        width: 320,
      },
      {
        name: 'small',
        width: 640,
      },
      {
        name: 'medium',
        width: 960,
      },
      {
        name: 'large',
        width: 1440,
      },
      {
        name: 'og',
        width: 1200,
        height: 630,
        crop: 'center',
      },
    ],
  },
}
