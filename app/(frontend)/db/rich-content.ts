export type TocHeading = {
  level: number
  id: string
  text: string
}

function collectText(node: unknown): string {
  if (!node || typeof node !== 'object') {
    return ''
  }

  const current = node as {
    text?: unknown
    children?: unknown
  }

  const selfText = typeof current.text === 'string' ? current.text : ''
  const childrenText = Array.isArray(current.children)
    ? current.children.map((child) => collectText(child)).join('')
    : ''

  return `${selfText}${childrenText}`
}

function traverse(
  node: unknown,
  onNode: (node: Record<string, any>) => void
): void {
  if (!node || typeof node !== 'object') {
    return
  }

  const current = node as Record<string, any>
  onNode(current)

  if (Array.isArray(current.children)) {
    for (const child of current.children) {
      traverse(child, onNode)
    }
  }
}

export function extractHeadingsFromRichContent(
  richContent: Record<string, any> | undefined,
  slugify: (text: string) => string
): TocHeading[] {
  if (!richContent || typeof richContent !== 'object') {
    return []
  }

  const rootChildren = richContent.root?.children
  if (!Array.isArray(rootChildren)) {
    return []
  }

  const headings: TocHeading[] = []
  for (const child of rootChildren) {
    traverse(child, (node) => {
      if (node.type !== 'heading') {
        return
      }

      const text = collectText(node).trim()
      if (!text) {
        return
      }

      const tag = typeof node.tag === 'string' ? node.tag : 'h2'
      const parsedLevel = Number(tag.replace('h', ''))
      const level = Number.isFinite(parsedLevel) ? parsedLevel : 2

      headings.push({
        level,
        id: slugify(text),
        text,
      })
    })
  }

  return headings
}
