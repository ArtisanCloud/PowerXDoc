# 插件上架与品牌展示指南（06_marketplace_and_business/Listing_and_Branding_Guide.md）

> 本文档定义 PowerX 插件在上架到 **PowerX Plugin Marketplace** 时的提交、审核、展示与品牌规范。  
>
> 目标是确保插件生态的质量一致性、视觉统一性，以及与 PowerX 品牌体系的兼容。

---

## 🧭 一、总体目标

- 规范插件的上架（Listing）流程；
- 统一品牌展示（Branding）与素材格式；
- 明确开发者（Vendor）信息与联系方式；
- 对接 Marketplace 审核系统与发布流水线；
- 兼容多租户 SaaS 商业分发与 License 模型。

---

## 🧱 二、上架流程概览

```

开发者注册 → 提交插件包 (.pxp) → 审核 → 上架展示 → 用户安装

```

| 阶段 | 动作 | 责任方 | 产出 |
|------|------|---------|------|
| **注册** | Vendor 注册 / KYC 审核 | 开发者 | Vendor Profile |
| **提交** | 上传 `.pxp` 插件包 | Vendor | 插件包元信息 |
| **审核** | 安全 / 合规 / 技术校验 | Marketplace 审核团队 | 审核报告 |
| **上架** | 插件可被浏览与搜索 | PowerX Marketplace | 插件 Listing 页面 |
| **安装** | 用户点击「安装」 | Tenant 管理员 | Plugin Instance |
| **更新** | 提交新版本并替换展示 | Vendor | 版本历史记录 |

---

## 🧩 三、插件包清单 (.pxp)

上架的核心文件为 `.pxp` 包（PowerX Plugin Package），  
它由以下内容组成（详见 `docs/vendor/04_license_and_pricing/Pricing_and_Plan.md`）：

```

myplugin.pxp
├── plugin.yaml
├── backend/
│   └── ...
├── web-admin/
│   └── dist/
├── docs/
│   └── README.md
└── assets/
├── logo.png
├── cover.png
└── screenshots/

```

PowerX Marketplace 自动解析以下字段：

- `plugin.yaml` → 读取元数据（名称、版本、能力、依赖）；
- `/assets/logo.png` → 展示在插件卡片；
- `/assets/cover.png` → Banner 图片；
- `/docs/README.md` → 详情页内容；
- 版本号与 License 将同步登记到 `PowerX License Server`。

---

## 🎨 四、品牌规范（Branding Rules）

### 1️⃣ 插件名称规范

| 类型 | 规则 |
|------|------|
| 主名称 | 简短（≤30 字符），必须唯一 |
| 副标题 | 可选，用于描述功能定位 |
| 前缀 | 推荐：`com.powerx.plugin.<domain>` |
| 禁止 | 使用 PowerX 官方保留字（core, admin, system） |

### 2️⃣ 图标与封面规范

| 项目 | 尺寸 | 格式 | 说明 |
|------|------|------|------|
| Logo | 512×512 px | PNG / SVG | 透明背景 |
| Cover | 1200×600 px | PNG / JPG | 横向展示图 |
| Screenshots | ≤ 5 张 | JPG / PNG | 展示主要界面功能 |

> 插件图标必须保持清晰辨识度，不得仿冒官方图标。

### 3️⃣ 品牌色彩与字体

- 插件可使用自定义色，但需符合深浅对比要求；
- 不得与 PowerX 主色系（蓝#2476F3、灰#E7EBF0）冲突；
- 字体推荐：`Inter`, `Noto Sans`, 或 `PingFang SC`。

---

## 🧾 五、插件详情页字段规范

Marketplace 将读取以下元信息生成插件展示卡片与详情页：

