import { getBlogPosts } from 'app/db/blog'
import { getSiteSettings, toAbsoluteUrl } from 'app/db/site-settings'

export const dynamic = 'force-dynamic'

export default async function sitemap() {
  const { siteUrl } = await getSiteSettings()
  let getPost = await getBlogPosts()
  getPost = getPost.filter((post) => post.metadata.category === 'Tech')
  const blogs = getPost.map((post) => ({
    url: toAbsoluteUrl(`/blog/tech/${post.slug}`, siteUrl),
    lastModified: post.metadata.publishedAt,
  }))

  const routes = ['', '/blog', '/work', '/darkroom'].map((route) => ({
    url: toAbsoluteUrl(route, siteUrl),
    lastModified: new Date().toISOString().split('T')[0],
  }))

  return [...routes, ...blogs]
}
