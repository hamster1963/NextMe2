import fs from 'node:fs'
import path from 'node:path'
import { DatabaseSync } from 'node:sqlite'

const DEFAULT_DATABASE_URI = process.env.DATABASE_URI || 'file:./payload.db'
const MIGRATIONS_DIR = path.resolve(process.cwd(), 'migrations')

function resolveSqliteFilePath(databaseURI) {
  if (!databaseURI.startsWith('file:')) {
    return null
  }

  const rawPath = databaseURI.slice('file:'.length)
  if (!rawPath) {
    return null
  }

  return path.isAbsolute(rawPath)
    ? rawPath
    : path.resolve(process.cwd(), rawPath)
}

function isMissingTableError(error) {
  return error instanceof Error && /no such table/i.test(error.message || '')
}

function readMigrationNamesFromFiles() {
  if (!fs.existsSync(MIGRATIONS_DIR)) {
    return []
  }

  return fs
    .readdirSync(MIGRATIONS_DIR)
    .filter((file) => file.endsWith('.ts') && file !== 'index.ts')
    .map((file) => path.basename(file, '.ts'))
    .sort()
}

function hasAppTables(database) {
  const rows = database
    .prepare("SELECT name FROM sqlite_master WHERE type = 'table'")
    .all()
  const tableSet = new Set(
    rows
      .map((row) => (row && typeof row.name === 'string' ? row.name : null))
      .filter(Boolean)
  )

  return tableSet.has('users') || tableSet.has('posts')
}

function backfillMigrationBaseline(database) {
  const migrationNames = readMigrationNamesFromFiles()
  if (migrationNames.length === 0) {
    return
  }

  const rows = database
    .prepare('SELECT name, batch FROM payload_migrations')
    .all()
  const hasDevMarker = rows.some((row) => Number(row.batch) === -1)
  const appliedMigrations = rows.filter((row) => Number(row.batch) > 0)
  const shouldBackfill =
    hasAppTables(database) && (hasDevMarker || appliedMigrations.length === 0)

  if (!shouldBackfill) {
    return
  }

  database.exec('BEGIN;')
  try {
    if (hasDevMarker) {
      database.exec('DELETE FROM payload_migrations WHERE batch = -1;')
    }

    const insert = database.prepare(
      'INSERT INTO payload_migrations (name, batch) SELECT ?, 1 WHERE NOT EXISTS (SELECT 1 FROM payload_migrations WHERE name = ?);'
    )

    for (const migrationName of migrationNames) {
      insert.run(migrationName, migrationName)
    }

    database.exec('COMMIT;')
  } catch (error) {
    database.exec('ROLLBACK;')
    throw error
  }
}

function reconcileMigrationState(databaseURI) {
  const filePath = resolveSqliteFilePath(databaseURI)
  if (!filePath || !fs.existsSync(filePath)) {
    return
  }

  const database = new DatabaseSync(filePath)
  try {
    backfillMigrationBaseline(database)
  } catch (error) {
    if (!isMissingTableError(error)) {
      throw error
    }
  } finally {
    database.close()
  }
}

reconcileMigrationState(DEFAULT_DATABASE_URI)
