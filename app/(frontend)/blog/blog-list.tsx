import BlogListClient from 'app/components/blog-list-client'
import { getPlaceholderColorFromLocal } from 'lib/images'
import { getBlogPosts } from '../db/blog'
import { getSiteSettings } from '../db/site-settings'

export default async function BlogList() {
  let allBlogs = await getBlogPosts()
  const { dateLocale, timeZone } = await getSiteSettings()

  allBlogs = allBlogs.filter((post) => post.metadata.category === 'Tech')

  // Sort blogs by publication date
  allBlogs.sort((a, b) => {
    if (new Date(a.metadata.publishedAt) > new Date(b.metadata.publishedAt)) {
      return -1
    }
    return 1
  })

  const placeholderImageBlogMap = new Map()
  for (const post of allBlogs) {
    let placeholderImage: { src: string; placeholder: any; metadata?: any } = {
      src: '',
      placeholder: {},
    }
    if (post?.metadata.image) {
      placeholderImage = await getPlaceholderColorFromLocal(
        post.slug,
        post.metadata.image
      )
    }
    placeholderImageBlogMap.set(post.slug, placeholderImage)
  }

  // Access the first blog post if it exists
  const firstBlog = allBlogs.length > 0 ? allBlogs[0] : null
  // Access the rest of the blog posts if it exists
  const restBlogs = allBlogs.length > 0 ? allBlogs.slice(1) : []
  return (
    <BlogListClient
      firstBlog={firstBlog}
      restBlogs={restBlogs}
      placeholderImageBlogMap={placeholderImageBlogMap}
      dateLocale={dateLocale}
      timeZone={timeZone}
    />
  )
}
