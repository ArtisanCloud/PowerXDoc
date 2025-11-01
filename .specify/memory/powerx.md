# PowerX Repository Memory

> Version: 0.1.0 · Maintainers: Docs Steward Team  
> Scope: `ArtisanCloud/PowerX`（Core + Web Admin）

## Directory Expectations

- 仓库根目录包含：
  - `backend/` — Go 服务主体，目录结构固定为：
    - `cmd/`（当前存在 `app/`, `database/`, `media_tool/`, `perm_gen/`, `tools/` 等入口）
    - `internal/`, `pkg/`, `config/`, `domain/`, `extensions/`, `plugins/`, `scripts/`, `tests/`
    - `api/`, `deploy/`, `integration/`, `reports/`, `storage/` 等支持性目录
  - `web-admin/` — Nuxt 4 + Nuxt UI 3.3.x 前端工程，须遵循前端规则集
  - `ci/`, `make_files/`, `docs/`, `tmp/` 等辅助目录
- 根目录保留 `Makefile` 作为统一工程入口；CI 任务需映射到对应 make 目标。

## CLI 约定

- 主运行入口位于 `backend/cmd/app/`（输出二进制 `app`），后续若拆分为 `cmd/px/` 等需同步更新此记忆。
- 其它工具型命令保存在 `backend/cmd/<tool>/`，命名需体现用途（如 `database`, `media_tool`, `perm_gen`）。
- 所有 CLI 须实现 `--version`、`--help`、`--ci`（或 `PX_CI=1`），版本信息包含 git commit 与构建时间。

## Docs & Seeds 联动

- 所有服务层 usecase seeds 存放于 `docs/usecases-seeds/powerx/<layer>/<domain>/`。
- docmap `repo` 字段应为 `powerx`，对应 `docs/_data/repos.yaml` 中的元数据。
- 当目录结构调整时，须同步更新 `rulesets/powerx/project.yaml` 与相关 seeds。

## 依赖规则集

- 核心入口：`.specify/memory/rulesets/powerx/project.yaml`
- 服务端 CRUD：
  - `.specify/memory/rulesets/powerx/crud_http.yaml`
  - `.specify/memory/rulesets/powerx/crud_grpc.yaml`
  - `.specify/memory/rulesets/powerx/sts.yaml`
  - `.specify/memory/rulesets/powerx/crud/*.yaml`（api\_rest、service、repository、migration、proto\_gen 等细分）
- 若新增前端模块，请在 `.specify/memory/rulesets/powerx/` 下补充对应规范并在 manifest 中声明。

> 若仓库结构发生重大变更，请先更新此 memory，再在 constitution 中刷新规则引用。
