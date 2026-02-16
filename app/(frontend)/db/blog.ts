export type BlogMetadata = {
  title: string
  publishedAt: string
  updatedAt?: string
  summary: string
  image?: string
  category: string
  ai?: string
  rssImage?: string
}

export type BlogPost = {
  metadata: BlogMetadata
  slug: string
  tweetIds: string[]
  content: string
}

const DEFAULT_COLLECTION = 'posts'
const DEFAULT_PAGE_SIZE = 100
const DEFAULT_DEPTH = 2
const CATEGORY_MAP = {
  tech: 'Tech',
  inside: 'Inside',
  daily: 'Daily',
} as const

function extractTweetIds(content: string) {
  const tweetMatches = content.match(/<StaticTweet\sid="[0-9]+"\s\/>/g)
  return (
    tweetMatches
      ?.map((tweet: string) => {
        const match = tweet.match(/[0-9]+/g)
        return match ? match[0] : null
      })
      .filter((id): id is string => id !== null) || []
  )
}

function normalizeCategory(rawCategory: unknown) {
  if (typeof rawCategory !== 'string') {
    return 'Tech'
  }

  const normalized = rawCategory.trim().toLowerCase()
  return CATEGORY_MAP[normalized] || rawCategory
}

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

function resolveImageFromPayload(payloadDoc: Record<string, any>) {
  const possibleImageField =
    payloadDoc.image ||
    payloadDoc.coverImage ||
    payloadDoc.cover ||
    payloadDoc.heroImage

  if (!possibleImageField) {
    return undefined
  }

  if (typeof possibleImageField === 'string') {
    return possibleImageField
  }

  if (typeof possibleImageField === 'object') {
    const maybeUrl = possibleImageField.url || possibleImageField.filename
    if (typeof maybeUrl === 'string') {
      return maybeUrl
    }
  }

  return undefined
}

function resolveContentFromPayload(payloadDoc: Record<string, any>) {
  const contentCandidates = [
    payloadDoc.content,
    payloadDoc.body,
    payloadDoc.markdown,
    payloadDoc.mdx,
    payloadDoc.contentMarkdown,
    payloadDoc.contentMdx,
  ]

  const validContent = contentCandidates.find(
    (item) => typeof item === 'string'
  )

  if (typeof validContent === 'string') {
    return validContent
  }

  return ''
}

function toBlogPostFromPayload(payloadDoc: Record<string, any>) {
  const slug =
    typeof payloadDoc.slug === 'string'
      ? payloadDoc.slug
      : typeof payloadDoc.id === 'string' || typeof payloadDoc.id === 'number'
        ? payloadDoc.id.toString()
        : undefined

  if (!slug) {
    return null
  }

  const content = resolveContentFromPayload(payloadDoc)
  const publishedAt =
    payloadDoc.publishedAt ||
    payloadDoc.createdAt ||
    payloadDoc.updatedAt ||
    new Date().toISOString()

  const summary =
    payloadDoc.summary || payloadDoc.excerpt || payloadDoc.description || ''

  const category =
    typeof payloadDoc.category === 'object'
      ? payloadDoc.category.slug ||
        payloadDoc.category.name ||
        payloadDoc.category.title
      : payloadDoc.category

  const metadata: BlogMetadata = {
    title: typeof payloadDoc.title === 'string' ? payloadDoc.title : slug,
    publishedAt,
    updatedAt: payloadDoc.updatedAt,
    summary,
    image: resolveImageFromPayload(payloadDoc),
    category: normalizeCategory(category),
    ai: payloadDoc.ai,
    rssImage: payloadDoc.rssImage,
  }

  return {
    metadata,
    slug,
    tweetIds: extractTweetIds(content),
    content,
  } satisfies BlogPost
}

function sortByPublishedDesc(posts: BlogPost[]) {
  posts.sort((a, b) => {
    if (new Date(a.metadata.publishedAt) > new Date(b.metadata.publishedAt)) {
      return -1
    }
    return 1
  })
}

type GetBlogPostsOptions = {
  includeDraft?: boolean
}

export async function getBlogPosts(options: GetBlogPostsOptions = {}) {
  const includeDraft = options.includeDraft ?? false

  const [{ getPayload }, { default: config }] = await Promise.all([
    import('payload'),
    import('@payload-config'),
  ])
  const payload = await getPayload({ config })

  const where = includeDraft
    ? undefined
    : {
        _status: {
          equals: 'published',
        },
      }

  let data: { docs?: any[] }
  try {
    data = await payload.find({
      collection: DEFAULT_COLLECTION as any,
      depth: DEFAULT_DEPTH,
      draft: includeDraft,
      limit: DEFAULT_PAGE_SIZE,
      sort: '-publishedAt',
      ...(where ? { where } : {}),
    })
  } catch (error) {
    // First boot can race before SQLite table creation finishes.
    if (isMissingSQLiteTableError(error)) {
      return []
    }
    throw error
  }

  const payloadDocs = Array.isArray(data.docs) ? data.docs : []
  const posts = payloadDocs
    .map((doc) => toBlogPostFromPayload(doc))
    .filter((post): post is BlogPost => post !== null)

  sortByPublishedDesc(posts)
  return posts
}
