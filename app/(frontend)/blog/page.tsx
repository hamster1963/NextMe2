import { getSiteSettings } from '../db/site-settings'
import BlogList from './blog-list'
import TypeSwitch from './type-switch'

export const revalidate = 300

export async function generateMetadata() {
  const { blogTechDescription, blogTechLabel } = await getSiteSettings()

  return {
    title: blogTechLabel,
    description: blogTechDescription,
  }
}

export default async function BlogPage() {
  const {
    blogTechLabel,
    blogTechDescription,
    blogInsideLabel,
    blogDailyLabel,
  } = await getSiteSettings()

  return (
    <section className="sm:px-14 sm:pt-6">
      <h1 className="mb-2 font-medium text-2xl tracking-tighter">
        {blogTechLabel}
      </h1>
      <p className="prose prose-neutral dark:prose-invert mb-2 text-sm">
        {blogTechDescription}
      </p>
      <TypeSwitch
        techLabel={blogTechLabel}
        insideLabel={blogInsideLabel}
        dailyLabel={blogDailyLabel}
      />
      <BlogList />
    </section>
  )
}
