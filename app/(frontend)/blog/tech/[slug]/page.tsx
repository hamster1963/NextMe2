import { getBlogPosts } from 'app/db/blog'
import {
  getOgImageUrl,
  getSiteSettings,
  toAbsoluteUrl,
} from 'app/db/site-settings'
import type { Metadata } from 'next'
import BlogContent from './blog-content'

export async function generateMetadata(props): Promise<Metadata | undefined> {
  const params = await props.params
  const { siteUrl } = await getSiteSettings()
  const getPost = await getBlogPosts()
  if (!getPost) {
    return
  }
  const post = getPost.find((post) => post.slug === params.slug)
  if (!post) {
    return
  }

  const {
    title,
    publishedAt: publishedTime,
    summary: description,
    image,
  } = post.metadata
  const ogImage = getOgImageUrl({ image, siteUrl, title })

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'article',
      publishedTime,
      url: toAbsoluteUrl(`/blog/tech/${post.slug}`, siteUrl),
      images: [
        {
          url: ogImage,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
    },
  }
}

export async function generateStaticParams() {
  let getPost = await getBlogPosts()
  getPost = getPost.filter((post) => post.metadata.category === 'Tech')

  return getPost.map((post) => ({
    slug: post.slug,
  }))
}

export default async function Blog(props) {
  const params = await props.params
  const { slug } = params
  return (
    <section className="sm:px-14 sm:pt-6">
      <BlogContent slug={slug} />
    </section>
  )
}
