import { getBlogPosts } from 'app/db/blog'
import { getSiteSettings } from 'app/db/site-settings'
import { getPlaceholderColorFromLocal } from 'lib/images'
import InsideListClient from './inside-list-client'

export default async function InsideList() {
  let allBlogs = await getBlogPosts()
  const { dateLocale, timeZone } = await getSiteSettings()

  allBlogs = allBlogs.filter((post) => post.metadata.category === 'Inside')

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

  return (
    <InsideListClient
      Blogs={allBlogs}
      placeholderImageBlogMap={placeholderImageBlogMap}
      dateLocale={dateLocale}
      timeZone={timeZone}
    />
  )
}
