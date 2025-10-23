# Docker 构建与部署指南（Docker Build & Deployment Guide）

> 本页目标：说明如何使用 Docker 构建、运行与调试 PowerX 插件，  
> 并与宿主 PowerX 实现网络互通与上下文注入。  
>
> 读者对象：插件开发者 / DevOps / 集成测试人员。

---

## 一、总体设计

PowerX 插件运行环境由三部分组成：

| 组件 | 容器 | 作用 |
|------|------|------|
| PowerX Core | `powerx-core` | 宿主平台，管理 IAM、RBAC、PluginManager、AgentHub |
| 插件后端 | `plugin-backend` | 独立容器，运行 Go 二进制（Gin + GORM） |
| 插件前端 | （可选）随容器提供静态产物 `.output` | 通过宿主反代提供 `/admin` 页面 |

插件与宿主共享网络，通过 **内部反向代理 (/_p/:id/api/...)** 进行通信。

---

## 二、目录结构与 Dockerfile

标准目录：

```

powerx-plugin-base/
├── backend/
│   ├── cmd/plugin/main.go
│   └── Dockerfile
├── web-admin/
│   ├── .output/
│   └── package.json
├── plugin.yaml
└── Makefile

````

---

## 三、后端 Dockerfile 示例（推荐）

```dockerfile
# =========================
# Stage 1: Build
# =========================
FROM golang:1.21-alpine AS builder
WORKDIR /app

# 安装依赖
COPY backend/go.mod backend/go.sum ./
RUN go mod download

# 构建二进制
COPY backend/ .
RUN go build -ldflags="-s -w" -o /app/plugin ./cmd/plugin

# =========================
# Stage 2: Runtime
# =========================
FROM alpine:3.20
WORKDIR /app

# 添加非 root 用户
RUN addgroup -S powerx && adduser -S powerx -G powerx
USER powerx

# 拷贝构建产物
COPY --from=builder /app/plugin /app/plugin

# 默认端口
EXPOSE 8086

# 环境变量
ENV POWERX_DEV_MODE=0
ENV POWERX_BIND_ADDR=":8086"

CMD ["./plugin"]
````

---

## 四、前端构建镜像（可选）

如果需要在 CI 中构建前端 `.output`：

```dockerfile
FROM node:20-alpine AS frontend-builder
WORKDIR /web-admin
COPY web-admin/ .
RUN npm install && npm run build
```

然后可将 `.output` 打包入发布目录或挂载给宿主 PowerX。

---

## 五、本地构建命令

```bash
# 构建镜像
docker build -t powerx-plugin-base:0.1.0 -f backend/Dockerfile .

# 查看镜像
docker images | grep powerx-plugin
```

---

## 六、运行插件容器（独立模式）

```bash
docker run --rm -it \
  -e POWERX_BIND_ADDR=":8086" \
  -e POWERX_DB_DSN="postgres://user:pwd@host:5432/powerx?sslmode=disable" \
  -e POWERX_DB_SCHEMA="px_com_powerx_plugins_base" \
  -e PLUGIN_CTX_HMAC_SECRET="base64-secret" \
  -p 8086:8086 \
  powerx-plugin-base:0.1.0
```

访问健康检查：

```
curl http://localhost:8086/healthz
```

---

## 七、与宿主 PowerX 联调运行

### 1️⃣ 启动宿主 PowerX 容器

```bash
docker network create powerx-net

docker run -d \
  --name powerx-core \
  --network powerx-net \
  -p 8080:8080 \
  artisancloud/powerx:latest
```

### 2️⃣ 启动插件容器

```bash
docker run -d \
  --name powerx-plugin-base \
  --network powerx-net \
  -e POWERX_PLUGIN_ID=com.powerx.plugins.base \
  -e POWERX_DB_DSN=postgres://powerx:pass@powerx-db:5432/powerx?sslmode=disable \
  -e POWERX_DB_SCHEMA=px_com_powerx_plugins_base \
  -e POWERX_CTX_MODE=jwt \
  -e POWERX_CTX_JWKS_URL=http://powerx-core/_p/_internal/jwks \
  -e POWERX_CTX_ISSUER=powerx-auth \
  -e POWERX_CTX_AUDIENCE=powerx-plugin \
  -p 8086:8086 \
  powerx-plugin-base:0.1.0
```

宿主反代路径示例：

```
/_p/com.powerx.plugins.base/api/*  →  http://powerx-plugin-base:8086
```

---

## 八、Docker Compose 部署示例

`docker-compose.yml`：

