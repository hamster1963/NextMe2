import { getSiteSettings } from 'app/db/site-settings'
import TypeSwitch from '../type-switch'
import InsideList from './inside-list'

export const revalidate = 300

export async function generateMetadata() {
  const { blogInsideDescription, blogInsideLabel } = await getSiteSettings()

  return {
    title: blogInsideLabel,
    description: blogInsideDescription,
  }
}

export default async function Page() {
  const {
    blogTechLabel,
    blogInsideLabel,
    blogInsideDescription,
    blogDailyLabel,
  } = await getSiteSettings()

  return (
    <section className="sm:px-14 sm:pt-6">
      <h1 className="mb-2 font-medium text-2xl tracking-tighter">
        {blogInsideLabel}
      </h1>
      <p className="prose prose-neutral dark:prose-invert mb-2 text-sm">
        {blogInsideDescription}
      </p>
      <TypeSwitch
        techLabel={blogTechLabel}
        insideLabel={blogInsideLabel}
        dailyLabel={blogDailyLabel}
      />
      <InsideList />
    </section>
  )
}
