import BlogList from './blog-list'
import TypeSwitch from './type-switch'

export const metadata = {
  title: 'Blog',
  description: 'Read my thoughts on software development, design, and more.',
}

export default async function BlogPage() {
  return (
    <section className="sm:px-14 sm:pt-6">
      <h1 className="mb-2 font-medium text-2xl tracking-tighter">Blog</h1>
      <p className="prose prose-neutral dark:prose-invert mb-2 text-sm">
        A collection of posts.
      </p>
      <TypeSwitch />
      <BlogList />
    </section>
  )
}
