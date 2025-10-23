# PowerX Plugin Base 文档中心

本目录为 **PowerX 插件生态模板工程（powerx-plugin-base）** 的完整技术文档。  
所有插件作者、集成者、部署人员都应从此处开始。

---

## 📚 文档结构

| 分类 | 说明 |
|------|------|
| [overview/](./overview/) | 项目简介、架构与快速上手 |
| [developer/](./developer/) | 插件后端、前端、Agent 集成开发文档 |
| [contract/](./contract/) | PowerX 与插件交互协议规范 |
| [deploy/](./deploy/) | 环境变量、容器部署、安全加固 |
| [references/](./references/) | 变更记录 |
| [releases/](./releases/) | 发布说明模板与记录 |
| [overview/marketplace_business_loop.md](./overview/marketplace_business_loop.md) | Marketplace 上架→购买→Usage→分润闭环演练 |

> 源文档脚手架：`docs/lifecycle/` 为插件生命周期标准的唯一编辑入口，运行 `make sync-lifecycle-docs` 可同步到 `docs/integration/01_plugin_lifecycle/`。

---

## 🚀 推荐阅读顺序

1. [快速上手](./overview/quick_start.md)
2. [Marketplace 商业闭环指南](./overview/marketplace_business_loop.md)
3. [开发者指南](./developer/backend.md)
4. [插件协议规范](./contract/plugin_yaml_spec.md)
5. [部署与调试](./deploy/docker_guide.md)
6. [安全与合规指南](./integration/04_security_and_compliance/Data_Privacy_and_GDPR.md)
7. [Changelog](./references/changelog.md)

---

## ⚙️ 配置要点

- `backend/etc/config.example.yaml` 中新增 `operations` 节点，可配置支持渠道默认值、事故沟通通道及 SLA 采样周期；运行 `make dev-setup` 后可复制到本地 `config.yaml` 并按需调整。
