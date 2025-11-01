# PowerXMarketplace Repository Memory

> Version: 0.1.0 · Maintainers: Marketplace Steward Team  
> Scope: `ArtisanCloud/PowerXMarketplace`

## Directory Expectations

- 仓库根目录包含：
  - `backend/` — 市场审核、上架、结算服务，目录结构包括：
    - `cmd/`（当前存在 `px/`, `marketd/`, `database/`）
    - `api/`, `internal/`, `migrations/`, `contracts/`, `etc/`, `scripts/`, `tests/`, `tmp/`
    - `Makefile`, `go.mod`, `go.sum`, 以及 `.gocache/`, `.idea/` 等辅助目录
  - `web-admin/` — Nuxt/VitePress 前端，含 `app/`, `scripts/`, `tests/`, `node_modules/` 等
  - `docs/`, `sdk/`, `make-files/`, `scripts/`, `shared/`, `specs/`, `tmp/`
  - 根目录 `Makefile`, `.specify/`, `.codex/`, `.dockerignore`, `.env.example` 等配置文件
- 新增目录或结构调整需同步更新本记忆与相关 ruleset。

## CLI / 工具

- 若包含 CLI，命名采用 `px-market`，入口放置于 `cmd/px-market/`。
- CLI 需实现统一的版本输出与 `--ci` 参数，并对接审计日志。

## Seeds & Docmap

- Usecase seeds 统一存放于 `docs/usecases-seeds/powerx-marketplace/<layer>/<domain>/DOC_ID.md`。
- docmap `repo` 值：`powerx-marketplace`，对应 `docs/_data/repos.yaml` 中的 metadata。
- 与 Pure Push 分发脚本协作时，保持 `_from_hub` 路径只读。

## 依赖规则集

- 核心入口：`.specify/memory/rulesets/powerx-marketplace/project.yaml`
- 后端服务：
  - `.specify/memory/rulesets/powerx-marketplace/api_rest.yaml`
  - `.specify/memory/rulesets/powerx-marketplace/service.yaml`
  - `.specify/memory/rulesets/powerx-marketplace/repository.yaml`
  - `.specify/memory/rulesets/powerx-marketplace/model.yaml`
  - `.specify/memory/rulesets/powerx-marketplace/migration.yaml`
  - `.specify/memory/rulesets/powerx-marketplace/di.yaml`
  - `.specify/memory/rulesets/powerx-marketplace/test.yaml`
- 前端运营控制台（如有）：
  - `.specify/memory/rulesets/powerx-marketplace/frontend/*.yaml`（nuxt\_pages、nuxt\_components、nuxt\_tests 等）

> 仓库结构或 CLI 约定调整时，请更新本 memory 以及相应 ruleset，确保所有新生成的文档与任务遵循一致的规范。
