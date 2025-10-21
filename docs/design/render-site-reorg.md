好的！下面是一份**可直接落库**的方案文档，用来描述这次渲染目录的调整与迁移。
你可以保存为：
`PowerXDoc/docs/design/render-site-reorg.md`

---

# PowerXDoc 渲染目录重构方案（.vitepress 固定在 docs，下沉渲染到 docs/website）

> 目标：**保留 `.vitepress` 在 `docs/` 根目录**，所有**可渲染内容**统一迁到 `docs/website/`；其余“源文档/下发源/分析产物”与 `website` 平级，便于集中治理与精准上架。

---

# 0. 迁移前基线记录（2025-10-21）

- 技术栈核对：package.json 中 `typescript@5.9.3`、`vitepress@1.6.4`、`tailwindcss@3.4.14`、`postcss@8.4.47`、`autoprefixer@10.4.20` 均与迁移方案预期一致。
- 现有渲染目录仍位于 `docs/` 根目录，包含以下一级内容（迁移前快照）：

```
docs/
├─ .vitepress/
├─ api-and-specifications/
├─ api-examples.md
├─ core-concepts/
├─ design/
├─ developer-guides/
├─ en/
├─ index.md
├─ localization/
├─ markdown-examples.md
├─ public/
├─ pxip/
└─ security-and-governance/
```

> 后续迁移将以此快照为基准，定位需要下沉到 `docs/website/` 的目录与文件。

---

## 1. 新目录布局（结果）

```
docs/
├─ .vitepress/                     # 站点配置（保留在 docs 根）
│  └─ config.mts
├─ website/                        # ← 唯一渲染入口（srcDir）
│  ├─ index.md
│  ├─ standards/                   # 仅挂出需要对外展示的规范页（白名单）
│  ├─ scenarios/                   # 仅挂出需要展示的 SCN 主用例
│  ├─ guides/                      # 原 developer-guides 渲染副本
│  ├─ core-concepts/               # 原 core-concepts 渲染副本
│  ├─ api-and-specifications/      # 原 api-and-specifications 渲染副本
│  ├─ security-and-governance/     # 原 security-and-governance 渲染副本
│  ├─ pxip/                        # 原 pxip 渲染副本
│  ├─ localization/                # 原 localization 渲染副本
│  ├─ en/                          # 原 en 渲染副本
│  ├─ public/                      # 站点静态资源（原 public）
│  └─ _mount/                      # （可选）预构建挂载区：只复制/链接“允许展示”的内容
│
├─ standards/                      # 源：统一规范（中心维护，不直接渲染）
│  ├─ backend/ frontend/ plugin/ marketplace/ shared/
├─ scenarios/                      # 源：SCN 主用例（中心维护，不直接渲染）
│  └─ SCN-XXXX-###.md
├─ usecases-seeds/                 # 源：子用例骨架（中心维护，不渲染）
│  ├─ powerx/ powerx-admin/ powerx-plugin/ powerx-marketplace/
├─ analysis/                       # 源：聚合分析产物（报表原始文件，不渲染）
├─ projects/                       # （如保留）各项目 docs 镜像（不渲染）
├─ api-examples.md                 # （源）如要展示→复制到 website/
├─ developer-guides/               # （源）如要展示→复制到 website/guides/
├─ core-concepts/                  # （源）如要展示→复制到 website/core-concepts/
├─ api-and-specifications/         # （源）如要展示→复制到 website/api-and-specifications/
├─ security-and-governance/        # （源）如要展示→复制到 website/security-and-governance/
├─ pxip/                           # （源）如要展示→复制到 website/pxip/
├─ localization/                   # （源）如要展示→复制到 website/localization/
├─ en/                             # （源）如要展示→复制到 website/en/
├─ index.md                        # （源）如要展示→复制到 website/index.md
└─ design/                         # 设计文档（本文件等，不渲染）
```

> 要点：**渲染只从 `docs/website/` 读取**；上层同名目录作为“内容源”，仅在发布前复制/链接到 `website/`（或 `website/_mount/`）白名单。

---

## 2. 渲染配置（最小改动）

`docs/.vitepress/config.mts`：

