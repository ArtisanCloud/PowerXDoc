# PowerXPlugin Repository Memory

> Version: 0.1.0 · Maintainers: Plugin Steward Team  
> Scope: `ArtisanCloud/PowerXPlugin`

## Directory Expectations

- 仓库根目录包含：
  - `backend/`
    - `cmd/`（当前存在 `plugin/`, `database/`, `manifestcheck/`, `tools/`）
    - `internal/`, `etc/`, `tests/`, `bin/`, `docs/`, `migrations/`, `logs/`
    - `go.mod`, `go.sum`, 构建缓存 `.cache/`, `.gocache/`, `.gopath/`
  - `web-admin/` — Nuxt 前端，包含 `app/`, `i18n/`, `tests/`, `node_modules/` 等
  - `config/`, `contracts/`, `make-files/`, `build/`, `dist/`, `scripts/`, `specs/`, `docs/`
  - 根目录 `Makefile`, `plugin.yaml`, `.specify/`, `.codex/` 等配置目录
- 任何新增目录需同步更新此记忆和对应 ruleset。

## CLI 约定

- 所有子命令通过 `backend/cmd/plugin/main.go` 注册，参数解析集中在 `dev_flags.go` 等配置文件。
- CLI 仅负责构建工件、生成报告并调用 PowerX Core Dev API；任何运行态均由 Core 执行。
- `px-plugin dev --watch` 必须支持 `--tenant-id`、`--watch-dirs`、`--keep-artifacts` 等参数，并输出 JSON 日志。

## Seeds & Docmap

- Usecase seeds 路径：`docs/usecases-seeds/powerx-plugin/<layer>/<domain>/DOC_ID.md`。
- docmap `repo` 值必须是 `powerx-plugin`，并校准 `usecase_seed_root`。
- 与 Core 联调的 API（如 `/internal/dev/plugins/register`）须在 seed 中引用 `PX-DEV-HOTLOAD-001` 约定。

## 依赖规则集

- 核心入口：`.specify/memory/rulesets/powerx-plugin/project.yaml`
- 后端 CRUD：
  - `.specify/memory/rulesets/powerx-plugin/crud_http.yaml`
  - `.specify/memory/rulesets/powerx-plugin/crud_grpc.yaml`
  - `.specify/memory/rulesets/powerx-plugin/sts.yaml`
  - `.specify/memory/rulesets/powerx-plugin/crud/*.yaml`（api\_rest、service、repository、sdk\_go、transport\_grpc 等）
- 前端 Nuxt 规范：
  - `.specify/memory/rulesets/powerx-plugin/frontend_admin.yaml`
  - `.specify/memory/rulesets/powerx-plugin/crud/frontend/*.yaml`（nuxt\_pages、nuxt\_components、nuxt\_tests 等）

> 变更目录或 CLI 契约时，请同步刷新本 memory 与相关 ruleset 文件，确保 Speckit 模板读取到最新约束。
