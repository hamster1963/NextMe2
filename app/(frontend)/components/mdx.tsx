import crypto from 'node:crypto'
import { promises as fs } from 'node:fs'
import path from 'node:path'
import { getFileBuffer, getPlaceholderBlogImage } from 'lib/images'
import Link from 'next/link'
import React from 'react'
import sharp from 'sharp'
import { highlight } from 'sugar-high'
import BlogImage from './blog-image'
import * as Demos from './demos'
import TechCard from './tech-card'

function Table({ data }) {
  const headers = data.headers.map((header) => (
    <th key={`header-${header}`}>{header}</th>
  ))
  const rows = data.rows.map((row, rowIndex) => (
    <tr key={`row-${row.join('-')}`}>
      {row.map((cell) => (
        <td key={`cell-${rowIndex}-${cell}`}>{cell}</td>
      ))}
    </tr>
  ))

  return (
    <table>
      <thead>
        <tr>{headers}</tr>
      </thead>
      <tbody>{rows}</tbody>
    </table>
  )
}

function CustomLink(props) {
  const href = props.href

  if (href.startsWith('/')) {
    return (
      <Link href={href} {...props}>
        {props.children}
      </Link>
    )
  }

  if (href.startsWith('#')) {
    return <a {...props} />
  }

  return <a target="_blank" rel="noopener noreferrer" {...props} />
}

async function CenterImage(props: { src: string; alt: string }) {
  const { src, alt } = props
  const imagePath = src.replaceAll('%20', ' ')

  const isDev = process.env.NODE_ENV === 'development'
  const skipCompression = alt.includes('skip-compression')

  if (isDev || skipCompression) {
    return (
      <>
        <BlogImage
          src={imagePath}
          alt={alt}
          width={1920}
          height={1080}
          hex={'ffffff'}
        />
        {alt.startsWith('alt:') && (
          <div className="mt-2 mb-0 text-center text-[13px] text-neutral-400 dark:text-neutral-600">
            {alt.replace('alt:', '').replace('skip-compression', '')}
          </div>
        )}
      </>
    )
  }

  // Build an MD5 hash from the image path
  const contentHash = crypto.createHash('md5').update(imagePath).digest('hex')

  // Cache directory path
  const cacheDir = path.join(
    process.cwd(),
    '.next',
    'cache',
    'optimized-images'
  )
  const placeholderCacheFileName = `${contentHash}-placeholder.json`
  const placeholderCachePath = path.join(cacheDir, placeholderCacheFileName)

  let preImage: any

  // Try loading placeholder info from cache
  try {
    const cachedPlaceholder = await fs.readFile(placeholderCachePath, 'utf-8')
    preImage = JSON.parse(cachedPlaceholder)
  } catch (error) {
    console.log(error)
    // Generate placeholder info when cache is missing
    console.log(
      'Placeholder cache missing, generating new file:',
      placeholderCachePath
    )
    preImage = await getPlaceholderBlogImage(imagePath)

    // Persist generated placeholder info
    await fs.mkdir(cacheDir, { recursive: true })
    await fs.writeFile(placeholderCachePath, JSON.stringify(preImage))
  }

  // Skip optimization for GIF files
  if (imagePath.toLowerCase().endsWith('.gif')) {
    // Return original image for GIF
    return (
      <>
        <BlogImage
          src={imagePath}
          alt={alt}
          width={preImage.metadata?.width}
          height={preImage.metadata?.height}
          hex={preImage.placeholder.hex}
        />
        {alt.startsWith('alt:') && (
          <p className="-mb-0 mt-2 text-center text-[13px] text-neutral-400 dark:text-neutral-600">
            {alt.replace('alt:', '')}
          </p>
        )}
      </>
    )
  }

  const cacheFileName = `${contentHash}-optimized.webp`
  const cachePath = path.join(cacheDir, cacheFileName)

  // Build target path under the public directory
  const publicDir = path.join(process.cwd(), 'public', 'optimized')
  const publicFileName = `${contentHash}-optimized.webp`
  const publicPath = path.join(publicDir, publicFileName)

  // Try reading optimized image from cache
  try {
    await fs.access(cachePath)
    // If exists, copy cached file to public directory
    await fs.mkdir(publicDir, { recursive: true })
    await fs.copyFile(cachePath, publicPath)
  } catch (error) {
    // If missing, optimize and write cache/public files
    console.log(error)
    console.log('Optimized cache missing:', cachePath)
    const originalBuffer = await getFileBuffer(imagePath)
    const optimizedBuffer = await sharp(originalBuffer)
      .resize(1920, 1080, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 90, lossless: true })
      .toBuffer()

    // Ensure destination directories exist
    await fs.mkdir(cacheDir, { recursive: true })
    await fs.mkdir(publicDir, { recursive: true })

    // Write optimized image to cache and public paths
    await fs.writeFile(cachePath, optimizedBuffer)
    await fs.writeFile(publicPath, optimizedBuffer)
  }

  // Return optimized image from public directory
  return (
    <>
      <BlogImage
        src={`/optimized/${publicFileName}`}
        alt={alt}
        width={preImage.metadata?.width}
        height={preImage.metadata?.height}
        hex={preImage.placeholder.hex}
      />
      {alt.startsWith('alt:') && (
        <p className="-mb-0 mt-2 text-center text-[13px] text-neutral-400 dark:text-neutral-600">
          {alt.replace('alt:', '')}
        </p>
      )}
    </>
  )
}

