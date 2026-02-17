import { revalidatePath, revalidateTag } from 'next/cache'
import type {
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
} from 'payload'

type PostLike = {
  _status?: unknown
  category?: unknown
  slug?: unknown
}

const CATEGORY_ROUTE_MAP: Record<string, string> = {
  tech: 'tech',
  inside: 'inside',
  daily: 'daily',
}

function toRouteSegment(category: unknown): string {
  if (typeof category !== 'string') {
    return 'tech'
  }

  const normalized = category.trim().toLowerCase()
  return CATEGORY_ROUTE_MAP[normalized] || 'tech'
}

function getPostPath(post?: PostLike | null): string | undefined {
  if (!post || typeof post.slug !== 'string' || post.slug.length === 0) {
    return undefined
  }

  const category = toRouteSegment(post.category)
  return `/blog/${category}/${post.slug}`
}

function isPublished(post?: PostLike | null): boolean {
  return post?._status === 'published'
}

function revalidateBlogPaths(path?: string): void {
  if (path) {
    revalidatePath(path)
  }
  revalidatePath('/blog')
  revalidatePath('/blog/inside')
  revalidatePath('/blog/daily')
  revalidatePath('/sitemap.xml')
  revalidateTag('blog-posts')
  revalidateTag('site-settings')
}

export const revalidatePost: CollectionAfterChangeHook = ({
  doc,
  previousDoc,
}) => {
  if (isPublished(doc)) {
    revalidateBlogPaths(getPostPath(doc as PostLike))
  }

  if (isPublished(previousDoc)) {
    revalidateBlogPaths(getPostPath(previousDoc as PostLike))
  }

  return doc
}

export const revalidateDeletePost: CollectionAfterDeleteHook = ({ doc }) => {
  revalidateBlogPaths(getPostPath(doc as PostLike))
  return doc
}
