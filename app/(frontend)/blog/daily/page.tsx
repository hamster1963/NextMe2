import { getSiteSettings } from 'app/db/site-settings'
import TypeSwitch from '../type-switch'
import DailyList from './daily-list'

export const revalidate = 300

export async function generateMetadata() {
  const { blogDailyDescription, blogDailyLabel } = await getSiteSettings()

  return {
    title: blogDailyLabel,
    description: blogDailyDescription,
  }
}

export default async function Page() {
  const {
    blogTechLabel,
    blogInsideLabel,
    blogDailyLabel,
    blogDailyDescription,
  } = await getSiteSettings()

  return (
    <section className="sm:px-14 sm:pt-6">
      <h1 className="mb-2 font-medium text-2xl tracking-tighter">
        {blogDailyLabel}
      </h1>
      <p className="prose prose-neutral dark:prose-invert mb-2 text-sm">
        {blogDailyDescription}
      </p>
      <TypeSwitch
        techLabel={blogTechLabel}
        insideLabel={blogInsideLabel}
        dailyLabel={blogDailyLabel}
      />
      <DailyList />
    </section>
  )
}
