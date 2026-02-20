# NextMe Blog（中文文档）

English README: [README.md](./README.md)

## Docker Compose 一键部署

1. 编辑 `docker-compose.yml`：

- `PAYLOAD_SECRET`（设置为安全值）
- `mem_limit` / `NODE_OPTIONS`（按机器配置调节，默认 Node 堆上限为 768MB）

2. 启动服务：

```bash
docker compose pull
docker compose up -d
```

然后访问：

- 站点：`http://localhost:3052`
- 后台：`http://localhost:3052/admin`

首启流程（自动）：

- 第一次访问 `/` 会自动跳转到 `/setup`
- `/setup` 会引导你进入 `/admin` 创建第一个管理员账号
- 创建管理员后，到 `Globals -> Site Settings` 配置站点地址，随后 `/setup` 会自动跳回 `/`

建议优先配置 `Globals -> Site Settings`：

- 基础：`siteName`、`siteUrl`、`description`
- 个人信息：`profileName`、`profileTagline`、`introLines`、`profileAvatar`
- 导航：`navHomeLabel`、`navBlogLabel`
- 博客分栏：`blogTechLabel` / `blogInsideLabel` / `blogDailyLabel` 及对应 `...Description`
- 时间格式：`dateLocale`、`timeZone`
- 页脚：`footerBuiltWithText`、链接文案/URL、作者文案/URL、`footerCopyrightStartYear`、`footerShowOnHome`

数据持久化：

- SQLite 会通过 Compose volume 持久化到本地 `./data` 目录
- 上传的媒体文件会持久化到 `./data/media`
- Payload 会阻止删除仍被文章或站点头像引用的媒体，降低误删风险
- GraphQL 已禁用，前台内容渲染走嵌入式 Payload Local API

可选：备份与恢复

```bash
# 备份
docker compose stop
./scripts/backup-data.sh ./data ./backups
docker compose up -d

# 恢复
docker compose stop
./scripts/restore-data.sh ./backups/<backup-file>.tar.gz ./data
docker compose up -d
```
