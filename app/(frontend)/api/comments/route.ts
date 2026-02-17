import config from '@payload-config'
import { NextResponse } from 'next/server'
import { getPayload } from 'payload'

const MAX_NAME_LENGTH = 80
const MAX_EMAIL_LENGTH = 120
const MAX_CONTENT_LENGTH = 2000
const RATE_LIMIT_WINDOW_MS = 60_000
const RATE_LIMIT_MAX_REQUESTS = 6
const COMMENT_SCOPE_POST = 'post'
const COMMENT_SCOPE_GUESTBOOK = 'guestbook'
const requestsByIP = new Map<string, { count: number; resetAt: number }>()

function toSingleValue(value: unknown): string {
  if (typeof value !== 'string') {
    return ''
  }
  return value.trim()
}

function normalizeName(value: unknown) {
  const name = toSingleValue(value)
  if (!name) {
    return ''
  }
  return name.slice(0, MAX_NAME_LENGTH)
}

function normalizeEmail(value: unknown) {
  const email = toSingleValue(value).toLowerCase()
  if (!email) {
    return ''
  }
  return email.slice(0, MAX_EMAIL_LENGTH)
}

function normalizeContent(value: unknown) {
  const content = toSingleValue(value)
  if (!content) {
    return ''
  }
  return content.slice(0, MAX_CONTENT_LENGTH)
}

function normalizeSlug(value: unknown) {
  return toSingleValue(value).toLowerCase()
}

function normalizeScope(value: unknown) {
  const scope = toSingleValue(value).toLowerCase()

  if (scope === COMMENT_SCOPE_GUESTBOOK) {
    return COMMENT_SCOPE_GUESTBOOK
  }

  return COMMENT_SCOPE_POST
}

function isValidEmail(email: string) {
  if (!email) {
    return true
  }
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

function getClientIP(request: Request) {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }

  const realIP = request.headers.get('x-real-ip')
  if (realIP) {
    return realIP.trim()
  }

  return 'unknown'
}

function isRateLimited(ip: string) {
  const now = Date.now()
  const state = requestsByIP.get(ip)

  if (!state || now > state.resetAt) {
    requestsByIP.set(ip, {
      count: 1,
      resetAt: now + RATE_LIMIT_WINDOW_MS,
    })
    return false
  }

  state.count += 1
  if (state.count > RATE_LIMIT_MAX_REQUESTS) {
    return true
  }

  return false
}

async function findPublishedPostBySlug(slug: string) {
  const payload = await getPayload({ config })
  const result = await payload.find({
    collection: 'posts',
    depth: 0,
    limit: 1,
    where: {
      and: [
        {
          slug: {
            equals: slug,
          },
        },
        {
          _status: {
            equals: 'published',
          },
        },
      ],
    },
  })

  return result.docs?.[0]
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const scope = normalizeScope(searchParams.get('scope'))
  const slug = normalizeSlug(searchParams.get('slug'))

  if (scope === COMMENT_SCOPE_POST && !slug) {
    return NextResponse.json({ error: 'Missing slug' }, { status: 400 })
  }

  const payload = await getPayload({ config })
  let where: Record<string, unknown>

  if (scope === COMMENT_SCOPE_GUESTBOOK) {
    where = {
      and: [
        {
          scope: {
            equals: COMMENT_SCOPE_GUESTBOOK,
          },
        },
        {
          status: {
            equals: 'published',
          },
        },
      ],
    }
  } else {
    const post = await findPublishedPostBySlug(slug)
    if (!post) {
      return NextResponse.json({ comments: [] }, { status: 200 })
    }

    where = {
      and: [
        {
          post: {
            equals: post.id,
          },
        },
        {
          status: {
            equals: 'published',
          },
        },
        {
          or: [
            {
              scope: {
                equals: COMMENT_SCOPE_POST,
              },
            },
            {
              scope: {
                exists: false,
              },
            },
          ],
        },
      ],
    }
  }

  const comments = await payload.find({
    collection: 'comments',
    depth: 1,
    limit: 200,
    sort: 'createdAt',
    where,
  })

  const docs = Array.isArray(comments.docs) ? comments.docs : []
  const normalized = docs.map((doc: any) => ({
    id: doc.id,
    authorName: typeof doc.authorName === 'string' ? doc.authorName : 'Guest',
    content: typeof doc.content === 'string' ? doc.content : '',
    createdAt: doc.createdAt,
    reply:
      typeof doc.reply?.content === 'string' &&
      doc.reply.content.trim().length > 0
        ? {
            content: doc.reply.content.trim(),
            repliedAt: doc.reply.repliedAt,
          }
        : null,
  }))

  return NextResponse.json({ comments: normalized }, { status: 200 })
}

export async function POST(request: Request) {
  const ip = getClientIP(request)
  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: 'Too many requests, please try again later.' },
      { status: 429 }
    )
  }

  let body: any
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
  }

  const website = toSingleValue(body?.website)
  // Honeypot field: bots filling this input will be ignored.
  if (website) {
    return NextResponse.json({ ok: true }, { status: 201 })
  }

  const slug = normalizeSlug(body?.slug)
  const scope = normalizeScope(body?.scope)
  const authorName = normalizeName(body?.authorName)
  const authorEmail = normalizeEmail(body?.authorEmail)
  const content = normalizeContent(body?.content)

  if (!authorName || !content) {
    return NextResponse.json(
      { error: 'Missing required fields' },
      { status: 400 }
    )
  }

  if (scope === COMMENT_SCOPE_POST && !slug) {
    return NextResponse.json({ error: 'Missing slug' }, { status: 400 })
  }

  if (!isValidEmail(authorEmail)) {
    return NextResponse.json({ error: 'Invalid email' }, { status: 400 })
  }

  let post: { id: string | number } | undefined
  if (scope === COMMENT_SCOPE_POST) {
    post = await findPublishedPostBySlug(slug)
    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }
  }

  const payload = await getPayload({ config })
  await payload.create({
    collection: 'comments',
    data: {
      scope,
      post: post?.id,
      authorName,
      authorEmail: authorEmail || undefined,
      content,
      status: 'published',
    },
  })

  return NextResponse.json({ ok: true }, { status: 201 })
}
