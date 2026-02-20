export type BlogMetadata = {
  title: string
  publishedAt: string
  updatedAt?: string
  summary: string
  image?: string
  category: string
  categories: string[]
  ai?: string
  rssImage?: string
  seoTitle?: string
  seoDescription?: string
  seoImage?: string
}

export type RelatedBlogPost = {
  slug: string
  title: string
  category: string
}

export type BlogPost = {
  id: string
  metadata: BlogMetadata
  slug: string
  richContent: Record<string, any>
  relatedPosts: RelatedBlogPost[]
}

const DEFAULT_COLLECTION = 'posts'
const DEFAULT_PAGE_SIZE = 100
const DEFAULT_DEPTH = 2
const CATEGORY_MAP = {
  tech: 'Tech',
  inside: 'Inside',
  daily: 'Daily',
} as const

function normalizeCategory(rawCategory: unknown): string {
  if (typeof rawCategory !== 'string') {
    return 'Tech'
  }

  const normalized = rawCategory.trim().toLowerCase()
  return CATEGORY_MAP[normalized] || rawCategory
}

function resolveCategoryPath(category: string): string {
  const normalized = category.toLowerCase()
  if (normalized === 'inside') {
    return 'inside'
  }
  if (normalized === 'daily') {
    return 'daily'
  }
  return 'tech'
}

type BlogPostPathSource = {
  slug: string
  metadata: {
    category?: string
  }
}

