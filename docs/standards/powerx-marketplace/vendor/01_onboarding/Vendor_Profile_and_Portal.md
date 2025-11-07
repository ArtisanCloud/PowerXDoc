# 🧭 Vendor Profile & Portal 开发者控制台使用指南

> 本文档介绍 **PowerX Plugin Marketplace** 提供的开发者控制台（Vendor Portal），  
> 包含个人 / 企业资料维护、插件管理、收益结算、安全合规等核心功能。

---

## 🧱 1. 概述

完成注册与 KYC 审核后，Vendor 将获得专属的 **开发者控制台（Vendor Portal）**。  
Portal 是你管理插件、结算、账户和合规的唯一官方入口。

### 登录入口

- 地址：`https: "//marketplace.powerx.dev/vendor`"
- 支持登录方式：
  - 邮箱 + 密码
  - GitHub / Google OAuth
  - 企业 SSO（可选）
- 登录后进入仪表盘（Dashboard），展示插件状态与收益摘要。

---

## 🪄 2. Portal 总体结构

```text

Vendor Portal
├── Dashboard                  # 概览：收益、插件状态、通知
├── Plugins                    # 插件管理
│   ├── My Plugins              # 已上架插件列表
│   ├── New Plugin              # 创建 / 提交插件
│   ├── Versions                # 版本与更新记录
│   └── Reviews                 # 审核状态追踪
├── Finance                    # 财务结算与报表
│   ├── Payouts                 # 收益明细与结算记录
│   ├── Tax Info                # 税务资料与发票信息
│   └── Reports                 # 收益报表导出
├── Account                    # 账户与安全
│   ├── Profile                 # 基本信息（名称、邮箱、Logo）
│   ├── Security                # 密码、2FA、API Token
│   ├── Compliance              # KYC 状态与协议记录
│   └── Team Members            # 团队协作成员管理
├── Notifications              # 系统消息与公告
└── Support                    # 工单与客服支持

```

---

## 📊 3. Dashboard 仪表盘

### 内容模块

| 模块 | 内容 | 说明 |
|------|------|------|
| **总览卡片** | 当前收益、待结算金额、已上架插件数量 | 默认统计最近 30 天 |
| **插件状态** | 审核中 / 已上架 / 下架 / 弃用 | 支持跳转到对应插件详情 |
| **通知公告** | 系统更新、政策变更、安全提醒 | 按时间倒序展示 |
| **快捷操作** | 创建插件 / 查看财务报表 / 上传版本 | 提供常用入口 |

> Dashboard 是 Vendor 的业务总览中心，也是 Marketplace 与开发者沟通的主要触点。

---

## ⚙️ 4. Account 模块 — 账户与安全

### 4.1 基本信息

| 字段 | 示例 | 说明 |
|------|------|------|
| 开发者名称 | ArtisanCloud Studio | 展示在插件详情页 |
| 邮箱 | <dev@artisancloud.com> | 用于通知与支持 |
| 公司官网 | <https://artisancloud.com> | 可选字段 |
| 头像/Logo | 256×256 PNG | 必须，展示在 Marketplace |

### 4.2 安全设置

| 功能 | 说明 |
|------|------|
| 密码修改 | 支持强制周期更换 |
| 双重认证（2FA） | Google Authenticator / Email OTP |
| API Token | 用于 CLI / SDK 上传插件与调用 Marketplace API |
| 登录记录 | 最近登录设备与 IP，支持地理标识 |

### 4.3 合规与团队

- **KYC 状态**：展示认证状态（pending / approved / suspended）；
- **协议记录**：显示签署过的 Marketplace 协议版本；
- **团队成员**：
  - 可邀请团队成员加入；
  - 支持角色分配：`owner`、`developer`、`finance`；
  - 各角色权限示例：

    | 角色 | 权限范围 |
    |------|-----------|
    | Owner | 全部模块访问 |
    | Developer | 插件管理、版本上传 |
    | Finance | 收益、结算与报表访问 |

---

## 🧩 5. Plugins 模块 — 插件管理

### 5.1 新建插件