```ts
import { defineConfig } from 'vitepress'
import { resolve } from 'node:path'

export default defineConfig({
  srcDir: 'website',                                    // ← 指向 docs/website
  outDir: resolve(__dirname, 'dist'),
  publicDir: resolve(__dirname, '../website/public'),
  themeConfig: {
    nav: [
      { text: '概览', link: '/' },
      { text: '核心概念', link: '/core-concepts/' },
      { text: '规范', link: '/standards/' },
      { text: '用例', link: '/scenarios/' },
      { text: '开发指南', link: '/guides/' },
      { text: '契约与接口', link: '/api-and-specifications/' },
      { text: '安全与治理', link: '/security-and-governance/' },
      { text: 'PXIP', link: '/pxip/' }
    ],
    sidebar: {
      '/core-concepts/': [{ text: '概览', link: '/core-concepts/' }],
      '/standards/': [{ text: '规范总览', link: '/standards/' }],
      '/scenarios/': [{ text: '场景总览', link: '/scenarios/' }],
      '/guides/': [{ text: '入门', link: '/guides/' }],
      '/api-and-specifications/': [{ text: '索引', link: '/api-and-specifications/' }],
      '/security-and-governance/': [{ text: '总览', link: '/security-and-governance/' }],
      '/pxip/': [{ text: 'PXIP 流程', link: '/pxip/' }],
    },
    search: { provider: 'local' },
    outline: [2,3],
    lastUpdated: true
  }
})
```

---

## 3. 迁移映射（你现有目录 → website）

| 现有（源）                             | 迁移到（渲染）                                       |
| --------------------------------- | --------------------------------------------- |
| `docs/index.md`                   | `docs/website/index.md`                       |
| `docs/core-concepts/**`           | `docs/website/core-concepts/**`               |
| `docs/developer-guides/**`        | `docs/website/guides/**`                      |
| `docs/api-and-specifications/**`  | `docs/website/api-and-specifications/**`      |
| `docs/security-and-governance/**` | `docs/website/security-and-governance/**`     |
| `docs/pxip/**`                    | `docs/website/pxip/**`                        |
| `docs/localization/**`            | `docs/website/localization/**`                |
| `docs/en/**`                      | `docs/website/en/**`                          |
| `docs/public/**`                  | `docs/website/public/**`                      |
| `docs/markdown-examples.md`（如需）   | `docs/website/pages/markdown-examples.md` 或丢弃 |

> 规范（`standards/`）、主用例（`scenarios/`）、子用例种子（`usecases-seeds/`）、分析（`analysis/`）**不直接渲染**，留在 `website` 平级作为源。

---

## 4. 构建与脚本（建议）

`package.json` 脚本保持不变：

```json
{
  "scripts": {
    "docs:dev": "vitepress dev docs",
    "docs:build": "vitepress build docs",
    "docs:preview": "vitepress preview docs"
  }
}
```

（可选）预构建“白名单发布”流程：

* 只把 `Approved` 的 `standards/` 或 `scenarios/` 页复制到 `docs/website/standards`、`docs/website/scenarios`；
* 或软链到 `docs/website/_mount/` 再在导航中指向 `_mount`。

---

## 5. 链接与导航规范

* 站内链接一律指向 `website` 相对路径（如 `/standards/`、`/scenarios/`），不引用 `website` 之外的源路径。
* 需要展示的源内容**先复制/链接**到 `website` 内，再被引用。
* 避免把 `analysis/`、`projects/` 直接进导航；可在首页或专页放入口。

---

## 6. 渐进式落地清单

1. 创建 `docs/website/`，迁入 `index.md` 与现有可渲染目录的副本。
2. 更新 `docs/.vitepress/config.mts` 的 `srcDir` 为 `website`。
3. 本地跑 `npm run docs:dev` 验证导航与侧边。
4. 按需添加“白名单”预构建脚本，仅挂出允许上架的规范/用例。
5. 后续新增内容一律放在 `docs/website/`；上层目录仅作为源材料与下发源。

---

## 7. 一句话总结

* **.vitepress 留在 `docs/` 根**，**渲染入口切到 `docs/website/`**；
* 可展示内容只进 `website`；
* 规范/用例/分析的**源**与下发逻辑，统一留在 `website` 平级，**不直接参与渲染**。

——这能把“展示层”和“资料源”彻底分离，构建干净、发布可控，与你的 **Only Push 中心治理** 完整对齐。
