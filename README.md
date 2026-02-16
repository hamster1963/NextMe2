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
PAYLOAD_DB_PUSH=true

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

For stricter production schema control, set `PAYLOAD_DB_PUSH=false` and run migrations before startup:

```bash
pnpm payload migrate
```

## Docker image (GitHub Actions + GHCR)

This repo now includes:

- `Dockerfile`
- `docker-compose.yml`
- `.github/workflows/docker-image.yml`

Workflow behavior:

- On push to `main` / `master`: build and push image to `ghcr.io/<owner>/<repo>`
- On tag `vX.Y.Z`: build and push semver images
- On pull request: build only (no push)

Important:

- If you want others to pull the image directly, set the GHCR package visibility to **public**.

When pushing a semver tag like `v1.2.3`, workflow will publish:

- `ghcr.io/<owner>/<repo>:v1.2.3`
- `ghcr.io/<owner>/<repo>:1.2.3`
- `ghcr.io/<owner>/<repo>:1.2`
- `ghcr.io/<owner>/<repo>:1`
- `ghcr.io/<owner>/<repo>:sha-<commit>`
- `latest` (only from default branch pushes)

### Release rules (SemVer)

- `patch` (`v1.2.4`): bug fixes only, no behavior-breaking changes.
- `minor` (`v1.3.0`): backward-compatible new features.
- `major` (`v2.0.0`): breaking changes.

### Release commands

```bash
# 1) Ensure main is up to date
git checkout main
git pull --ff-only origin main

# 2) Create annotated tag (example: minor release)
git tag -a v1.3.0 -m "release: v1.3.0"

# 3) Push tag to trigger image build/push
git push origin v1.3.0
```

## One-command deployment with Docker Compose

1. Prepare env file:

```bash
cp .env.docker.example .env
```

2. Edit `.env`:

- Set `IMAGE` to your published image (default: `ghcr.io/hamster1963/nextme2:latest`)
- Set secure `PAYLOAD_SECRET` and `PREVIEW_SECRET`

3. Start:

```bash
docker compose pull
docker compose up -d
```

Then open:

- Site: `http://localhost:3052`
- Admin: `http://localhost:3052/admin`

First-run flow is automatic:

- On first visit, `/` will redirect to `/setup`.
- `/setup` guides the user to open `/admin` and create the first admin account.
- After the first admin account is created, `/setup` will automatically redirect back to `/`.

Data persistence:

- SQLite file is persisted to local `./data` via compose volume.

If GHCR package is private:

```bash
docker login ghcr.io
```


<!-- Security scan triggered at 2025-09-02 05:21:25 -->

<!-- Security scan triggered at 2025-09-09 05:44:51 -->

<!-- Security scan triggered at 2025-09-28 15:54:16 -->