function Callout(props) {
  return (
    <div className="mb-8 flex items-center rounded-sm border border-neutral-200 bg-neutral-50 p-1 px-4 py-3 text-neutral-900 text-sm dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100">
      <div className="mr-4 flex w-4 items-center">{props.emoji}</div>
      <div className="callout w-full">{props.children}</div>
    </div>
  )
}

function ProsCard({ title, pros }) {
  return (
    <div className="my-4 w-full rounded-xl border border-emerald-200 bg-neutral-50 p-6 dark:border-emerald-900 dark:bg-neutral-900">
      <span>{`${title}`}</span>
      <div className="mt-4">
        {pros.map((pro) => (
          <div key={pro} className="mb-2 flex items-baseline font-medium">
            <div className="mr-2 h-4 w-4">
              <svg className="h-4 w-4 text-emerald-500" viewBox="0 0 24 24">
                <title>ProsCard</title>
                <g
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
                  <path d="M22 4L12 14.01l-3-3" />
                </g>
              </svg>
            </div>
            <span>{pro}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function ConsCard({ title, cons }) {
  return (
    <div className="my-6 w-full rounded-xl border border-red-200 bg-neutral-50 p-6 dark:border-red-900 dark:bg-neutral-900">
      <span>{`You might not use ${title} if...`}</span>
      <div className="mt-4">
        {cons.map((con) => (
          <div key={con} className="mb-2 flex items-baseline font-medium">
            <div className="mr-2 h-4 w-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="h-4 w-4 text-red-500"
              >
                <title>ConsCard</title>
                <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
              </svg>
            </div>
            <span>{con}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function Code({ children, ...props }) {
  if (props.className) {
    const codeHTML = highlight(children)
    return <code dangerouslySetInnerHTML={{ __html: codeHTML }} {...props} />
  }
  return (
    <p className=" mt-0 mb-0 inline-block w-fit rounded-md border-[0.5px] bg-stone-100 px-1 py-0.5 font-medium text-black/80 text-xs dark:border-stone-700 dark:bg-stone-800 dark:text-white/80">
      {children}
    </p>
  )
}

export function slugify(str) {
  return (
    str
      .toString()
      .toLowerCase()
      .trim() // Remove whitespace from both ends of a string
      .replace(/\s+/g, '-') // Replace spaces with -
      .replace(/&/g, '-and-') // Replace & with 'and'
      // .replace(/[^\w\-]+/g, '') // Remove all non-word characters except for -
      .replace(/--+/g, '-')
  ) // Replace multiple - with single -
}

const CreateHeading = (level: number) => {
  const Heading = ({ children }: { children: React.ReactNode }) => {
    const slug = slugify(children as string)

    if (slug.includes('title:')) {
      return null
    }

    return React.createElement(`h${level}`, { id: slug }, [
      React.createElement('a', {
        href: `#${slug}`,
        key: `link-${slug}`,
        className: 'anchor',
      }),
      children,
    ])
  }

  Heading.displayName = `HeadingLevel${level}`

  return Heading
}

function EmptyHR() {
  return <hr className="hidden" />
}

export const customComponents = {
  hr: EmptyHR,
  h1: CreateHeading(1),
  h2: CreateHeading(2),
  h3: CreateHeading(3),
  h4: CreateHeading(4),
  h5: CreateHeading(5),
  h6: CreateHeading(6),
  img: CenterImage,
  a: CustomLink,
  Callout,
  ProsCard,
  ConsCard,
  code: Code,
  Table,
  TechCard,
  ...Demos,
}
