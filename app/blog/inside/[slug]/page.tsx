import { getBlogPosts } from 'app/db/blog'
import type { Metadata } from 'next'
import BlogContent from './blog-content'

export async function generateMetadata(props): Promise<Metadata | undefined> {
  const params = await props.params
  const getPost = getBlogPosts()
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
  const ogImage = image
    ? `https://buycoffee.top${image}`
    : `https://buycoffee.top/og?title=${title}`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'article',
      publishedTime,
      url: `https://buycoffee.top/blog/tech/${post?.slug}`,
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
  let getPost = getBlogPosts()
  getPost = getPost.filter((post) => post.metadata.category === 'Inside')

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
