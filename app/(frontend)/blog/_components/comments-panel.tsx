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
  formPlacement?: 'top' | 'bottom'
  className?: string
}

const ANONYMOUS_NAME = 'Anonymous'

export default function CommentsPanel({
  slug,
  scope = 'post',
  allowSubmit = true,
  formPlacement = 'bottom',
  className,
}: CommentsPanelProps) {
  const [comments, setComments] = useState<BlogComment[]>([])
  const [authorName, setAuthorName] = useState('')
  const [authorEmail, setAuthorEmail] = useState('')
  const [isAnonymous, setIsAnonymous] = useState(false)
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

      const res = await fetch(`/api/public-comments?${params.toString()}`, {
        method: 'GET',
        cache: 'no-store',
      })
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

  const onAnonymousChange = (nextAnonymous: boolean) => {
    setIsAnonymous(nextAnonymous)

    if (nextAnonymous) {
      setAuthorName(ANONYMOUS_NAME)
      setAuthorEmail('')
      return
    }

    if (authorName === ANONYMOUS_NAME) {
      setAuthorName('')
    }
  }

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSubmitting(true)
    setError(null)
    setSuccessMessage(null)

    try {
      const submitName = isAnonymous ? ANONYMOUS_NAME : authorName
      const submitEmail = isAnonymous ? '' : authorEmail

      const res = await fetch('/api/public-comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          scope,
          slug,
          authorName: submitName,
          authorEmail: submitEmail,
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

  const commentsList = (
    <div>
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

      <div>
        {loading ? (
          <p className="text-neutral-500 text-sm dark:text-neutral-400">
            Loading comments...
          </p>
        ) : comments.length === 0 ? (
          <p className="text-neutral-500 text-sm dark:text-neutral-400">
            No comments yet.
          </p>
        ) : (
          <ul className="space-y-2">
            {comments.map((comment) => (
              <li key={comment.id} className="space-y-4 pb-6 last:pb-0">
                <p className="whitespace-pre-wrap text-neutral-900 text-sm leading-[1.7] tracking-[-0.01em] dark:text-neutral-100">
                  <span className="text-neutral-500 dark:text-neutral-400">
                    {comment.authorName}
                  </span>
                  : {comment.content}
                </p>
                {comment.reply?.content && (
                  <div className="flex justify-end">
                    <div className="max-w-[88%] rounded-[8px] bg-neutral-200/85 px-2 py-1 text-neutral-700 text-sm leading-[1.6] tracking-[-0.01em] sm:max-w-[78%] sm:text-sm dark:bg-neutral-800/80 dark:text-neutral-200">
                      <p className="whitespace-pre-wrap">
                        {comment.reply.content}
                      </p>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )

  const submitForm = allowSubmit ? (
    <form
      className={formPlacement === 'top' ? 'space-y-4' : 'mt-6 space-y-4'}
      onSubmit={onSubmit}
    >
      <div className="inline-flex rounded-full bg-neutral-100 p-0.5 dark:border dark:border-neutral-800 dark:bg-black">
        <button
          type="button"
          aria-pressed={!isAnonymous}
          onClick={() => onAnonymousChange(false)}
          className={`rounded-full px-2 py-1 font-medium text-[10px] transition ${
            !isAnonymous
              ? 'bg-white text-black shadow-sm dark:bg-neutral-200 dark:text-neutral-900'
              : 'text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200'
          }`}
        >
          Basic
        </button>
        <button
          type="button"
          aria-pressed={isAnonymous}
          onClick={() => onAnonymousChange(true)}
          className={`rounded-full px-2 py-1 font-medium text-[10px] transition ${
            isAnonymous
              ? 'bg-white text-black shadow-sm dark:bg-neutral-200 dark:text-neutral-900'
              : 'text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200'
          }`}
        >
          Anonymous
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <input
          type="text"
          placeholder="Name"
          required={!isAnonymous}
          maxLength={80}
          value={authorName}
          onChange={(event) => setAuthorName(event.target.value)}
          disabled={isAnonymous}
          className="w-full rounded-lg bg-neutral-100 px-3 py-2.5 text-sm outline-none transition placeholder:text-neutral-400 focus:bg-white disabled:cursor-not-allowed disabled:opacity-50 dark:bg-neutral-900/80 dark:focus:bg-neutral-900"
        />
        <input
          type="email"
          placeholder="Email (optional)"
          maxLength={120}
          value={authorEmail}
          onChange={(event) => setAuthorEmail(event.target.value)}
          disabled={isAnonymous}
          className="w-full rounded-lg bg-neutral-100 px-3 py-2.5 text-sm outline-none transition placeholder:text-neutral-400 focus:bg-white disabled:cursor-not-allowed disabled:opacity-50 dark:bg-neutral-900/80 dark:focus:bg-neutral-900"
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
        className="w-full rounded-lg bg-neutral-100 px-3 py-2.5 text-sm outline-none transition placeholder:text-neutral-400 focus:bg-white dark:bg-neutral-900/80 dark:focus:bg-neutral-900"
      />

      <div className="flex flex-wrap items-center gap-3">
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
  )

  return (
    <section className={`mt-4 ${className || ''}`}>
      {formPlacement === 'top' ? (
        <>
          {submitForm}
          <div className="mt-10">{commentsList}</div>
        </>
      ) : (
        <>
          {commentsList}
          {submitForm}
        </>
      )}
    </section>
  )
}
