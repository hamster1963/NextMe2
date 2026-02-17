import { promises as fs } from 'node:fs'
import path from 'node:path'
import { getPlaiceholder } from 'plaiceholder'
import sharp from 'sharp'

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

export async function getPlaceholderColorFromLocal(
  slug: string,
  filepath: string
) {
  try {
    const originalBuffer = await getFileBuffer(filepath)
    const { metadata, color } = await getPlaiceholder(originalBuffer)
    return {
      slug: slug,
      src: filepath,
      metadata: metadata,
      placeholder: color,
    }
  } catch {
    return {
      slug: slug,
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

export async function getPlaceholderColorFromBlog(filepath: string) {
  try {
    const originalBuffer = await getFileBuffer(filepath)
    const { color } = await getPlaiceholder(originalBuffer)
    return {
      src: filepath,
      placeholder: color,
    }
  } catch {
    return {
      src: filepath,
      placeholder: {
        r: 255,
        g: 255,
        b: 255,
        hex: '#ffffff',
      },
    }
  }
}
