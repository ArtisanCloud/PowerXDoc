# 🔑 插件 License 合规检查清单（License Checklist Template）

> 本模板用于验证插件在 Marketplace 上架前后的 License 管理、验证与合规要求。

---

## 🧭 一、基本信息

| 字段 | 内容 |
|------|------|
| **插件 ID** | com.powerx.plugin.xxx |
| **插件名称** | CRM Plus |
| **版本号** | 1.2.0 |
| **Vendor 名称** | ArtisanCloud |
| **检查日期** | 2025-10-13 |
| **检查人** | License Compliance Officer |

---

## 🧩 二、License 元数据检查

| 项目 | 状态 | 备注 |
|------|-------|------|
| Manifest 文件中包含 `license` 字段 | ✅ | |
| License Server 可正确验证签名 | ✅ | |
| License Key 未硬编码在源码中 | ✅ | |
| License 缓存加密存储 | ✅ | 使用 AES256 |
| License 与租户 ID 一致 | ✅ | |
| 试用期配置正确（Trial） | ✅ | 14 天 |
| 过期后进入只读模式 | ✅ | |

---

## ⚙️ 三、License 生命周期验证

| 阶段 | 检查项 | 结果 |
|------|----------|------|
| 激活 | 能通过 License Server 成功验证 | ✅ |
| 校验 | 缓存可定期刷新（默认 5 分钟） | ✅ |
| 续期 | 过期前 3 天发出提醒 | ✅ |
| 吊销 | 被禁用后拒绝请求 | ✅ |
| 转移 | 新租户重新绑定验证 | ✅ |

---

## 🔐 四、安全性检查

| 检查项 | 状态 |
|---------|------|
| License Key 从不明文暴露 | ✅ |
| License 传输使用 HTTPS | ✅ |
| 插件不存储历史 License 文件 | ✅ |
| License 检查日志脱敏 | ✅ |
| License 验证异常可追踪 | ✅ |

---

## 🧠 五、市场与合规要求

| 检查项 | 状态 | 说明 |
|---------|------|------|
| Marketplace 后台 License 状态同步 | ✅ | 实时更新 |
| Marketplace 退款策略已定义 | ✅ | 支持按比例退款 |
| GDPR 合规性（用户删除数据时自动失效） | ✅ | |
| SLA 套餐定义清晰 | ✅ | Basic / Pro / Enterprise |

---

## 🧾 六、结论与建议

- 本插件 License 模块验证通过 ✅  
- 建议增强 License 缓存清理与审计同步；  
- 建议加入 License 续期事件的 Webhook 通知。

---

> **报告版本：** v1.0  
> **审核人：** PowerX License Compliance Team  
> **最后更新：** 2025-10
