'use client'

import { useEffect, useState } from 'react'
import { useSWRConfig } from 'swr'

import TopCommitBar from 'app/components/top-commit-bar'
import { AnimatePresence } from 'framer-motion'
import { CreateBlogGuestbookEntry } from 'lib/fetch'
import { useStatus } from 'lib/status-context'

export default function BlogGuestbookForm({ slug }: { slug: string }) {
  const { mutate } = useSWRConfig()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [entry, setEntry] = useState('')
  const [disabled, setDisabled] = useState(false)
  const [loading, setLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [unsubmitted, setUnsubmitted] = useState(false)

  useEffect(() => {
    if (name || email || entry) {
      setUnsubmitted(true)
    } else {
      setUnsubmitted(false)
    }
  }, [name, email, entry])

  const handleCancel = () => {
    setEmail('')
    setEntry('')
    setName('')
  }

  const handleSubmit = async () => {
    if (!name || !email || !entry) {
      alert('请填写完整信息')
      return
    }
    setDisabled(true)
    setLoading(true)

    await CreateBlogGuestbookEntry(email, entry, name, slug)

    setTimeout(() => {
      setLoading(false)
      setIsSuccess(true)
      setDisabled(false)
    }, 1000)

    setTimeout(() => {
      setUnsubmitted(false)
      setIsSuccess(false)
      setEmail('')
      setEntry('')
      setName('')
      mutate(['guestbook', slug])
    }, 2000)
  }

  return (
    <>
      <AnimatePresence>
        {unsubmitted && (
          <TopCommitBar
            handleSubmit={handleSubmit}
            handleCancel={handleCancel}
            disabled={disabled}
            loading={loading}
            isSuccess={isSuccess}
          />
        )}
      </AnimatePresence>
      <form className="relative">
        <section className="relative grid gap-2 md:grid-cols-2">
          <input
            aria-label="Your name"
            placeholder="名称"
            name="name"
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="block rounded-lg border-neutral-300 bg-neutral-100 py-2 pl-4 text-[14px] text-neutral-900 placeholder-neutral-400 outline-hidden dark:bg-neutral-800 dark:text-neutral-100"
          />
          <input
            aria-label="Your email"
            placeholder="邮箱"
            name="email"
            type="text"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="block rounded-lg border-neutral-300 bg-neutral-100 py-2 pl-4 text-[14px] text-neutral-900 placeholder-neutral-400 outline-hidden dark:bg-neutral-800 dark:text-neutral-100"
          />
        </section>
        <textarea
          aria-label="Your message"
          placeholder="键入留言..."
          name="entry"
          required
          value={entry}
          onChange={(e) => setEntry(e.target.value)}
          className="mt-2 mb-4 block min-h-[80px] w-full rounded-lg border-neutral-300 bg-neutral-100 py-4 pr-32 pl-4 text-[14px] text-neutral-900 placeholder-neutral-400 outline-hidden dark:bg-neutral-800 dark:text-neutral-100"
        />
      </form>
    </>
  )
}
