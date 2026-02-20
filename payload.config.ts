import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { sqliteAdapter } from '@payloadcms/db-sqlite'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { buildConfig } from 'payload'
import sharp from 'sharp'
import { migrations } from './migrations/index.ts'
import { Categories } from './payload/collections/Categories.ts'
import { Comments } from './payload/collections/Comments.ts'
import { Media } from './payload/collections/Media.ts'
import { Posts } from './payload/collections/Posts.ts'
import { Users } from './payload/collections/Users.ts'
import { SiteSettings } from './payload/globals/SiteSettings.ts'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

const db = sqliteAdapter({
  client: {
    url: process.env.DATABASE_URI || 'file:./payload.db',
  },
  push: process.env.PAYLOAD_PUSH_SCHEMA === 'true',
  prodMigrations: migrations,
})

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
    livePreview: {
      breakpoints: [
        {
          label: 'Mobile',
          name: 'mobile',
          width: 375,
          height: 667,
        },
        {
          label: 'Tablet',
          name: 'tablet',
          width: 768,
          height: 1024,
        },
        {
          label: 'Desktop',
          name: 'desktop',
          width: 1440,
          height: 900,
        },
      ],
    },
  },
  collections: [Users, Categories, Media, Posts, Comments],
  globals: [SiteSettings],
  editor: lexicalEditor(),
  graphQL: {
    disable: true,
  },
  secret: process.env.PAYLOAD_SECRET || 'dev-payload-secret',
  db,
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  sharp,
})
