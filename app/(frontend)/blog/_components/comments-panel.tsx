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
    <section className={`mt-14 ${className || ''}`}>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="font-medium text-base tracking-tight">
          Comments ({commentCount})
        </h2>
        <button
          type="button"
          className="text-[11px] text-neutral-500 uppercase tracking-[0.08em] transition hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-100"
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
        <ul className="space-y-8">
          {comments.map((comment) => (
            <li key={comment.id} className="space-y-2">
              <div className="flex items-baseline justify-between gap-3">
                <p className="font-medium text-sm">{comment.authorName}</p>
                <p className="text-[11px] text-neutral-500 uppercase tracking-[0.06em] dark:text-neutral-400">
                  {formatDate(comment.createdAt)}
                </p>
              </div>
              <p className="whitespace-pre-wrap text-neutral-800 text-sm leading-6 dark:text-neutral-200">
                {comment.content}
              </p>
              {comment.reply?.content && (
                <div className="mt-2 pl-3 text-neutral-700 text-sm dark:text-neutral-300">
                  <p className="mb-1 font-medium text-[10px] text-neutral-500 uppercase tracking-[0.08em] dark:text-neutral-400">
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

      {allowSubmit ? (
        <div className="mt-10">
          <div className="mb-6">
            <div className="h-px w-full bg-neutral-200/80 dark:bg-neutral-800/80" />
            <p className="mt-3 text-[11px] text-neutral-500 uppercase tracking-[0.08em] dark:text-neutral-400">
              Leave a comment
            </p>
          </div>
          <form className="space-y-4" onSubmit={onSubmit}>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <input
              type="text"
              placeholder="Name"
              required
              maxLength={80}
              value={authorName}
              onChange={(event) => setAuthorName(event.target.value)}
              className="w-full bg-transparent px-0 py-2 text-sm placeholder:text-neutral-400 outline-none transition focus:bg-neutral-50/60 dark:focus:bg-neutral-900/50"
            />
            <input
              type="email"
              placeholder="Email (optional)"
              maxLength={120}
              value={authorEmail}
              onChange={(event) => setAuthorEmail(event.target.value)}
              className="w-full bg-transparent px-0 py-2 text-sm placeholder:text-neutral-400 outline-none transition focus:bg-neutral-50/60 dark:focus:bg-neutral-900/50"
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
            className="w-full bg-transparent px-0 py-2 text-sm placeholder:text-neutral-400 outline-none transition focus:bg-neutral-50/60 dark:focus:bg-neutral-900/50"
          />

          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={submitting}
              className="font-medium text-sm underline underline-offset-4 transition-opacity hover:opacity-60 disabled:cursor-not-allowed disabled:opacity-40"
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
        </div>
      ) : (
        <p className="mt-6 text-neutral-500 text-xs dark:text-neutral-400">
          Comment submission is disabled in preview mode.
        </p>
      )}
    </section>
  )
}