export function getBlogPostHref(post: BlogPostPathSource) {
  return `/blog/${resolveCategoryPath(post.metadata.category || 'Tech')}/${post.slug}`
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

function resolveImageFromPayload(payloadValue: unknown): string | undefined {
  if (!payloadValue) {
    return undefined
  }

  if (typeof payloadValue === 'string') {
    return payloadValue
  }

  if (typeof payloadValue === 'object') {
    const maybeUrl = (payloadValue as { url?: unknown; filename?: unknown }).url
    if (typeof maybeUrl === 'string' && maybeUrl.length > 0) {
      return maybeUrl
    }

    const maybeFilename = (payloadValue as { filename?: unknown }).filename
    if (typeof maybeFilename === 'string' && maybeFilename.length > 0) {
      return maybeFilename
    }
  }

  return undefined
}

function resolvePrimaryCategory(payloadDoc: Record<string, any>): string {
  const rawCategory =
    typeof payloadDoc.category === 'object'
      ? payloadDoc.category.slug ||
        payloadDoc.category.name ||
        payloadDoc.category.title
      : payloadDoc.category

  return normalizeCategory(rawCategory)
}

function resolveTaxonomyCategories(payloadDoc: Record<string, any>): string[] {
  const rawCategories = payloadDoc.categories
  if (!Array.isArray(rawCategories)) {
    return []
  }

  return rawCategories
    .map((item) => {
      if (!item || typeof item !== 'object') {
        return undefined
      }

      const title = (item as { title?: unknown }).title
      const slug = (item as { slug?: unknown }).slug
      if (typeof title === 'string' && title.trim().length > 0) {
        return title.trim()
      }
      if (typeof slug === 'string' && slug.trim().length > 0) {
        return slug.trim()
      }
      return undefined
    })
    .filter((value): value is string => Boolean(value))
}

function resolveRichContentFromPayload(payloadDoc: Record<string, any>) {
  const contentCandidates = [
    payloadDoc.content,
    payloadDoc.contentRich,
    payloadDoc.richText,
  ]

  const validContent = contentCandidates.find(
    (item) =>
      Boolean(item) &&
      typeof item === 'object' &&
      'root' in (item as Record<string, any>)
  )

  if (validContent && typeof validContent === 'object') {
    return validContent as Record<string, any>
  }

  return undefined
}

function toRelatedBlogPost(value: unknown): RelatedBlogPost | null {
  if (!value || typeof value !== 'object') {
    return null
  }

  const doc = value as Record<string, any>
  const slug =
    typeof doc.slug === 'string'
      ? doc.slug
      : typeof doc.id === 'string' || typeof doc.id === 'number'
        ? doc.id.toString()
        : undefined

  if (!slug) {
    return null
  }

  return {
    slug,
    title: typeof doc.title === 'string' ? doc.title : slug,
    category: resolvePrimaryCategory(doc),
  }
}

function toBlogPostFromPayload(
  payloadDoc: Record<string, any>
): BlogPost | null {
  const resolvedId =
    typeof payloadDoc.id === 'string' || typeof payloadDoc.id === 'number'
      ? payloadDoc.id.toString()
      : undefined

  const slug =
    typeof payloadDoc.slug === 'string' && payloadDoc.slug.length > 0
      ? payloadDoc.slug
      : resolvedId
  const id = resolvedId || slug

  if (!slug || !id) {
    return null
  }

  const richContent = resolveRichContentFromPayload(payloadDoc)
  if (!richContent) {
    return null
  }

  const publishedAt =
    payloadDoc.publishedAt ||
    payloadDoc.createdAt ||
    payloadDoc.updatedAt ||
    new Date().toISOString()

  const summary =
    payloadDoc.summary || payloadDoc.excerpt || payloadDoc.description || ''
  const primaryCategory = resolvePrimaryCategory(payloadDoc)
  const taxonomyCategories = resolveTaxonomyCategories(payloadDoc)

  const seoTitle =
    typeof payloadDoc.meta?.title === 'string'
      ? payloadDoc.meta.title
      : undefined
  const seoDescription =
    typeof payloadDoc.meta?.description === 'string'
      ? payloadDoc.meta.description
      : undefined
  const seoImage = resolveImageFromPayload(payloadDoc.meta?.image)

  const metadata: BlogMetadata = {
    title: typeof payloadDoc.title === 'string' ? payloadDoc.title : slug,
    publishedAt,
    updatedAt: payloadDoc.updatedAt,
    summary,
    image: resolveImageFromPayload(
      payloadDoc.image ||
        payloadDoc.coverImage ||
        payloadDoc.cover ||
        payloadDoc.heroImage
    ),
    category: primaryCategory,
    categories: taxonomyCategories,
    ai: payloadDoc.ai,
    rssImage: resolveImageFromPayload(payloadDoc.rssImage),
    seoTitle,
    seoDescription,
    seoImage,
  }

  const relatedPosts = Array.isArray(payloadDoc.relatedPosts)
    ? payloadDoc.relatedPosts
        .map((item) => toRelatedBlogPost(item))
        .filter(
          (item): item is RelatedBlogPost => Boolean(item) && item.slug !== slug
        )
    : []

  return {
    id,
    metadata,
    slug,
    richContent,
    relatedPosts,
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

async function fetchBlogPosts(includeDraft: boolean): Promise<BlogPost[]> {
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

async function fetchFirstBlogPostByWhere(
  where: Record<string, any>,
  includeDraft: boolean
): Promise<BlogPost | null> {
  const [{ getPayload }, { default: config }] = await Promise.all([
    import('payload'),
    import('@payload-config'),
  ])
  const payload = await getPayload({ config })

  let data: { docs?: any[] }
  try {
    data = await payload.find({
      collection: DEFAULT_COLLECTION as any,
      depth: DEFAULT_DEPTH,
      draft: includeDraft,
      limit: 1,
      where: includeDraft
        ? where
        : {
            and: [
              where,
              {
                _status: {
                  equals: 'published',
                },
              },
            ],
          },
    })
  } catch (error) {
    if (isMissingSQLiteTableError(error)) {
      return null
    }
    throw error
  }

  const firstDoc = Array.isArray(data.docs) ? data.docs[0] : undefined
  if (!firstDoc) {
    return null
  }

  return toBlogPostFromPayload(firstDoc)
}

export async function getBlogPosts(options: GetBlogPostsOptions = {}) {
  const includeDraft = options.includeDraft ?? false
  return fetchBlogPosts(includeDraft)
}

type GetBlogPostBySlugOptions = {
  includeDraft?: boolean
}

export async function getBlogPostBySlug(
  slug: string,
  options: GetBlogPostBySlugOptions = {}
) {
  const includeDraft = options.includeDraft ?? false
  return fetchFirstBlogPostByWhere(
    {
      slug: {
        equals: slug,
      },
    },
    includeDraft
  )
}

type GetBlogPostByIdOptions = {
  includeDraft?: boolean
}

export async function getBlogPostById(
  id: string,
  options: GetBlogPostByIdOptions = {}
) {
  const includeDraft = options.includeDraft ?? false
  return fetchFirstBlogPostByWhere(
    {
      id: {
        equals: id,
      },
    },
    includeDraft
  )
}
