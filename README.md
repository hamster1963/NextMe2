# NextMe Blog

Chinese docs: [README.zh-CN.md](./README.zh-CN.md)

## One-command deployment with Docker Compose

1. Edit `docker-compose.yml`:

- `PAYLOAD_SECRET` (set a secure value)

2. Start:

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
- After creating the first admin account, configure `Globals -> Site Settings` and then `/setup` will redirect back to `/`.

Recommended `Globals -> Site Settings` fields:

- Basic: `siteName`, `siteUrl`, `description`
- Profile: `profileName`, `profileTagline`, `introLines`, `profileAvatar`
- Navigation: `navHomeLabel`, `navBlogLabel`
- Blog sections: `blogTechLabel` / `blogInsideLabel` / `blogDailyLabel` and their `...Description` fields
- Date/Time: `dateLocale`, `timeZone`
- Footer: `footerBuiltWithText`, link labels/URLs, owner label/URL, `footerCopyrightStartYear`, `footerShowOnHome`

Data persistence:

- SQLite file is persisted to local `./data` via compose volume.
- Uploaded media files are persisted to `./data/media`.
- Payload will block deleting media that is still referenced by posts or profile avatar.
- GraphQL endpoints are disabled; frontend content rendering uses embedded Payload Local API.

Optional backup / restore:

```bash
# Backup
docker compose stop
./scripts/backup-data.sh ./data ./backups
docker compose up -d

# Restore
docker compose stop
./scripts/restore-data.sh ./backups/<backup-file>.tar.gz ./data
docker compose up -d
```
