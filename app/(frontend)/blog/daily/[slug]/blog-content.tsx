import defaultAvatar from 'app/avatar.webp'
import TOC from 'app/blog/tech/[slug]/toc'
import PayloadRichTextContent from 'app/components/payload-richtext'
import { getBlogPostHref, getBlogPosts } from 'app/db/blog'
import { slugify } from 'app/lib/slugify'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { extractHeadingsFromRichContent } from '../../../db/rich-content'
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

function extractHeadings(richContent: Record<string, any>): Heading[] {
  return extractHeadingsFromRichContent(richContent, slugify)
}

type DailyContentProps = {
  slug: string
  includeDraft?: boolean
  previewReloadPath?: string
}

export default async function DailyContent({
  slug,
  includeDraft = false,
  previewReloadPath,
}: DailyContentProps) {
  const getPost = await getBlogPosts({ includeDraft })
  const {
    siteUrl,
    profileName,
    profileAvatar,
    profileAvatarAlt,
    dateLocale,
    timeZone,
  } = await getSiteSettings()

  if (!getPost) {
    notFound()
  }
  const post = getPost.find((post) => post.slug === slug)

  if (!post) {
    notFound()
  }

  const headings = extractHeadings(post.richContent)
  const relatedPosts = post.relatedPosts.slice(0, 3)
  const isPreviewMode = Boolean(previewReloadPath)
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
            description: post.metadata.seoDescription || post.metadata.summary,
            image: getOgImageUrl({
              image: post.metadata.seoImage || post.metadata.image,
              siteUrl,
              title: post.metadata.seoTitle || post.metadata.title,
            }),
            url: toAbsoluteUrl(getBlogPostHref(post), siteUrl),
            author: {
              '@type': 'Person',
              name: profileName,
            },
          }),
        }}
      />
      <ReturnButton
        className="text-[13px] transition-opacity hover:opacity-50"
        title="Back to list"
        reloadPreviewPath={previewReloadPath}
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
            {formatDate(post.metadata.publishedAt, dateLocale, timeZone)}
          </p>
        </div>
        <div className="flex flex-col gap-1">
          <p className="text-neutral-600 text-xs dark:text-neutral-400">
            Author
          </p>
          <div className="flex items-center gap-1">
            <div className="relative size-[18px] overflow-hidden rounded-full border-[0.5px] border-neutral-200 transition-opacity dark:border-none dark:brightness-90">
              {profileAvatar ? (
                <img
                  alt={profileAvatarAlt}
                  src={profileAvatar}
                  height={18}
                  width={18}
                  className="h-full w-full object-cover"
                  draggable={false}
                />
              ) : (
                <Image
                  alt={profileAvatarAlt}
                  src={defaultAvatar}
                  height={18}
                  width={18}
                  sizes="15vw"
                  placeholder="blur"
                  priority
                  draggable={false}
                />
              )}
            </div>
            <p className="flex h-5 items-center font-medium text-[12px] text-neutral-800 dark:text-neutral-200">
              {profileName}
            </p>
          </div>
        </div>
      </div>
      <PayloadRichTextContent data={post.richContent} />
      {!isPreviewMode && relatedPosts.length > 0 && (
        <section className="mt-12 rounded-xl border border-neutral-200 px-5 py-4 dark:border-neutral-800">
          <h2 className="font-medium text-base tracking-tight">
            Related posts
          </h2>
          <ul className="mt-3 space-y-2 text-sm">
            {relatedPosts.map((related) => (
              <li key={related.slug}>
                <Link
                  href={getBlogPostHref({
                    slug: related.slug,
                    metadata: { category: related.category },
                  })}
                  className="text-neutral-700 transition-colors hover:text-black dark:text-neutral-300 dark:hover:text-white"
                >
                  {related.title}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
      <TOC headings={headings} />
    </>
  )
}

function formatDate(date: string, dateLocale: string, timeZone: string) {
  let dateString = date
  if (!dateString.includes('T')) {
    dateString = `${dateString}T00:00:00`
  }

  const fullDate = new Date(dateString).toLocaleString(dateLocale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone,
  })

  return `${fullDate}`
}
