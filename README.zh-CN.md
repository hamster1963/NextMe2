# NextMe Blog（中文文档）

English README: [README.md](./README.md)

## Docker Compose 一键部署

1. 编辑 `docker-compose.yml`：

- `PAYLOAD_SECRET`（设置为安全值）

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

数据持久化：

- SQLite 会通过 Compose volume 持久化到本地 `./data` 目录
