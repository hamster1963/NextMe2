import avatar from 'app/avatar.webp'
import { getPlaceholderColorFromLocal } from 'lib/images'
import { MDXRemote } from 'next-mdx-remote/rsc'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { customComponents, slugify } from '../../../components/mdx'
import { getBlogPosts } from '../../../db/blog'
import {
  getOgImageUrl,
  getSiteSettings,
  toAbsoluteUrl,
} from '../../../db/site-settings'
import ReturnButton from './return-button'
import TOC from './toc'

interface Heading {
  level: number
  id: string
  text: string
}

function extractHeadings(source: string) {
  const headings: Heading[] = []

  // 移除代码块
  const cleanedSource = source.replace(/```[\s\S]*?```/g, '')

  // 匹配 Markdown 标题，如 ## 标题
  const headingRegex = /^(#{1,6})\s+(.*)$/gm
  let match = headingRegex.exec(cleanedSource)
  while (match !== null) {
    const level = match[1].length // # 的数量表示标题等级
    let text = match[2].trim()

    // 去除加粗标记
    text = text.replace(/\*\*(.*?)\*\*/g, '$1')

    const id = slugify(text) // 使用 slugify 函数生成 ID
    headings.push({ level, id, text })
    match = headingRegex.exec(cleanedSource)
  }
  return headings
}

type BlogContentProps = {
  slug: string
  includeDraft?: boolean
}

export default async function BlogContent({
  slug,
  includeDraft = false,
}: BlogContentProps) {
  const getPost = await getBlogPosts({ includeDraft })
  const { siteUrl } = await getSiteSettings()

  if (!getPost) {
    notFound()
  }
  const post = getPost.find((post) => post.slug === slug)

  let placeholderImage: {
    placeholder: { hex: string }
    metadata?: { width?: number; height?: number }
  } = {
    placeholder: { hex: '#ffffff' },
  }
  if (post?.metadata.image) {
    placeholderImage = await getPlaceholderColorFromLocal(
      post.slug,
      post.metadata.image
    )
  }

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
            url: toAbsoluteUrl(`/blog/tech/${post.slug}`, siteUrl),
            author: {
              '@type': 'Person',
              name: 'Hamster1963',
            },
          }),
        }}
      />
      <ReturnButton
        className="text-[13px] transition-opacity hover:opacity-50"
        title="回到列表"
      />
      <h1 className="mt-0.5 mb-2 font-medium text-2xl tracking-tighter">
        {post.metadata.title}
      </h1>
      <div className="mt-6 mb-6 flex max-w-[650px] items-start gap-8">
        <div className="flex flex-col gap-1">
          <p className="text-neutral-600 text-xs dark:text-neutral-400">
            发布日期
          </p>
          <p className="flex h-5 items-center font-medium text-[13px] text-neutral-800 dark:text-neutral-200">
            {formatDate(post.metadata.publishedAt)}
          </p>
        </div>
        <div className="flex flex-col gap-1">
          <p className="text-neutral-600 text-xs dark:text-neutral-400">作者</p>
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
              仓鼠
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <p className="text-neutral-600 text-xs dark:text-neutral-400">
            阅读数
          </p>
        </div>
      </div>
      {/* {post.metadata.ai && <AI ai={post.metadata.ai} />} */}
      <div className="mb-8 flex w-full flex-col">
        {post.metadata.image && (
          <div
            className={
              'relative z-20 overflow-hidden rounded-xl transition-all duration-300 sm:my-14 sm:scale-130 dark:brightness-75 dark:hover:brightness-100'
            }
            style={{ backgroundColor: placeholderImage.placeholder.hex }}
          >
            <img
              className="relative"
              alt={'Hamster1963'}
              src={post.metadata.image}
              width={
                placeholderImage.metadata?.width
                  ? placeholderImage.metadata?.width
                  : 1920
              }
              height={
                placeholderImage.metadata?.height
                  ? placeholderImage.metadata?.height
                  : 1080
              }
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
            <div className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-gray-900/5 ring-inset dark:ring-white/5" />
          </div>
        )}
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
  if (!date.includes('T')) {
    dateString = `${date}T00:00:00`
  }

  const fullDate = new Date(dateString).toLocaleString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return `${fullDate}`
}
