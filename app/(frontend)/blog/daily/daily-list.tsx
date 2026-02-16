import { clsx } from 'clsx'
import Link from 'next/link'
import { getBlogPosts } from '../../db/blog'

export default async function DailyList() {
  let allBlogs = await getBlogPosts()

  allBlogs = allBlogs.filter((post) => post.metadata.category === 'Daily')

  // Sort blogs by publication date
  allBlogs.sort((a, b) => {
    if (new Date(a.metadata.publishedAt) > new Date(b.metadata.publishedAt)) {
      return -1
    }
    return 1
  })
  return (
    <section className={clsx('mt-3 grid grid-cols-1 gap-2')}>
      {allBlogs.map((post) => (
        <Link
          key={post.slug}
          className="flex flex-col space-y-2"
          href={`/blog/daily/${post.slug}`}
        >
          <div className="flex w-full flex-col">
            <p className="font-medium text-md tracking-tighter transition-all hover:text-stone-500">
              {post.metadata.title}
            </p>
            <div className="flex items-center gap-1">
              <p className="text-neutral-600 text-xs dark:text-neutral-400">
                {blogPostDate(post.metadata.publishedAt)}
              </p>
            </div>
          </div>
        </Link>
      ))}
    </section>
  )
}

function blogPostDate(date: string) {
  let dateString = date
  if (!dateString.includes('T')) {
    dateString = `${dateString}T00:00:00`
  }
  return new Date(dateString).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
  })
}
