# buycoffee.top

- **Framework**: [Next.js](https://nextjs.org/)
- **Deployment**: [Vercel](https://vercel.com)
- **Styling**: [Tailwind CSS](https://tailwindcss.com)

## Payload CMS blog integration

Payload is now embedded into this Next.js app:

- Admin: `/admin`
- REST API: `/api/*`
- Blog data source: Embedded Payload Local API only

### 1. Environment variables

```bash
PAYLOAD_SECRET=replace-with-a-secure-secret
DATABASE_URI=file:./payload.db

# Blog query controls
PAYLOADCMS_COLLECTION=posts
PAYLOADCMS_DEPTH=2
PAYLOADCMS_PAGE_SIZE=100
PAYLOADCMS_INCLUDE_DRAFT=false
```

Notes:

- `PAYLOAD_SECRET` is required in production.
- `DATABASE_URI` uses SQLite by default (`file:./payload.db`).

### 2. Suggested Payload fields

Collection: `posts` (already implemented in `payload/collections/Posts.ts`)

- `title`: string
- `slug`: string
- `category`: string (`Tech` / `Inside` / `Daily`)
- `publishedAt`: date
- `updatedAt`: date (optional)
- `summary` or `excerpt` or `description`: string
- `content` (or `body` / `markdown` / `mdx` / `contentMarkdown` / `contentMdx`): MDX/Markdown string
- `image` (or `coverImage` / `cover` / `heroImage`): image url or media relation

### 3. Run

```bash
pnpm generate:types
pnpm generate:importmap
pnpm dev
```

Then open `http://localhost:3052/admin` and create the first admin user.

For production deployments with SQLite, run migrations before startup:

```bash
pnpm payload migrate
```


<!-- Security scan triggered at 2025-09-02 05:21:25 -->

<!-- Security scan triggered at 2025-09-09 05:44:51 -->

<!-- Security scan triggered at 2025-09-28 15:54:16 -->
