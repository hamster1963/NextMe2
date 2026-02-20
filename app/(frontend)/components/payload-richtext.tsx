import type {
  DefaultNodeTypes,
  DefaultTypedEditorState,
  SerializedBlockNode,
} from '@payloadcms/richtext-lexical'
import {
  type JSXConvertersFunction,
  RichText as PayloadRichText,
} from '@payloadcms/richtext-lexical/react'
import { highlight } from 'sugar-high'
import { slugify } from '../lib/slugify'

type CodeBlockFields = {
  blockType: 'codeBlock'
  code?: string
  language?: string
}

type MediaBlockFields = {
  blockType: 'mediaBlock'
  media?: unknown
}

type BannerBlockFields = {
  blockType: 'banner'
  style?: 'info' | 'success' | 'warning' | 'error'
  content?: unknown
}

type NodeTypes =
  | DefaultNodeTypes
  | SerializedBlockNode<CodeBlockFields | MediaBlockFields | BannerBlockFields>

function collectNodeText(node: unknown): string {
  if (!node || typeof node !== 'object') {
    return ''
  }

  const current = node as {
    text?: unknown
    children?: unknown
  }

  const selfText = typeof current.text === 'string' ? current.text : ''
  const childrenText = Array.isArray(current.children)
    ? current.children.map((child) => collectNodeText(child)).join('')
    : ''

  return `${selfText}${childrenText}`
}

function resolveMediaUrl(value: unknown): string | undefined {
  if (!value) {
    return undefined
  }

  if (typeof value === 'string') {
    return value
  }

  if (typeof value === 'object') {
    const maybeUrl = (value as { url?: unknown }).url
    if (typeof maybeUrl === 'string' && maybeUrl.length > 0) {
      return maybeUrl
    }

    const maybeFilename = (value as { filename?: unknown }).filename
    if (typeof maybeFilename === 'string' && maybeFilename.length > 0) {
      return maybeFilename
    }
  }

  return undefined
}

function resolveMediaAlt(value: unknown): string {
  if (!value || typeof value !== 'object') {
    return 'Embedded media'
  }

  const maybeAlt = (value as { alt?: unknown }).alt
  if (typeof maybeAlt === 'string' && maybeAlt.trim().length > 0) {
    return maybeAlt.trim()
  }

  return 'Embedded media'
}

function isEditorState(value: unknown): value is Record<string, any> {
  return Boolean(value) && typeof value === 'object' && 'root' in value
}

function bannerStyles(style: string | undefined) {
  switch (style) {
    case 'success':
      return 'border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200'
    case 'warning':
      return 'border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200'
    case 'error':
      return 'border-rose-200 bg-rose-50 text-rose-900 dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-200'
    default:
      return 'border-sky-200 bg-sky-50 text-sky-900 dark:border-sky-800 dark:bg-sky-950/40 dark:text-sky-200'
  }
}

const converters: JSXConvertersFunction<NodeTypes> = ({
  defaultConverters,
}) => ({
  ...defaultConverters,
  heading: ({ node, nodesToJSX, parent }) => {
    const text = collectNodeText(node).trim()
    const id = text.length > 0 ? slugify(text) : undefined
    const children = nodesToJSX({
      nodes: Array.isArray(node.children) ? node.children : [],
      parent,
    })

    if (node.tag === 'h1') {
      return <h1 id={id}>{children}</h1>
    }
    if (node.tag === 'h3') {
      return <h3 id={id}>{children}</h3>
    }

    return <h2 id={id}>{children}</h2>
  },
  blocks: {
    banner: ({ node }) => {
      const content = node.fields?.content
      const style = bannerStyles(node.fields?.style)
      if (!isEditorState(content)) {
        return null
      }

      return (
        <aside className={`my-6 rounded-xl border px-4 py-3 ${style}`}>
          <PayloadRichText data={content as DefaultTypedEditorState} />
        </aside>
      )
    },
    codeBlock: ({ node }) => {
      const language = node.fields?.language || 'plaintext'
      const code = node.fields?.code || ''
      const highlightedCode = highlight(code)

      return (
        <pre className="my-6 overflow-x-auto rounded-xl px-4 py-3">
          <code
            className={`language-${language}`}
            dangerouslySetInnerHTML={{ __html: highlightedCode }}
          />
        </pre>
      )
    },
    mediaBlock: ({ node }) => {
      const src = resolveMediaUrl(node.fields?.media)
      if (!src) {
        return null
      }

      return (
        <figure className="my-6 overflow-hidden rounded-xl">
          <img
            alt={resolveMediaAlt(node.fields?.media)}
            className="w-full rounded-xl object-cover"
            src={src}
            loading="lazy"
          />
        </figure>
      )
    },
  },
})

type PayloadRichTextProps = {
  data: DefaultTypedEditorState | Record<string, any>
}

export default function PayloadRichTextContent({ data }: PayloadRichTextProps) {
  return (
    <PayloadRichText
      className="prose prose-neutral prose-quoteless dark:prose-invert text-[15px]"
      converters={converters}
      data={data as DefaultTypedEditorState}
    />
  )
}
