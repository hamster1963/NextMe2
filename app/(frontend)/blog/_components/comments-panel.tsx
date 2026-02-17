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
  slug: string
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
      const res = await fetch(
        `/api/comments?slug=${encodeURIComponent(slug)}`,
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
  }, [slug])

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
    <section
      className={`mt-12 rounded-xl border border-neutral-200 p-5 dark:border-neutral-800 ${className || ''}`}
    >
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-medium text-lg tracking-tight">
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

      {loading ? (
        <p className="text-neutral-500 text-sm dark:text-neutral-400">
          Loading comments...
        </p>
      ) : comments.length === 0 ? (
        <p className="text-neutral-500 text-sm dark:text-neutral-400">
          No comments yet.
        </p>
      ) : (
        <ul className="space-y-4">
          {comments.map((comment) => (
            <li
              key={comment.id}
              className="rounded-lg border border-neutral-200 p-3 dark:border-neutral-800"
            >
              <div className="mb-2 flex items-center justify-between">
                <p className="font-medium text-sm">{comment.authorName}</p>
                <p className="text-neutral-500 text-xs dark:text-neutral-400">
                  {formatDate(comment.createdAt)}
                </p>
              </div>
              <p className="whitespace-pre-wrap text-neutral-800 text-sm dark:text-neutral-200">
                {comment.content}
              </p>
              {comment.reply?.content && (
                <div className="mt-3 rounded-md border border-neutral-300 bg-neutral-50 p-3 dark:border-neutral-700 dark:bg-neutral-900">
                  <p className="mb-1 font-medium text-neutral-600 text-xs uppercase tracking-wide dark:text-neutral-300">
                    Admin reply
                  </p>
                  <p className="whitespace-pre-wrap text-neutral-800 text-sm dark:text-neutral-200">
                    {comment.reply.content}
                  </p>
                  {comment.reply.repliedAt && (
                    <p className="mt-1 text-neutral-500 text-xs dark:text-neutral-400">
                      {formatDate(comment.reply.repliedAt)}
                    </p>
                  )}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}

      {allowSubmit ? (
        <form className="mt-6 space-y-3" onSubmit={onSubmit}>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <input
              type="text"
              placeholder="Name"
              required
              maxLength={80}
              value={authorName}
              onChange={(event) => setAuthorName(event.target.value)}
              className="rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none transition focus:border-neutral-500 dark:border-neutral-700 dark:bg-neutral-950"
            />
            <input
              type="email"
              placeholder="Email (optional)"
              maxLength={120}
              value={authorEmail}
              onChange={(event) => setAuthorEmail(event.target.value)}
              className="rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none transition focus:border-neutral-500 dark:border-neutral-700 dark:bg-neutral-950"
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
            className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none transition focus:border-neutral-500 dark:border-neutral-700 dark:bg-neutral-950"
          />

          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={submitting}
              className="rounded-md bg-black px-4 py-2 text-sm text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-black"
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
