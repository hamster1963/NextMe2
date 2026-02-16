import TypeSwitch from '../type-switch'
import DailyList from './daily-list'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Daily',
  description:
    'Read my daily thoughts on software development, design, and more.',
}

export default async function Page() {
  return (
    <section className="sm:px-14 sm:pt-6">
      <h1 className="mb-2 font-medium text-2xl tracking-tighter">Daily</h1>
      <p className="prose prose-neutral dark:prose-invert mb-2 text-sm">
        Random thoughts and quick notes.
      </p>
      <TypeSwitch />
      <DailyList />
    </section>
  )
}
