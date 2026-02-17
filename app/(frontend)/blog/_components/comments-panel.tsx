'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'

type CommentReply = {
  content: string
  repliedAt?: string
}

type BlogComment = {
  id: string
  authorName: string
  content: string
  createdAt?: string
  reply?: CommentReply | null
}

type CommentsPanelProps = {
  slug?: string
  scope?: 'post' | 'guestbook'
  allowSubmit?: boolean
  className?: string
}

function formatDate(value?: string) {
  if (!value) {
    return ''
  }

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return ''
  }

  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export default function CommentsPanel({
  slug,
  scope = 'post',
  allowSubmit = true,
  className,
}: CommentsPanelProps) {
  const [comments, setComments] = useState<BlogComment[]>([])
  const [authorName, setAuthorName] = useState('')
  const [authorEmail, setAuthorEmail] = useState('')
  const [content, setContent] = useState('')
  const [website, setWebsite] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const loadComments = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams()
      params.set('scope', scope)
      if (slug) {
        params.set('slug', slug)
      }

      const res = await fetch(
        `/api/comments?${params.toString()}`,
        {
          method: 'GET',
          cache: 'no-store',
        }
      )
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data?.error || 'Failed to load comments')
      }

      setComments(Array.isArray(data?.comments) ? data.comments : [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load comments')
    } finally {
      setLoading(false)
    }
  }, [scope, slug])

  useEffect(() => {
    void loadComments()
  }, [loadComments])

  const commentCount = useMemo(() => comments.length, [comments])

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSubmitting(true)
    setError(null)
    setSuccessMessage(null)

    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          scope,
          slug,
          authorName,
          authorEmail,
          content,
          website,
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data?.error || 'Failed to submit comment')
      }

      setAuthorName('')
      setAuthorEmail('')
      setContent('')
      setWebsite('')
      setSuccessMessage('Comment posted.')
      await loadComments()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit comment')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className={`mt-14 ${className || ''}`}>
      <div className="mb-5 flex items-center justify-between">
        <h2 className="font-medium text-base tracking-tight">
          Comments ({commentCount})
        </h2>
        <button
          type="button"
          className="text-neutral-500 text-xs transition hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-100"
          onClick={() => void loadComments()}
        >
          Refresh
        </button>
      </div>

      <div className="rounded-2xl bg-neutral-100/70 p-5 dark:bg-neutral-900/45">
        {loading ? (
          <p className="text-neutral-500 text-sm dark:text-neutral-400">
            Loading comments...
          </p>
        ) : comments.length === 0 ? (
          <p className="text-neutral-500 text-sm dark:text-neutral-400">
            No comments yet.
          </p>
        ) : (
          <ul className="space-y-5">
            {comments.map((comment) => (
              <li key={comment.id} className="space-y-2 pb-5 last:pb-0">
                <div className="flex items-baseline justify-between gap-3">
                  <p className="font-medium text-sm">{comment.authorName}</p>
                  <p className="text-neutral-500 text-xs dark:text-neutral-400">
                    {formatDate(comment.createdAt)}
                  </p>
                </div>
                <p className="whitespace-pre-wrap text-neutral-800 text-sm leading-6 dark:text-neutral-200/95">
                  {comment.content}
                </p>
                {comment.reply?.content && (
                  <div className="mt-3 rounded-lg bg-white/75 px-3 py-2.5 text-neutral-700 text-sm dark:bg-neutral-950/55 dark:text-neutral-300">
                    <p className="mb-1 font-medium text-[10px] text-neutral-500 uppercase tracking-[0.04em] dark:text-neutral-400">
                      Admin reply
                    </p>
                    <p className="whitespace-pre-wrap leading-6">
                      {comment.reply.content}
                    </p>
                    {comment.reply.repliedAt && (
                      <p className="mt-1 text-[11px] text-neutral-500 dark:text-neutral-400">
                        {formatDate(comment.reply.repliedAt)}
                      </p>
                    )}
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      {allowSubmit ? (
        <form className="mt-6 space-y-4" onSubmit={onSubmit}>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <input
              type="text"
              placeholder="Name"
              required
              maxLength={80}
              value={authorName}
              onChange={(event) => setAuthorName(event.target.value)}
              className="w-full rounded-lg bg-white/90 px-3 py-2.5 text-sm placeholder:text-neutral-400 outline-none transition focus:bg-white dark:bg-neutral-900/80 dark:focus:bg-neutral-900"
            />
            <input
              type="email"
              placeholder="Email (optional)"
              maxLength={120}
              value={authorEmail}
              onChange={(event) => setAuthorEmail(event.target.value)}
              className="w-full rounded-lg bg-white/90 px-3 py-2.5 text-sm placeholder:text-neutral-400 outline-none transition focus:bg-white dark:bg-neutral-900/80 dark:focus:bg-neutral-900"
            />
          </div>

          <input
            type="text"
            tabIndex={-1}
            autoComplete="off"
            value={website}
            onChange={(event) => setWebsite(event.target.value)}
            className="hidden"
            aria-hidden="true"
          />

          <textarea
            placeholder="Write your comment..."
            required
            maxLength={2000}
            rows={4}
            value={content}
            onChange={(event) => setContent(event.target.value)}
            className="w-full rounded-lg bg-white/90 px-3 py-2.5 text-sm placeholder:text-neutral-400 outline-none transition focus:bg-white dark:bg-neutral-900/80 dark:focus:bg-neutral-900"
          />

          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={submitting}
              className="rounded-md bg-neutral-900 px-3 py-1.5 font-medium text-sm text-white transition hover:opacity-85 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-white dark:text-black"
            >
              {submitting ? 'Posting...' : 'Post comment'}
            </button>
            {successMessage && (
              <p className="text-emerald-600 text-xs dark:text-emerald-400">
                {successMessage}
              </p>
            )}
          </div>
          {error && (
            <p className="text-red-600 text-xs dark:text-red-400">{error}</p>
          )}
        </form>
      ) : (
        <p className="mt-6 text-neutral-500 text-xs dark:text-neutral-400">
          Comment submission is disabled in preview mode.
        </p>
      )}
    </section>
  )
}
