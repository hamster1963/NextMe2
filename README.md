# NextMe Blog

简体中文文档: [README.zh-CN.md](./README.zh-CN.md)

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

Data persistence:

- SQLite file is persisted to local `./data` via compose volume.

If GHCR package is private:

```bash
docker login ghcr.io
```
