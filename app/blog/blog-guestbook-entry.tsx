'use client'

import { GetGuestbookEntries } from 'lib/fetch'
import useSWR from 'swr'

export default function BlogGuestbookEntries({ slug }: { slug: string }) {
  const { data: entries } = useSWR(['guestbook', slug], () =>
    GetGuestbookEntries(slug)
  )

  if (!entries || entries.length === 0) {
    return <></>
  }

  const guestbooks = entries.filter((entry) => entry.is_reply === 1)
  const replies = entries.filter((entry) => entry.is_reply === 2)

  return guestbooks?.map((entry) => {
    const reply = replies.find((reply) => reply.reply_to === entry.id)

    return (
      <div key={entry.id} className="mb-4 flex flex-col">
        <div className="w-full break-words text-sm">
          <span className="mr-1 text-neutral-600 dark:text-neutral-400">
            {entry.created_by}:
          </span>
          {entry.body}
        </div>
        {reply && (
          <div className="flex justify-end">
            <div className="mt-3 max-w-[90%] rounded-lg bg-neutral-100 p-2 text-left text-neutral-800 text-xs dark:bg-neutral-800 dark:text-neutral-400">
              {reply.body}
            </div>
          </div>
        )}
      </div>
    )
  })
}
