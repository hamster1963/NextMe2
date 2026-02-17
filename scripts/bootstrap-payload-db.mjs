import fs from 'node:fs'
import path from 'node:path'
import { DatabaseSync } from 'node:sqlite'
import { pathToFileURL } from 'node:url'
import { getPayload } from 'payload'

const configPath = process.env.PAYLOAD_CONFIG_PATH
  ? path.resolve(process.cwd(), process.env.PAYLOAD_CONFIG_PATH)
  : path.resolve(process.cwd(), 'payload.config.ts')

const configModule = await import(pathToFileURL(configPath).toString())
const config = configModule.default || configModule

function resolveSQLitePath() {
  const raw =
    process.env.DATABASE_URI || process.env.DATABASE_URL || 'file:./payload.db'

  if (!raw.startsWith('file:')) {
    return null
  }

  const maybePath = raw.replace(/^file:/, '')
  const normalizedPath = maybePath.startsWith('//')
    ? maybePath.slice(2)
    : maybePath

  return path.resolve(process.cwd(), normalizedPath)
}

function hasColumn(db, table, column) {
  const rows = db.prepare(`PRAGMA table_info(${table})`).all()
  return rows.some((row) => row.name === column)
}

function extractDuplicateIndexName(error) {
  if (!error || typeof error !== 'object') {
    return undefined
  }

  if (typeof error.message === 'string') {
    const match = error.message.match(
      /index\s+([a-zA-Z0-9_]+)\s+already exists/i
    )
    if (match?.[1]) {
      return match[1]
    }
  }

  return extractDuplicateIndexName(error.cause)
}

function dropIndexIfExists(indexName) {
  const dbPath = resolveSQLitePath()
  if (!dbPath || !fs.existsSync(dbPath)) {
    return false
  }

  const db = new DatabaseSync(dbPath)
  try {
    db.exec(`DROP INDEX IF EXISTS ${indexName}`)
    return true
  } finally {
    db.close()
  }
}

function toLexicalDocument(text) {
  return {
    root: {
      type: 'root',
      format: '',
      indent: 0,
      version: 1,
      children: [
        {
          type: 'paragraph',
          format: '',
          indent: 0,
          version: 1,
          children: text
            ? [
                {
                  type: 'text',
                  detail: 0,
                  format: 0,
                  mode: 'normal',
                  style: '',
                  text,
                  version: 1,
                },
              ]
            : [],
          direction: null,
          textFormat: 0,
          textStyle: '',
        },
      ],
      direction: null,
    },
  }
}

function isLexicalJSON(rawValue) {
  if (typeof rawValue !== 'string' || rawValue.trim().length === 0) {
    return false
  }

  try {
    const parsed = JSON.parse(rawValue)
    return (
      Boolean(parsed) &&
      typeof parsed === 'object' &&
      'root' in parsed &&
      Array.isArray(parsed.root?.children)
    )
  } catch {
    return false
  }
}

function normalizeLegacyPostContent() {
  const dbPath = resolveSQLitePath()
  if (!dbPath || !fs.existsSync(dbPath)) {
    return
  }

  const db = new DatabaseSync(dbPath)

  try {
    const postsTable = db
      .prepare(
        "SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'posts'"
      )
      .get()
    if (!postsTable || !hasColumn(db, 'posts', 'content')) {
      return
    }

    const rows = db
      .prepare('SELECT id, content FROM posts WHERE content IS NOT NULL')
      .all()
    if (!rows.length) {
      return
    }

    const update = db.prepare('UPDATE posts SET content = ? WHERE id = ?')

    for (const row of rows) {
      const rawValue =
        typeof row.content === 'string' ? row.content.trim() : undefined
      if (!rawValue || isLexicalJSON(rawValue)) {
        continue
      }

      const lexicalValue = JSON.stringify(toLexicalDocument(rawValue))
      update.run(lexicalValue, row.id)
    }
  } finally {
    db.close()
  }
}

async function bootstrapPayload() {
  let payload
  let retries = 0

  while (!payload) {
    try {
      payload = await getPayload({ config })
    } catch (error) {
      const duplicateIndexName = extractDuplicateIndexName(error)
      if (
        !duplicateIndexName ||
        retries >= 12 ||
        !dropIndexIfExists(duplicateIndexName)
      ) {
        throw error
      }

      retries += 1
    }
  }

  normalizeLegacyPostContent()
  await payload.destroy()
}

await bootstrapPayload()
