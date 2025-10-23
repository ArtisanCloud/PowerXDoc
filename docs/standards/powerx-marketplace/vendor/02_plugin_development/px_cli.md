# `px` 插件开发 CLI 说明

`px` 是 PowerX 插件生态的官方命令行工具，用于：

- 校验与发布能力契约
- 校验/打包插件 manifest
- 后续扩展：传输适配器生成、沙箱测试、安全扫描等

本文介绍如何编译、配置及常用命令，建议在执行任何测试流程前先熟悉本工具。

---

## 1. 工程结构 & 依赖

- 入口文件：`backend/cmd/px/main.go`
- 命令树：`backend/internal/cli/px`
  - `contracts/`：能力契约相关命令
  - `plugin/manifest.go`：manifest 校验命令
  - `plugin/package.go`：打包命令
- 依赖：Go 1.23+（go.mod 指定 go1.23，toolchain go1.24.5），使用 Cobra (`github.com/spf13/cobra`)

---

## 2. 编译与安装

### 2.1 本地调试（推荐）

```bash
cd backend
go build -o bin/px ./cmd/px
```

生成的 `bin/px` 会留在当前项目，便于开发调试；执行命令时显式指定配置：

```bash
./bin/px --config etc/config.yaml contract validate ./fixtures/contracts/payments_transfer_v1.yaml
```

### 2.2 安装到 `$GOBIN`

确认测试通过后，可安装到全局可执行目录：

```bash
cd backend
go install ./cmd/px
```

安装后可直接通过 `px ...` 调用；如需切换配置，可使用 `--config` 指定路径或设置 `CONFIG_PATH` 环境变量。

---

## 3. 运行时配置

- 默认配置文件：`backend/etc/config.yaml`
  - 包含数据库、存储、日志、插件特性开关等
- 命令行参数：
  - `--config`: 覆盖配置路径
  - `--version`: 输出版本信息后退出
- `px` 启动时会初始化：
  - 日志实例（默认为生产模式，`--config` 中 log.level=debug 时采用开发模式）
  - 数据库连接（PostgreSQL）
  - 审计记录器

---

## 4. 常用命令

### 4.1 契约治理

| 命令 | 说明 |
|------|------|
| `px contract validate <file>` | 校验契约并输出 diff 分类、最新版本等信息 |
| `px contract publish <file>`  | 发布契约版本（严格遵循 SemVer） |

契约文件应使用 YAML/JSON 并包含 `capability_id`、`version`、`schema_io` 等字段。发布前需确保数据库连接和审计配置有效。

### 4.2 Manifest & Packaging

| 命令 | 说明 |
|------|------|
| `px plugin manifest validate --manifest <path>` | 校验 `plugin.yaml` 清单结构、传输声明、权限等 |
| `px plugin package --manifest <path> --workspace <dir> --out <dir>` | 将 manifest 与工作区内容打包为 `.pxp` 产物并输出 SHA256 digest |

打包生成的产物遵循确定性归档：相同 manifest + workspace 内容将产生相同 digest，便于内容寻址存储与重复构建校验。

> **提示**：后续会新增 `px plugin transport ...`、`px plugin security ...` 等命令，结构已预留在 `internal/cli/px/plugin/` 目录。

---

## 5. 退出与资源释放

所有命令执行完毕后会调用 `Runtime.Close()` 释放数据库连接与 logger；如命令异常退出，也会尝试同步关闭资源。

---

## 6. 常见问题

1. **提示缺少运行时**  
   - 是否通过 `px ...` 或 `./bin/px ...` 调用？确保不是直接执行子命令二进制。
2. **数据库连接失败**  
   - 检查 `etc/config.yaml` 的 `database.dsn`，或通过环境变量 `DB_DSN` 覆盖。
3. **构建失败：缺少依赖**  
   - 在 `backend/` 目录执行 `go mod tidy` & `go mod download`；若网络受限，可设置 `GOPROXY`。

---

了解 `px` 后，可继续参考《Testing_and_Sandbox.md》完成完整的 manifest 与 packaging 测试流程。***
