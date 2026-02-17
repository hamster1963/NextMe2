import { getBlogPostHref, getBlogPosts } from 'app/db/blog'
import { getSiteSettings, toAbsoluteUrl } from 'app/db/site-settings'

export const revalidate = 3600

export default async function sitemap() {
  const { siteUrl } = await getSiteSettings()
  const posts = await getBlogPosts()
  const blogs = posts.map((post) => ({
    url: toAbsoluteUrl(getBlogPostHref(post), siteUrl),
    lastModified: post.metadata.publishedAt,
  }))

  const routes = [
    '',
    '/blog',
    '/blog/inside',
    '/blog/daily',
    '/guestbook',
  ].map((route) => ({
    url: toAbsoluteUrl(route, siteUrl),
    lastModified: new Date().toISOString().split('T')[0],
  }))

  return [...routes, ...blogs]
}
