import { GetViewCounter } from 'app/components/view-counter'
import clsx from 'clsx'
import Image from 'next/image'
import InsideListLink from './[slug]/inside-list-link'

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

export default function InsideListClient({
  Blogs,
  placeholderImageBlogMap,
}: {
  Blogs
  placeholderImageBlogMap
}) {
  return (
    <section className={'mt-3'}>
      <section className={clsx('mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2')}>
        {Blogs.map((post) => {
          return (
            <InsideListLink key={post.slug} slug={post.slug}>
              <div className="flex w-full flex-col">
                {post.metadata.image && (
                  <div
                    className={
                      'relative rounded-xl transition-all duration-500 ease-linear dark:brightness-75 dark:hover:brightness-100'
                    }
                    style={{
                      backgroundColor: placeholderImageBlogMap.get(post.slug)
                        .placeholder.hex,
                    }}
                  >
                    <div className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-gray-900/5 ring-inset dark:ring-white/5" />
                    <Image
                      alt={'Hamster1963'}
                      className="rounded-xl object-cover"
                      src={post.metadata.image}
                      width={
                        placeholderImageBlogMap.get(post.slug).metadata.width
                      }
                      height={
                        placeholderImageBlogMap.get(post.slug).metadata.height
                      }
                      loading="lazy"
                    />
                  </div>
                )}
                <p className="mt-2 font-medium text-md tracking-tighter transition-all">
                  {post.metadata.title}
                </p>
                <div className="flex items-center gap-1">
                  <p className="text-neutral-600 text-xs dark:text-neutral-400">
                    {blogPostDate(post.metadata.publishedAt)}
                  </p>
                </div>
              </div>
            </InsideListLink>
          )
        })}
      </section>
    </section>
  )
}
