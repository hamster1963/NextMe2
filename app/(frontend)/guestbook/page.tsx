import CommentsPanel from 'app/blog/_components/comments-panel'
import { getSiteSettings } from 'app/db/site-settings'

export const dynamic = 'force-dynamic'

export async function generateMetadata() {
  const { siteName } = await getSiteSettings()

  return {
    title: 'Guestbook',
    description: `Leave a message for ${siteName}.`,
  }
}

export default async function GuestbookPage() {
  return (
    <section className="sm:px-14 sm:pt-6">
      <h1 className="mb-2 font-medium text-2xl tracking-tighter">Guestbook</h1>
      <p className="prose prose-neutral dark:prose-invert mb-2 text-sm">
        Leave a message. Comments are public, and the admin can reply from the
        dashboard.
      </p>
      <CommentsPanel scope="guestbook" className="mt-8" />
    </section>
  )
}