1. 点击「New Plugin」
2. 填写基础信息：
   - 插件名称、简介、分类、标签
   - 插件标识（如 `com.vendor.plugin_name`）
   - 上传 `plugin.yaml` 与打包文件
3. 选择 License 类型（免费 / 订阅 / 一次性 / 自定义）
4. 提交审核后状态为 `pending_review`

### 5.2 插件列表（My Plugins）

| 字段 | 示例 | 说明 |
|------|------|------|
| 名称 | Data Forge | 插件名称 |
| 状态 | Active / Pending / Rejected | 当前状态 |
| 安装量 | 1,240 | PowerX 平台统计数据 |
| 评分 | 4.8 / 5 | 用户反馈平均分 |
| 最近更新 | 2025-10-12 | 版本更新时间 |

> 点击任意插件可进入详情页，查看版本、License、用户评论。

### 5.3 版本管理（Versions）

- 上传新版本包（tar/zip）
- 自动检测版本号与变更日志
- 支持灰度发布 / 批量撤回
- 每个版本会生成唯一的 `version_id` 和 `manifest hash`

---

## 💰 6. Finance 模块 — 收益与结算

| 子模块 | 内容 | 说明 |
|--------|------|------|
| **Payouts** | 查看每月分成与结算状态 | 显示总额 / 待入账 / 手续费 |
| **Tax Info** | 填写税号 / 报税国家 / 公司地址 | 用于合法结算 |
| **Reports** | 导出 CSV 报表 | 可筛选时间区间与插件维度 |

### 结算状态示例

| 状态 | 含义 |
|------|------|
| `pending` | 等待结算周期到达 |
| `processing` | 结算中 |
| `completed` | 已支付 |
| `on_hold` | 暂停（风控 / 税务问题） |

---

## 🔐 7. Compliance 模块 — 安全与合规

| 功能 | 说明 |
|------|------|
| KYC 状态 | 显示认证结果 |
| 插件安全审计 | 每次上架都会生成安全报告 |
| 协议记录 | 查看已签署的政策版本 |
| 风控通知 | 若发现潜在违规，系统将自动提醒 |

> 每个 Vendor 在提交插件时，系统都会生成「合规检查清单」，  
> 包含依赖、API 权限、隐私声明、资源文件扫描等自动审计结果。

---

## 📨 8. Notifications 模块 — 通知与公告

Marketplace 会通过该模块推送以下内容：

- 审核结果与反馈
- 政策更新与新协议版本
- 安全提醒（如某插件被暂停）
- 结算与收益通知
- 平台活动与开发者计划邀请

> 所有系统通知都会同时发送至注册邮箱。

---

## 💬 9. Support 模块 — 工单系统

支持多渠道沟通：

| 渠道 | 用途 |
|------|------|
| 工单系统（Tickets） | 插件审核 / 财务 / 技术问题 |
| Discord / Slack | 开发者社区交流（可选） |
| 邮件支持 | <support@powerx.dev> |
| 实时聊天 | 内嵌客服窗口（工作日） |

> 每个工单会生成唯一编号，可追踪处理进度与反馈历史。

---

## 🧠 10. 最佳实践

1. **保持资料完整**：完善 Profile 与 KYC，可加快审核。
2. **启用 2FA**：保障账户安全。
3. **保持插件活跃**：频繁更新可提升权重与曝光。
4. **关注通知**：政策变更会影响结算或审核。
5. **多角色协作**：企业团队应分配不同权限成员。
6. **定期导出报表**：便于内部对账与统计。

---

## 🪶 11. 下一步阅读

- 👉 [Terms & Compliance 条款与政策](./Terms_and_Compliance.md)
- 👉 [插件结构与开发规范](../02_plugin_development/Plugin_Structure_and_YAML.md)
- 👉 [插件上架与审核流程](../03_listing_and_lifecycle/Submission_and_Review.md)

---

> 📘 **总结一句话：**  
> Vendor Portal 是你与 PowerX Marketplace 的「控制中心」。  
> 一切开发、审核、收益、合规操作，皆从这里开始。
