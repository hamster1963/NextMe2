import avatar from 'app/avatar.webp'
import TOC from 'app/blog/tech/[slug]/toc'
import { customComponents, slugify } from 'app/components/mdx'
import { MDXRemote } from 'next-mdx-remote/rsc'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { getBlogPosts } from '../../../db/blog'
import {
  getOgImageUrl,
  getSiteSettings,
  toAbsoluteUrl,
} from '../../../db/site-settings'
import ReturnButton from './return-button'

interface Heading {
  level: number
  id: string
  text: string
}

function extractHeadings(source: string) {
  const headings: Heading[] = []

  // Remove fenced code blocks
  const cleanedSource = source.replace(/```[\s\S]*?```/g, '')

  // Match markdown headings like "## Title"
  const headingRegex = /^(#{1,6})\s+(.*)$/gm
  let match = headingRegex.exec(cleanedSource)
  while (match !== null) {
    const level = match[1].length // Number of "#" determines heading level
    let text = match[2].trim()

    // Strip bold markers
    text = text.replace(/\*\*(.*?)\*\*/g, '$1')

    const id = slugify(text) // Generate heading id via slugify
    headings.push({ level, id, text })
    match = headingRegex.exec(cleanedSource)
  }
  return headings
}

type DailyContentProps = {
  slug: string
  includeDraft?: boolean
}

export default async function DailyContent({
  slug,
  includeDraft = false,
}: DailyContentProps) {
  const getPost = await getBlogPosts({ includeDraft })
  const { siteUrl } = await getSiteSettings()

  if (!getPost) {
    notFound()
  }
  const post = getPost.find((post) => post.slug === slug)

  if (!post) {
    notFound()
  }

  const headings = extractHeadings(post.content)
  return (
    <>
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BlogPosting',
            headline: post.metadata.title,
            datePublished: post.metadata.publishedAt,
            dateModified: post.metadata.publishedAt,
            description: post.metadata.summary,
            image: getOgImageUrl({
              image: post.metadata.image,
              siteUrl,
              title: post.metadata.title,
            }),
            url: toAbsoluteUrl(`/blog/daily/${post.slug}`, siteUrl),
            author: {
              '@type': 'Person',
              name: 'Hamster1963',
            },
          }),
        }}
      />
      <ReturnButton
        className="text-[13px] transition-opacity hover:opacity-50"
        title="Back to list"
      />
      <h1 className="mt-0.5 mb-2 font-medium text-2xl tracking-tighter">
        {post.metadata.title}
      </h1>
      <div className="mt-6 mb-6 flex max-w-[650px] items-start gap-8">
        <div className="flex flex-col gap-1">
          <p className="text-neutral-600 text-xs dark:text-neutral-400">
            Published
          </p>
          <p className="flex h-5 items-center font-medium text-[13px] text-neutral-800 dark:text-neutral-200">
            {formatDate(post.metadata.publishedAt)}
          </p>
        </div>
        <div className="flex flex-col gap-1">
          <p className="text-neutral-600 text-xs dark:text-neutral-400">
            Author
          </p>
          <div className="flex items-center gap-1">
            <div className="relative size-[18px] overflow-hidden rounded-full border-[0.5px] border-neutral-200 transition-opacity dark:border-none dark:brightness-90">
              <Image
                alt={'Hamster1963'}
                src={avatar}
                height={18}
                width={18}
                sizes="15vw"
                placeholder="blur"
                priority
                draggable={false}
              />
            </div>
            <p className="flex h-5 items-center font-medium text-[12px] text-neutral-800 dark:text-neutral-200">
              Hamster
            </p>
          </div>
        </div>
      </div>
      <article className="prose prose-neutral prose-quoteless dark:prose-invert text-[15px]">
        <MDXRemote source={post.content} components={customComponents} />
      </article>
      <TOC headings={headings} />
    </>
  )
}

function formatDate(date: string) {
  let dateString = date
  if (!dateString.includes('T')) {
    dateString = `${dateString}T00:00:00`
  }

  const fullDate = new Date(dateString).toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return `${fullDate}`
}
