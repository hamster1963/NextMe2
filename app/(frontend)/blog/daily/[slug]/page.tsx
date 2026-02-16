import { getBlogPosts } from 'app/db/blog'
import type { Metadata } from 'next'
import DailyContent from './blog-content'

function getOGImageUrl(image?: string, title?: string) {
  if (!image) {
    return `https://buycoffee.top/og?title=${title}`
  }

  if (image.startsWith('http://') || image.startsWith('https://')) {
    return image
  }

  return `https://buycoffee.top${image}`
}

export async function generateMetadata(props): Promise<Metadata | undefined> {
  const params = await props.params
  const getPost = await getBlogPosts()
  if (!getPost) {
    return
  }
  const post = getPost.find((post) => post.slug === params.slug)

  const {
    title,
    publishedAt: publishedTime,
    summary: description,
    image,
  } = post?.metadata || {}
  const ogImage = getOGImageUrl(image, title)

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'article',
      publishedTime,
      url: `https://buycoffee.top/blog/daily/${post?.slug}`,
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
  getPost = getPost.filter((post) => post.metadata.category === 'Daily')

  return getPost.map((post) => ({
    slug: post.slug,
  }))
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
