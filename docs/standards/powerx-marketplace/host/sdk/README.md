# PowerX Host SDKs

该目录包含宿主侧集成 Marketplace 所需的 SDK 说明。

## Go 客户端

```go
client, err := hostsdk.NewClient("https://api.powerx.marketplace/v1/internal/host",
    hostsdk.WithServiceToken(os.Getenv("POWERX_HOST_TOKEN")))
if err != nil {
    log.Fatal(err)
}
res, err := client.ValidateLicense(context.Background(), hostsdk.ValidateLicenseRequest{
    TenantID:     tenantID,
    PluginID:     pluginID,
    LicenseToken: token,
})
if err != nil {
    log.Fatalf("validate failed: %v", err)
}
fmt.Printf("valid=%t status=%s\n", res.Valid, res.Status)
```

## TypeScript 客户端

```ts
import { HostClient } from "@powerx/host-sdk";

const client = new HostClient({
  baseUrl: "https://api.powerx.marketplace/v1/internal/host",
  serviceToken: process.env.POWERX_HOST_TOKEN,
});

const res = await client.validateLicense({
  tenant_id: tenantId,
  plugin_id: pluginId,
  license_token: token,
});

console.log(res.status, res.valid);
```

## 发布流程

1. 更新 `sdk/go/host` 或 `sdk/ts/host` 源码并运行相应的构建脚本。
2. Go 客户端通过 `go list` 验证版本；TypeScript 客户端使用 `npm version` 维护版本号。
3. 将构建产物与标签推送到 Git，触发 CI 发布流水线。
