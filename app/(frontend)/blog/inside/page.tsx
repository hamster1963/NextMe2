import TypeSwitch from '../type-switch'
import InsideList from './inside-list'

export const metadata = {
  title: 'Inside',
  description: 'Just about anything that comes to mind.',
}

export default async function Page() {
  return (
    <section className="sm:px-14 sm:pt-6">
      <h1 className="mb-2 font-medium text-2xl tracking-tighter">Inside</h1>
      <p className="prose prose-neutral dark:prose-invert mb-2 text-sm">
        Personal reflections and notes.
      </p>
      <TypeSwitch />
      <InsideList />
    </section>
  )
}
