import { getBlogPosts } from 'app/db/blog'

export const dynamic = 'force-static'

export default async function sitemap() {
  let getPost = getBlogPosts()
  getPost = getPost.filter((post) => post.metadata.category === 'Tech')
  const blogs = getPost.map((post) => ({
    url: `https://buycoffee.top/blog/tech/${post.slug}`,
    lastModified: post.metadata.publishedAt,
  }))

  const routes = ['', '/blog', '/guestbook', '/work', '/darkroom'].map(
    (route) => ({
      url: `https://buycoffee.top${route}`,
      lastModified: new Date().toISOString().split('T')[0],
    })
  )

  return [...routes, ...blogs]
}
