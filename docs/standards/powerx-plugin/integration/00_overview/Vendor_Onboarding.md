# 插件开发者入驻与 Vendor 注册指南（00_overview/Vendor_Onboarding.md）

> 本文档指导插件开发者（Vendor）如何注册、认证并将插件与 PowerX Plugin Marketplace 进行绑定，  
> 并规范如何打包 `.pxp` 插件包、签名、上传与运行授权。

---

## 📍 一、Vendor 注册流程总览

PowerX 插件生态通过「Marketplace → Core → PluginBase」三层体系管理开发者身份。

| 阶段 | 动作 | 说明 |
|------|------|------|
| 1️⃣ 申请 | 在 **PowerX Plugin Marketplace** 注册 Vendor 账户 | 提交企业或个人资料、完成邮箱验证与审核 |
| 2️⃣ 认证 | 上传企业资质与结算账户 | 市场方完成 KYC 审核 |
| 3️⃣ 创建插件 | 在 Marketplace 创建插件条目（Plugin ID） | 定义插件基本元信息与最小核心版本 |
| 4️⃣ 构建与签名 | 在本地使用 PowerXPluginBase 工具生成 `.pxp` 包 | 内含 manifest、后端、前端、迁移与签名 |
| 5️⃣ 上传与登记 | 调用 Marketplace 开发者 API 上传 `.pxp` | 市场保存包元信息与签名哈希 |
| 6️⃣ 审核与上架 | 通过 Marketplace 审核后正式发布 | PowerX Core 可从市场下载与安装 |
| 7️⃣ 运行与授权 | PowerX 安装插件并校验签名与 License | 插件进入运行态并报告 Vendor 来源 |

---

## 🧩 二、Vendor 与 PluginBase 的关系

在 PowerXPluginBase 中，Vendor 信息的用途：

- 标识插件作者（vendor_id / vendor_name）
- 关联 Marketplace License 与公钥签名
- 支持插件内调用 Marketplace API（例如 License 刷新、计费上报）
- 在 PowerX Admin 中展示插件来源与支持链接

### plugin.yaml（开发阶段）

```yaml
id: com.powerx.plugin.crm
name: CRM Plugin
version: 1.2.0
vendor:
  id: vendor_12345
  name: ArtisanCloud Ltd.
  website: https://artisancloud.cn
  email: support@artisancloud.cn
  license_key: ${PLUGIN_LICENSE_KEY}
````

> ⚙️ 构建 `.pxp` 时，`plugin.yaml` 会被复制/转换为 `manifest.yaml` 写入包中。

---

## ⚙️ 三、`.pxp` 插件包结构（Vendor 构建产物）

> `.pxp` 是 PowerX 插件的正式发布包，具备不可变性与签名保证。

```
<plugin-id>-<version>-<os>-<arch>.pxp
├─ manifest.yaml            # 插件元数据（由 plugin.yaml 转换）
├─ backend/                 # 可执行文件或启动脚本
├─ frontend/                # 前端构建产物
├─ migrations/              # 数据库迁移
├─ contracts/               # 契约与事件声明
├─ hooks/                   # 安装/卸载钩子
├─ LICENSE
├─ SIGNATURE                # 开发者签名（Ed25519/RSA）
└─ SIGNATURE.pub            # 对应公钥或证书链
```

> 每个 `.pxp` 版本建议支持多个构建（OS/ARCH）。

---

## 🔏 四、签名与校验机制

1. **Vendor 侧签名流程**

   ```bash
   # 生成签名
   powerx plugin sign ./dist/com.powerx.plugin.crm-1.2.0-linux-amd64.pxp \
       --key ./private.pem --algo ed25519
   ```

   生成：

   - `SIGNATURE`（签名文件）
   - `SIGNATURE.pub`（公钥）

2. **Marketplace 校验**

   - 上传 `.pxp` 后校验 `sha256` 与 `SIGNATURE`。
   - 存储 Vendor 公钥，用于宿主侧验证。

3. **PowerX 宿主安装时**

   - 下载 `.pxp`
   - 校验哈希与签名
   - 验证 `manifest.yaml` 与公钥匹配

---

## 🧰 五、PowerXPluginBase 的 Vendor 设置页

插件本地可缓存 Vendor 信息，以便：

- 在 **插件设置页** 展示“由谁开发 / 支持方式”
- 在 **错误上报**中标记 Vendor
- 在 **License 检查** 时本地识别授权状态

### 推荐表结构

```sql
CREATE TABLE plugin_settings (
  id SERIAL PRIMARY KEY,
  plugin_id TEXT,
  key TEXT,
  value JSONB,
  tenant_id TEXT,
  updated_at TIMESTAMP DEFAULT now()
);
```

### 示例内容

```json
{
  "vendor_id": "vendor_12345",
  "vendor_name": "ArtisanCloud Ltd.",
  "license_key": "PWRX-LC-XXXXXX",
  "marketplace_url": "https://market.powerx.cloud/vendors/vendor_12345"
}
```

### 前端界面建议

| 字段          | 类型  | 说明                  |
| ----------- | --- | ------------------- |
| Vendor 名称   | 只读  | 从 Marketplace 同步    |
| 官网 / 邮箱     | 只读  | 展示 Vendor 联系方式      |
| License Key | 输入框 | 供管理员更新 License      |
| 同步信息按钮      | 操作  | 重新拉取 Marketplace 数据 |

---

## 🚀 六、构建与上传 `.pxp` 示例

```bash
# 1. 构建插件
powerx plugin build

# 2. 打包为 .pxp
powerx plugin package \
  --manifest ./plugin.yaml \
  --output ./dist \
  --sign-key ./private.pem

# 3. 上传到 Marketplace
powerx marketplace upload ./dist/com.powerx.plugin.crm-1.2.0-linux-amd64.pxp
```

输出：

```
dist/
 └── com.powerx.plugin.crm-1.2.0-linux-amd64.pxp
```

---

## 🧭 七、常见问题（FAQ）

| 问题                              | 答案                              |
| ------------------------------- | ------------------------------- |
| 插件可以在本地直接安装 `.pxp` 吗？           | ✅ 可以，但需手动校验签名。                  |
| Marketplace 会保存签名吗？             | ✅ 保存 SHA256 与 SIGNATURE 以验证完整性。 |
| plugin.yaml 与 manifest.yaml 区别？ | 前者开发态使用，后者是构建态导出。               |
| Vendor 信息能改吗？                   | ❌ 由 Marketplace 管控，插件侧只同步。      |

---

## 📚 延伸阅读

- [PowerX .pxp 规范](../../../../marketplace/docs/pxp_guide.md)
- [01_plugin_lifecycle/Create_and_Init_Project.md](../01_plugin_lifecycle/Create_and_Init_Project.md)
- [06_marketplace_and_business/Listing_and_Branding_Guide.md](../06_marketplace_and_business/Listing_and_Branding_Guide.md)
- [04_security_and_compliance/ToolGrant_Consumption_Guide.md](../04_security_and_compliance/ToolGrant_Consumption_Guide.md)

---

> **文档版本：** v1.1.0
> **更新说明：** 对应 `.pxp` 规范引入签名与校验流程
> **维护者：** Marketplace 团队 & PluginBase 核心组

```

---

✅ **总结调整后的结论：**
- 不需要在插件 UI 中提供「上架/下架」操作；
- 可以在插件设置中保留 Vendor 信息与 License Key；
- 重点增强 `.pxp` 打包、签名、上传的部分；
- 强调 plugin.yaml → manifest.yaml 的转化关系。
