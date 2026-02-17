import Link from 'next/link'
import { redirect } from 'next/navigation'
import { isPayloadBootstrapped } from '../db/bootstrap'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Setup',
}

export default async function SetupPage() {
  const ready = await isPayloadBootstrapped()
  if (ready) {
    redirect('/')
  }

  return (
    <section className="mx-auto flex min-h-[70vh] max-w-xl flex-col justify-center gap-5 sm:px-6">
      <h1 className="font-semibold text-2xl tracking-tight">
        First-time setup
      </h1>
      <p className="text-neutral-600 text-sm dark:text-neutral-300">
        The admin is not initialized yet. Please open the Payload admin and
        create the first administrator account, then configure your site URL in
        <code>Globals -&gt; Site Settings</code> and fill in profile,
        navigation, blog labels, and footer options.
      </p>
      <div className="flex flex-wrap gap-3">
        <Link
          href="/admin"
          className="rounded-md bg-black px-4 py-2 text-sm text-white dark:bg-white dark:text-black"
        >
          Open Admin Setup
        </Link>
        <Link
          href="/setup"
          className="rounded-md border border-neutral-300 px-4 py-2 text-sm dark:border-neutral-700"
        >
          Done, Refresh
        </Link>
      </div>
      <p className="text-neutral-500 text-xs dark:text-neutral-400">
        Admin URL: <code>/admin</code>
      </p>
    </section>
  )
}
