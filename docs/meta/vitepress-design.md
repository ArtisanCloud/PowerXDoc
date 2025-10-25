# PowerX VitePress 导航与侧边栏设计方案

为便于公司客户与内部研发团队在同一站点快速定位内容，VitePress 站点采用「顶层导航 + 分区侧边栏」结构：顶部导航负责受众和主题切换，左侧侧边栏在当前主题下提供 2 级树形目录，所有二级分组默认展开。

## 1. 顶部导航（nav）

| 顺序 | 菜单 | 路由前缀 | 受众 | 主要内容 |
|------|------|----------|------|----------|
| 1 | 产品概览 | `/overview/` | 管理层 / 业务负责人 | PowerX 愿景、产品矩阵、价值案例、路线图 |
| 2 | 使用与部署 | `/guides/` | 客户实施团队、运维 | 快速起步、部署脚本、配置指南、FAQ |
| 3 | 用例与场景 | `/scenarios/` | 业务 / 方案架构师 | 场景文档、Usecase Seed 导航、领导视图 |
| 4 | 开发与扩展 | `/developers/` | 内外部开发者 | API/SDK、插件扩展、测试策略、CI/CD |
| 5 | 运营与治理 | `/operations/` | SRE、安全、合规 | 观测、告警、权限治理、发布策略 |
| 6 | 资源中心 | `/resources/` | 全部用户 | 下载、公告、版本日志、术语表、外部链接 |

> 说明：`/scenarios/`、`/developers/` 等页面可以是汇总入口，内部再链接到 `docs/scenarios/**`、`docs/usecases-seeds/**` 等现有文档。

## 2. 侧边栏（sidebar）分区

每个导航前缀配置独立的侧边栏，结构统一为「一级分类 + 二级主题」，二级默认展开，便于扫描。建议使用 VitePress 的 `collapsed: false` 控制展开状态。

### 2.1 产品概览 `/overview/`

```
- PowerX 一览
  - 愿景与定位
  - 产品矩阵
- 价值案例
  - 行业方案
  - 成功故事
- 路线图
  - 近期版本
  - 规划中的特性
```

### 2.2 使用与部署 `/guides/`

```
- 快速开始
  - 环境要求
  - 本地试用
- 部署指南
  - 单体部署
  - 集群部署
  - 云托管
- 配置与集成
  - 身份与权限
  - 第三方集成
- 运维 FAQ
  - 常见告警
  - 升级回滚
```

### 2.3 用例与场景 `/scenarios/`

```
- 场景总览
  - 场景入口说明
  - docmap 维护指南
- 发布路径
  - SCN-PUBLISH-HUB-001
  - 其它场景……
- Usecase Seeds
  - Seed 生成指南
  - Seed 发布流程
  - Seed 索引（自动生成）
```

> 可直接链接到 `docs/scenarios/publish/SCN-PUBLISH-HUB-001.md`、`docs/usecases-seeds/scenarios/SCN-PUBLISH-HUB-001.md` 等文件。

### 2.4 开发与扩展 `/developers/`

```
- SDK / API
  - REST & GraphQL
  - Webhook / 事件
- 插件体系
  - Scaffold 指南
  - 开发热加载
  - 发布流程
- 质量与测试
  - 单元 / 集成测试
  - 测试数据治理
- 工具链
  - CLI 与脚本
  - CI/CD 流程
```

### 2.5 运营与治理 `/operations/`

```
- 观测与告警
  - 指标体系
  - 日志 / Trace
- 安全治理
  - 身份与访问
  - 合规要求
- 变更管理
  - 发布策略
  - 回滚与演练
- 报告与审计
  - Workflow Telemetry
  - 合规报表
```

### 2.6 资源中心 `/resources/`

```
- 下载与工具
- 版本与公告
- 术语表
- 对外链接
```

## 3. 配置建议

1. 在 `docs/.vitepress/config.mts` 中使用 `themeConfig.nav` 与 `themeConfig.sidebar` 映射上述结构，确保每个前缀指向对应目录。
2. 将侧边栏节点设置 `collapsed: false`，保证二级菜单默认展开；对篇幅较长的分支可再加三级。
3. 针对场景 / Usecase 文档，可通过入口页或跳转链接避免在 `docs/website/**` 中复制内容，减少冗余。
4. 若需控制草稿可见性，可在文档 frontmatter 使用 `draft: true` 等字段，并在主题中读取决定是否展示。***
