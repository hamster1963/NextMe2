import { getBlogPostBySlug, getBlogPostHref } from 'app/db/blog'
import {
  getOgImageUrl,
  getSiteSettings,
  toAbsoluteUrl,
} from 'app/db/site-settings'
import type { Metadata } from 'next'
import DailyContent from './blog-content'

export const dynamic = 'force-dynamic'

export async function generateMetadata(props): Promise<Metadata | undefined> {
  const params = await props.params
  const { siteUrl } = await getSiteSettings()
  const post = await getBlogPostBySlug(params.slug)
  if (!post) {
    return
  }

  const title = post.metadata.seoTitle || post.metadata.title
  const publishedTime = post.metadata.publishedAt
  const description = post.metadata.seoDescription || post.metadata.summary
  const image = post.metadata.seoImage || post.metadata.image
  const ogImage = getOgImageUrl({ image, siteUrl, title })

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'article',
      publishedTime,
      url: toAbsoluteUrl(getBlogPostHref(post), siteUrl),
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

export default async function Daily(props) {
  const params = await props.params
  const { slug } = params
  return (
    <section className="sm:px-14 sm:pt-6">
      <DailyContent slug={slug} />
    </section>
  )
}