| 字段 | 来源 | 示例 |
|------|------|------|
| 名称 | plugin.yaml:name | “AI 营销助理” |
| 作者 | plugin.yaml:vendor.name | “ArtisanCloud” |
| 版本 | plugin.yaml:version | 1.2.3 |
| 简介 | plugin.yaml:description | “基于 PowerX Agent 的营销自动化插件” |
| 类别 | plugin.yaml:category | “Marketing / AI” |
| 能力 | plugin.yaml:capabilities | `["crm.contact.create","ai.email.send"]` |
| 封面 | assets/cover.png | 自动解析 |
| 截图 | assets/screenshots/* | 自动解析 |
| 文档 | docs/README.md | 详情页中展示 |
| License | plugin.yaml:license | `MIT / Commercial` |

---

## 📦 六、插件分类（Category）

| 一级分类 | 二级示例 |
|-----------|-----------|
| **AI 智能** | Chat Agent / Recommender / Embedding / Vision |
| **CRM 客户关系** | Contacts / Deals / Segmentation |
| **E-Commerce 电商** | Catalog / Orders / Payment / Pricing |
| **Marketing 营销** | Campaign / Ads / SEO / Analytics |
| **Data 数据与分析** | Dashboard / BI / ETL / Pipeline |
| **Workflow 工作流** | Automation / Trigger / Connector |
| **Integration 集成** | Third-Party / Webhook / API Bridge |

> 插件可在 manifest 中指定主类与副类：

```yaml
category:
  main: "Marketing"
  sub: "AI Assistant"
```

---

## ⚙️ 七、SEO 与搜索优化

插件详情页支持以下元数据（由 plugin.yaml 提供）：

```yaml
seo:
  title: "AI 营销助理 - PowerX 官方插件市场"
  keywords: ["AI", "Marketing", "CRM", "智能体"]
  description: "通过 PowerX 营销插件，一键创建营销邮件与客户跟进任务。"
```

Marketplace 使用这些元数据构建搜索索引与推荐算法。

---

## 🧠 八、Vendor 信息展示

插件详情页底部将显示开发者（Vendor）资料：

| 字段        | 来源                   | 示例                                                        |
| --------- | -------------------- | --------------------------------------------------------- |
| Vendor 名称 | vendor.name          | ArtisanCloud                                              |
| 官网        | vendor.website       | [https://artisancloud.cn](https://artisancloud.cn)        |
| 支持邮箱      | vendor.support_email | [support@artisancloud.cn](mailto:support@artisancloud.cn) |
| 地区        | vendor.region        | China / Singapore                                         |
| 认证等级      | vendor.verified      | KYC Verified                                              |
| 评分        | Marketplace 自动生成     | ★★★★★                                                     |

---

## 💡 九、审核标准

| 项目             | 审核要求                 |
| -------------- | -------------------- |
| **安全性**        | 不得访问未声明外部域名，不得包含恶意代码 |
| **隐私合规**       | 必须遵守 GDPR / PIPL     |
| **文档完整性**      | 必须提供 README 与至少一张截图  |
| **兼容性**        | 支持 PowerX ≥ 0.9.0    |
| **版本规范**       | 语义化版本号 (semver)      |
| **License 合规** | 若使用第三方库，需附 LICENSE   |

> 审核通过后，插件将进入「可见（Public）」状态。
> 审核失败可查看报告并重新提交修订版本。

---

## 🔄 十、版本更新与展示策略

| 更新类型                  | 用户展示行为 | 审核策略      |
| --------------------- | ------ | --------- |
| **Minor (1.2 → 1.3)** | 自动更新   | 免审（安全白名单） |
| **Major (1.x → 2.0)** | 手动确认更新 | 重新审核      |
| **Patch (1.2.1)**     | 自动推送   | 免审        |
| **Security Fix**      | 优先更新   | 快速通道审核    |

---

## 🧩 十一、品牌展示示例（Marketplace UI）

```
┌────────────────────────────────────┐
│ [Logo]  AI 营销助理 by ArtisanCloud │
│ "基于 PowerX Agent 的营销自动化插件" │
│ [★★★★★ 4.9]  1.2.3  Marketing / AI │
│ [安装] [文档] [支持]                │
└────────────────────────────────────┘
```

详情页：

- 左侧：封面图、截图画廊；
- 中间：功能介绍、版本记录；
- 右侧：安装按钮、价格计划、Vendor 联系方式。

---

## 📈 十二、品牌营销与推荐策略

Marketplace 根据以下指标推荐插件：

| 指标     | 权重  |
| ------ | --- |
| 安装量    | 30% |
| 活跃租户数  | 20% |
| 用户评分   | 20% |
| 更新频率   | 10% |
| 支持响应时间 | 10% |
| 品牌完整度  | 10% |

> 官方推荐位将优先展示通过认证（Verified Vendor）的插件。

---

## 🧩 十三、自检清单（Listing Ready Checklist）

| 检查项                             | 状态 |
| ------------------------------- | -- |
| 插件包 (.pxp) 结构完整                 | ✅  |
| plugin.yaml 含 vendor 信息         | ✅  |
| assets/logo.png / cover.png 已提供 | ✅  |
| docs/README.md 完整               | ✅  |
| 分类与 SEO 元数据已定义                  | ✅  |
| 审核测试通过                          | ✅  |
| KYC 验证完成                        | ✅  |

---

## 📚 十四、延伸阅读

- [Pricing_and_Licensing.md](./Pricing_and_Licensing.md)
- [Usage_Analytics_and_Reports.md](./Usage_Analytics_and_Reports.md)
- [Vendor_Onboarding.md](../00_overview/Vendor_Onboarding.md)
- [Manifest_and_Metadata.md](../01_plugin_lifecycle/Manifest_and_Metadata.md)

---

> **文档版本：** v1.1.0
> **适用范围：** PowerX ≥ 0.9.0
> **维护团队：** PowerX Marketplace Team
> **最后更新：** 2025-10

```

---

✅ **总结**
- 这份文档完全定义了 PowerX Marketplace 上插件的**上架路径、品牌展示标准与审核流程**；
- 明确了 `.pxp` 包的组成、品牌素材要求、Vendor 资料展示；
- 对齐 License Server、审核策略、SEO 元数据；
- 与前面文档 (`Vendor_Onboarding`, `Manifest_and_Metadata`, `Pricing_and_Licensing`) 完整闭环。

