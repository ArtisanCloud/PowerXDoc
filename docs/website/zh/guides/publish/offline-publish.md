# 离线发布与导入指南

- **覆盖场景**: `SCN-DEV-PLUGIN-PUBLISH-001`（离线支线）
- **关联规范**:
  - `../Plugins/PowerXPlugin/specs/004-publish-hub-spec/spec.md`（离线包、密钥要求）
  - `../PowerX/specs/009-install-plugin-pxp/spec.md`（安装与回滚）
  - `../PowerXPluginMarket/specs/010-install-plugin-pxp/spec.md`（离线上传、指纹）

---

## 1. 打包 `.pxp`

```bash
px-plugin pack --mode release \
  --plugin-id com.powerx.demo \
  --manifest dist/manifest.json \
  --output dist/com.powerx.demo-0.2.0.pxp
```

`.pxp` 目录结构：
```
META-INF/
  MANIFEST.MF
  SIGNATURE.RSA
  CERTIFICATE.CHAIN.PEM
manifest.yaml
dependencies.lock
compatibility.matrix.json
compliance/
  security-assessment.pdf
artifact/<plugin-id>-<version>/
provenance.json
checksums.txt
```

> 结构需与 `plugin-metadata.md`、`docs/standards/powerx-plugin/lifecycle/examples/plugin.yaml` 对齐。

---

## 2. 临时密钥加密

1. 生成一次性的对称密钥：
   ```bash
   openssl rand -base64 32 > dist/.pxp.key
   ```
2. 使用该密钥加密 `.pxp`：
   ```bash
   openssl enc -aes-256-cbc -pbkdf2 \
     -in dist/com.powerx.demo-0.2.0.pxp \
     -out dist/com.powerx.demo-0.2.0.pxp.enc \
     -pass file:dist/.pxp.key
   ```
3. 用 Marketplace 公钥封装密钥（测试环境可复用 `../PowerXPluginMarket/tests/fixtures/offline/cert-chain.pem`，生产环境请向运营团队申请独立公钥）：
   ```bash
   openssl rsautl -encrypt \
     -inkey ../PowerXPluginMarket/tests/fixtures/offline/cert-chain.pem \
     -pubin \
     -in dist/.pxp.key \
     -out dist/.pxp.key.enc
   ```
4. 将 `*.enc` 文件与 `integrity.txt` 一同提交。若密钥不匹配，Marketplace 会返回 `PX_OFFLINE_401`（详见 004 spec 的 Assumption 7）。

---

## 3. 50MB 分块上传

> 摘自 010 spec 的 Clarifications：单块 50MB，分块上传 + 服务器合并。

```bash
px-plugin offline upload \
  --file dist/com.powerx.demo-0.2.0.pxp.enc \
  --chunk-size 50MB \
  --resume-token offline-upload-001
```

- CLI 会记录断点，失败后可通过 `--resume-token` 续传。
- 服务器端会生成 `distributionFingerprint`，其结构与 `../PowerXPluginMarket/tests/fixtures/offline/provenance.json` 一致，并按 010 spec 的 `distribution_package_fingerprints` 章节追加存档。

---

## 4. Marketplace 审核（离线队列）

1. 审核员在 Console 中查看上传记录，校验：
   - 指纹是否与历史记录一致；
   - 许可证与合规文件（`compliance/`）；
   - `.pxp.key.enc` 能否用私钥解密。
2. SLA：≤ 1 个工作日（010 spec 中的 User Story 3）。
3. 审核结果可通过 `../PowerXPluginMarket/scripts/workflows/marketplace-offline-review.mjs` 的输出查看，并同步到 Publish Hub。

---

## 5. 租户导入

1. 管理员在隔离环境下载已审核的包：
   ```bash
   px-plugin offline pull \
     --plugin-id com.powerx.demo \
     --version 0.2.0 \
     --output /tmp/com.powerx.demo-0.2.0.pxp.enc
   ```
2. 使用 Marketplace 私钥解密密钥，再解密 `.pxp`：
   ```bash
   openssl rsautl -decrypt \
     -inkey marketplace.private.pem \
     -in /tmp/.pxp.key.enc \
     -out /tmp/.pxp.key

   openssl enc -d -aes-256-cbc -pbkdf2 \
     -in /tmp/com.powerx.demo-0.2.0.pxp.enc \
     -out /tmp/com.powerx.demo-0.2.0.pxp \
     -pass file:/tmp/.pxp.key
   ```
3. 导入：
   ```bash
   curl -X POST http://localhost:8080/api/admin/plugins/install \
     -H "Authorization: Bearer <token>" \
     -F "package=@/tmp/com.powerx.demo-0.2.0.pxp"
   ```
4. 失败回滚：`px-plugin install rollback --deployment <id>`（回滚脚本定义见 009 spec）。

---

## 6. 指纹与审计

- 上传成功后，CLI 会输出 `fingerprint:<sha256>`，请与 Marketplace 侧生成的 `provenance.json`（样例位于 `../PowerXPluginMarket/tests/fixtures/offline/provenance.json`）比对。
- 审计链路：
  - CLI：`~/.powerx/offline-upload.log`
  - Marketplace：`../PowerXPluginMarket/scripts/workflows/marketplace-offline-review.mjs`
  - Publish Hub：`reports/_state/workflows/OFFLINE_*`
- 若 SLA 超时或指纹不匹配，系统会触发 `PX_OFFLINE_ALERT`，可参考 `../PowerXPluginMarket/scripts/workflows/marketplace-offline-review.mjs` 中的通知策略示例。

---

## 7. 自检步骤

- [ ] `.pxp` 结构包含 `META-INF/`, `manifest.yaml`, `compatibility.matrix.json` 等必要文件。
- [ ] 已生成临时密钥并完成 RSA 封装；Marketplace 能成功解密。
- [ ] 50MB 分块上传在断网后可通过 `--resume-token` 续传成功。
- [ ] 离线审核日志与指纹文件都记录了该版本。
- [ ] 租户通过 `curl /api/admin/plugins/install` 成功导入并能在 `px version scan` 中看到目标版本。
