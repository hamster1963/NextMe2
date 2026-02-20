import { promises as fs } from 'node:fs'
import path from 'node:path'
import { getPlaiceholder } from 'plaiceholder'
import sharp from 'sharp'

type PlaceholderColorValue = {
  src: string
  metadata: {
    width: number
    height: number
  }
  placeholder: {
    r: number
    g: number
    b: number
    hex: string
  }
}

type PlaceholderColorCacheEntry = {
  expiresAt: number
  value: PlaceholderColorValue
}

const PLACEHOLDER_COLOR_CACHE_TTL = 5 * 60 * 1000
const PLACEHOLDER_COLOR_CACHE_MAX = 256
const placeholderColorCache = new Map<string, PlaceholderColorCacheEntry>()

function bufferToBase64(buffer: Buffer): string {
  return `data:image/png;base64,${buffer.toString('base64')}`
}

export async function getFileBufferLocal(filepath: string) {
  const normalized = filepath.startsWith('/') ? filepath.slice(1) : filepath
  const realFilepath = normalized.startsWith('media/')
    ? path.join(process.cwd(), 'data', normalized)
    : path.join(process.cwd(), 'public', normalized)

  return fs.readFile(realFilepath)
}

function isRemotePath(filepath: string) {
  return filepath.startsWith('http://') || filepath.startsWith('https://')
}

export async function getFileBuffer(filepath: string) {
  if (isRemotePath(filepath)) {
    const response = await fetch(filepath)
    if (!response.ok) {
      throw new Error(
        `Failed to fetch image: ${filepath} (${response.status} ${response.statusText})`
      )
    }
    return Buffer.from(await response.arrayBuffer())
  }

  return getFileBufferLocal(filepath)
}

export async function getPlaceholderImage(slug: string, filepath: string) {
  try {
    const originalBuffer = await getFileBuffer(filepath)
    const resizedBuffer = await sharp(originalBuffer).resize(5).toBuffer()
    return {
      slug: slug,
      src: filepath,
      placeholder: bufferToBase64(resizedBuffer),
    }
  } catch {
    return {
      slug: slug,
      src: filepath,
      placeholder:
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mOsa2yqBwAFCAICLICSyQAAAABJRU5ErkJggg==',
    }
  }
}

export async function getPlaceholderImageFromUrl(url: string) {
  try {
    const buffer = await getFileBuffer(url)
    const { base64 } = await getPlaiceholder(buffer)
    return {
      src: url,
      placeholder: base64,
    }
  } catch {
    return {
      src: url,
      placeholder:
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mOsa2yqBwAFCAICLICSyQAAAABJRU5ErkJggg==',
    }
  }
}

export async function getPlaceholderBlogImage(filepath: string) {
  try {
    const originalBuffer = await getFileBuffer(filepath)
    const { color, metadata } = await getPlaiceholder(originalBuffer)
    return {
      src: filepath,
      metadata: metadata,
      placeholder: color,
    }
  } catch {
    return {
      src: filepath,
      metadata: {
        width: 1920,
        height: 1080,
      },
      placeholder: {
        r: 255,
        g: 255,
        b: 255,
        hex: '#ffffff',
      },
    }
  }
}

function getDefaultPlaceholderColor(filepath: string): PlaceholderColorValue {
  return {
    src: filepath,
    metadata: {
      width: 1920,
      height: 1080,
    },
    placeholder: {
      r: 255,
      g: 255,
      b: 255,
      hex: '#ffffff',
    },
  }
}

function readPlaceholderColorCache(
  filepath: string
): PlaceholderColorValue | null {
  const cached = placeholderColorCache.get(filepath)
  if (!cached) {
    return null
  }

  if (cached.expiresAt <= Date.now()) {
    placeholderColorCache.delete(filepath)
    return null
  }

  // Refresh insertion order to approximate LRU behavior.
  placeholderColorCache.delete(filepath)
  placeholderColorCache.set(filepath, cached)
  return cached.value
}

function writePlaceholderColorCache(
  filepath: string,
  value: PlaceholderColorValue
) {
  const entry: PlaceholderColorCacheEntry = {
    expiresAt: Date.now() + PLACEHOLDER_COLOR_CACHE_TTL,
    value,
  }

  if (placeholderColorCache.has(filepath)) {
    placeholderColorCache.delete(filepath)
  }
  placeholderColorCache.set(filepath, entry)

  if (placeholderColorCache.size > PLACEHOLDER_COLOR_CACHE_MAX) {
    const oldestKey = placeholderColorCache.keys().next().value
    if (oldestKey) {
      placeholderColorCache.delete(oldestKey)
    }
  }
}

async function resolvePlaceholderColor(
  filepath: string
): Promise<PlaceholderColorValue> {
  const cached = readPlaceholderColorCache(filepath)
  if (cached) {
    return cached
  }

  let value = getDefaultPlaceholderColor(filepath)
  try {
    const originalBuffer = await getFileBuffer(filepath)
    const { metadata, color } = await getPlaiceholder(originalBuffer)
    value = {
      src: filepath,
      metadata: {
        width: metadata.width || 1920,
        height: metadata.height || 1080,
      },
      placeholder: {
        r: color.r,
        g: color.g,
        b: color.b,
        hex: color.hex,
      },
    }
  } catch {}

  writePlaceholderColorCache(filepath, value)
  return value
}

export async function getPlaceholderColorFromLocal(
  slug: string,
  filepath: string
) {
  const placeholderColor = await resolvePlaceholderColor(filepath)
  return {
    slug: slug,
    src: placeholderColor.src,
    metadata: placeholderColor.metadata,
    placeholder: placeholderColor.placeholder,
  }
}

export async function getPlaceholderColorFromBlog(filepath: string) {
  const placeholderColor = await resolvePlaceholderColor(filepath)
  return {
    src: placeholderColor.src,
    placeholder: placeholderColor.placeholder,
  }
}