```yaml
version: '3.9'
services:
  powerx-core:
    image: artisancloud/powerx:latest
    container_name: powerx-core
    ports:
      - "8080:8080"
    networks:
      - powerx-net

  powerx-plugin-base:
    build:
      context: .
      dockerfile: backend/Dockerfile
    container_name: powerx-plugin-base
    environment:
      POWERX_PLUGIN_ID: com.powerx.plugins.base
      POWERX_DB_DSN: postgres://user:pwd@powerx-db:5432/powerx?sslmode=disable
      POWERX_DB_SCHEMA: px_com_powerx_plugins_base
      POWERX_CTX_MODE: jwt
      POWERX_CTX_JWKS_URL: http://powerx-core/_p/_internal/jwks
      POWERX_CTX_ISSUER: powerx-auth
      POWERX_CTX_AUDIENCE: powerx-plugin
    ports:
      - "8086:8086"
    depends_on:
      - powerx-core
    networks:
      - powerx-net

  powerx-db:
    image: postgres:15-alpine
    container_name: powerx-db
    environment:
      POSTGRES_USER: powerx
      POSTGRES_PASSWORD: powerx
      POSTGRES_DB: powerx
    volumes:
      - ./data/db:/var/lib/postgresql/data
    networks:
      - powerx-net

networks:
  powerx-net:
    driver: bridge
```

启动：

```bash
docker compose up -d
```

访问：

```
http://localhost:8080/_p/com.powerx.plugins.base/api/v1/ping
```

---

## 九、环境变量参考

| 环境变量                     | 默认值     | 说明                |
| ------------------------ | ------- | ----------------- |
| `POWERX_PLUGIN_ID`       | -       | 插件唯一标识            |
| `POWERX_BIND_ADDR`       | `:8086` | 插件监听地址            |
| `POWERX_DB_DSN`          | -       | 数据库连接字符串          |
| `POWERX_DB_SCHEMA`       | -       | 插件 schema         |
| `POWERX_CTX_MODE`        | `jwt`   | 上下文模式（jwt / hmac） |
| `POWERX_CTX_JWKS_URL`    | -       | 宿主公钥分发地址          |
| `PLUGIN_CTX_HMAC_SECRET` | -       | HMAC 模式密钥         |
| `POWERX_DEV_MODE`        | `0`     | 开发模式（1 表示绕过验证）    |
| `POWERX_LOG_LEVEL`       | `info`  | 日志级别              |

---

## 十、日志与监控

### 插件容器日志

```bash
docker logs -f powerx-plugin-base
```

### 健康检查

```bash
curl http://localhost:8086/healthz
```

### 宿主采集

宿主 PowerX 自动将插件日志聚合至 ELK / Loki。

---

## 十一、版本与镜像标签策略

遵循 SemVer：

| 阶段   | 标签       | 示例                             |
| ---- | -------- | ------------------------------ |
| 开发快照 | `dev`    | `powerx-plugin-base:dev`       |
| 测试版  | `rc`     | `powerx-plugin-base:0.1.0-rc1` |
| 稳定版  | 版本号      | `powerx-plugin-base:0.1.0`     |
| 最新版  | `latest` | `powerx-plugin-base:latest`    |

构建命令示例：

```bash
VERSION=0.1.0 make docker
docker push registry.powerx.io/powerx-plugin-base:0.1.0
```

---

## 十二、安全建议

✅ 使用非 root 用户运行容器。
✅ 禁止将宿主目录挂载到插件容器（除数据卷）。
✅ 使用网络 `bridge` 或 `overlay`，不暴露内网端口。
✅ 所有通信使用 HTTPS（若部署在公网）。
✅ 镜像构建前执行漏洞扫描（Trivy / Grype）。
✅ 使用 Cosign 对镜像进行签名与验签。

---

## 十三、调试技巧

| 命令                                          | 说明        |
| ------------------------------------------- | --------- |
| `docker exec -it powerx-plugin-base sh`     | 进入容器      |
| `curl -v localhost:8086/v1/ping`            | 验证服务可用性   |
| `docker compose logs -f powerx-plugin-base` | 查看实时日志    |
| `docker compose restart powerx-plugin-base` | 热重启插件     |
| `docker system prune -f`                    | 清理无用镜像与缓存 |

---

## 十四、CI/CD 与发布管道

推荐多阶段流水线：

```
Build → Lint → Test → Docker Build → Trivy Scan → Sign → Push → Release
```

GitHub Actions 示例：

```yaml
- name: Build Docker
  run: docker build -t registry.powerx.io/powerx-plugin-base:${{ github.ref_name }} -f backend/Dockerfile .

- name: Security Scan
  run: trivy image registry.powerx.io/powerx-plugin-base:${{ github.ref_name }}

- name: Push
  run: docker push registry.powerx.io/powerx-plugin-base:${{ github.ref_name }}
```

---

## 十五、总结

* 每个插件建议自带独立 Dockerfile；
* 宿主与插件通过内部网络互通；
* 开发调试阶段可使用 HMAC，生产应切换 JWT；
* 插件日志与健康状态由宿主统一采集；
* 镜像安全、权限最小化、配置可注入是部署三大原则。

---

## 十六、关联文档

| 模块          | 文档                                                                     |
| ----------- | ---------------------------------------------------------------------- |
| 构建与任务说明     | [makefile_tasks.md](../developer/makefile_tasks.md)                    |
| 插件打包规范      | [release_package.md](./release_package.md)                             |
| 安全加固指南      | [security_hardening.md](./security_hardening.md)                       |
| PowerX 通信协议 | [../contract/powerx_integration.md](../contract/powerx_integration.md) |

---

## 十七、下一步阅读

* ⚙️ [环境变量配置说明](./env_vars.md)
* 🧩 [本地调试与联调指南](./local_debug.md)
