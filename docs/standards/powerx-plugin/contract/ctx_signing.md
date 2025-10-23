# 上下文签名规范（HMAC / JWT Context Signing Specification）

> 本页目标：定义 **PowerX 平台与插件之间的安全上下文传递机制**，  
> 确保多租户请求、RBAC 权限和 Agent 调用在跨进程通信中安全、可信、可追踪。  
>
> 读者对象：后端开发者 / 安全工程师 / 插件集成方。

---

## 一、设计目标

PowerX 平台与插件间通过反代通信，为了保证：

- ✅ **租户隔离**：每个请求仅携带自身租户上下文；
- ✅ **权限验证**：请求中附带当前用户的授权权限；
- ✅ **防篡改安全**：上下文加签防止伪造；
- ✅ **跨语言兼容**：插件可用任何语言实现验证逻辑；

平台提供两种签名机制：

| 模式 | 说明 | 推荐场景 |
|------|------|----------|
| **HMAC（对称加密）** | 共享密钥签名（base64 32B） | 内网、本地开发 |
| **JWT（非对称签名）** | 使用 RSA / EC 公私钥 | 生产环境、跨主机部署 |

---

## 二、上下文结构（PowerX → Plugin）

宿主 PowerX 会在请求 Header 中注入上下文：

```

X-PowerX-CTX: <HMAC签名payload>
X-PowerX-CTX-JWT: <JWT token>

````

两者互斥。插件侧根据环境变量判断使用哪种模式。

---

## 三、上下文内容（Context Payload）

统一的上下文结构如下：

```json
{
  "tenant_id": 1024,
  "user_id": 501,
  "role_ids": [1, 3],
  "permissions": ["crm:lead:create", "crm:lead:read"],
  "request_id": "req-0bcd9f1",
  "exp": 1735698195,
  "iat": 1735697895,
  "iss": "powerx-auth",
  "aud": "powerx-plugin"
}
````

| 字段            | 类型       | 说明               |
| ------------- | -------- | ---------------- |
| `tenant_id`   | number   | 当前租户 ID          |
| `user_id`     | number   | 当前用户 ID          |
| `role_ids`    | number[] | 当前用户绑定的角色 ID     |
| `permissions` | string[] | 当前请求权限列表         |
| `request_id`  | string   | 请求唯一标识           |
| `exp` / `iat` | number   | 有效期与签发时间（Unix 秒） |
| `iss`         | string   | 签发方标识            |
| `aud`         | string   | 接收方标识            |

---

## 四、HMAC 模式（对称加密）

### 1️⃣ 平台配置

PowerX 在安装插件时生成并注入以下环境变量：

| 变量名                      | 说明                | 示例                                               |
| ------------------------ | ----------------- | ------------------------------------------------ |
| `PLUGIN_CTX_HMAC_SECRET` | base64 编码 32 字节密钥 | `"1fr+GY6t3oe7W6qDvnq+BgxHUMnCKAtpby22VqH6b4o="` |
| `PLUGIN_CTX_KID`         | 密钥标识（Key ID）      | `"com.powerx.plugins.base:v1"`                   |

---

### 2️⃣ 签名结构

PowerX 平台生成签名：

```text
HMAC_SHA256(secret, base64url(payload))
```

Header:

```
X-PowerX-CTX: <base64url(payload)>.<base64url(signature)>
X-PowerX-CTX-KID: com.powerx.plugins.base:v1
```

---

### 3️⃣ 插件验证逻辑

伪代码：

```go
func VerifyHMAC(ctxHeader string, secret []byte) (*Context, error) {
    parts := strings.Split(ctxHeader, ".")
    if len(parts) != 2 {
        return nil, errors.New("invalid ctx format")
    }
    payload, sig := parts[0], parts[1]
    expected := hmacSha256(secret, payload)
    if !hmac.Equal(sig, expected) {
        return nil, errors.New("signature mismatch")
    }
    data, _ := base64.RawURLEncoding.DecodeString(payload)
    var ctx Context
    json.Unmarshal(data, &ctx)
    return &ctx, nil
}
```

---

## 五、JWT 模式（非对称签名）

### 1️⃣ 环境变量

| 变量名                   | 说明         | 示例                                |
| --------------------- | ---------- | --------------------------------- |
| `POWERX_CTX_JWKS_URL` | JWKS 公钥集地址 | `http://powerx/_p/_internal/jwks` |
| `POWERX_CTX_ISSUER`   | 签发者        | `powerx-auth`                     |
| `POWERX_CTX_AUDIENCE` | 受众         | `powerx-plugin`                   |
| `POWERX_CTX_TTL`      | Token 有效期  | `300s`                            |

---

### 2️⃣ 平台签发 JWT

算法：`RS256` 或 `ES256`
Header：

```json
{
  "alg": "RS256",
  "typ": "JWT",
  "kid": "px-key-2025"
}
```

Payload 即为前述上下文结构。

---

### 3️⃣ 插件校验逻辑

插件使用公钥验证签名：

```go
import "github.com/golang-jwt/jwt/v5"

func VerifyJWT(token string, jwksUrl string) (*Context, error) {
    keyfunc := jwt.KeyfuncFromJWKS(jwksUrl)
    claims := &jwt.MapClaims{}
    _, err := jwt.ParseWithClaims(token, claims, keyfunc)
    if err != nil {
        return nil, err
    }
    return &Context{
        TenantID: (*claims)["tenant_id"].(float64),
        UserID:   (*claims)["user_id"].(float64),
        Permissions: cast.ToStringSlice((*claims)["permissions"]),
    }, nil
}
```

---

## 六、模式选择

| 场景              | 推荐模式 | 原因           |
| --------------- | ---- | ------------ |
| 开发 / 单机联调       | HMAC | 配置简单、无外部依赖   |
| 内部部署 / 局域网      | HMAC | 足够安全         |
| 云端 SaaS / 多节点部署 | JWT  | 支持跨主机验证、公钥轮换 |
| 需要第三方调用         | JWT  | 可安全暴露公钥      |

---

## 七、上下文在插件中的使用

插件中间件在验证后，会注入上下文到 `gin.Context` 或 `req.Context()`：

```go
type PowerXContext struct {
    TenantID    int64
    UserID      int64
    Permissions []string
    RequestID   string
}

func (c *gin.Context) GetPowerX() *PowerXContext {
    val, _ := c.Get("powerx_ctx")
    return val.(*PowerXContext)
}
```

然后业务层即可直接访问：

```go
tenantID := c.GetPowerX().TenantID
```

---

## 八、请求链路示例

```text
Client
  ↓
PowerX Gateway
  ↓ (inject JWT/HMAC)
  ↓
Plugin Reverse Proxy (/_p/:id/api/v1/...)
  ↓
Plugin Middleware (verify signature)
  ↓
BeginTenantTx → SET LOCAL app.tenant_id
  ↓
Postgres (RLS) → Response
```

---

## 九、常见错误与排查

| 错误                   | 原因           | 解决方案                             |
| -------------------- | ------------ | -------------------------------- |
| `invalid ctx format` | Header 格式不合法 | 检查是否含 `payload.signature`        |
| `signature mismatch` | HMAC 密钥不一致   | 确认 `PLUGIN_CTX_HMAC_SECRET` 是否正确 |
| `token expired`      | JWT 已过期      | 检查 `POWERX_CTX_TTL` 或时间同步        |
| `kid not found`      | JWKS 公钥未匹配   | 检查 JWKS URL 是否可访问                |
| `permission denied`  | 缺少对应权限       | 检查 PowerX 租户角色设置                 |

---

## 十、安全建议

✅ **JWT 模式优先**：生产部署应使用 RSA/EC 公钥机制。
✅ **短期凭据**：Token 有效期不应超过 5 分钟。
✅ **防重放**：通过 `request_id` 或 nonce 防止重复请求。
✅ **多租户隔离**：插件必须从上下文提取 `tenant_id`，不可信任客户端传参。
✅ **日志保护**：勿打印完整 Token，仅记录前 10 位。
✅ **密钥轮换**：HMAC 建议每季度轮换；JWT JWKS 支持多 key 并行过渡。

---

## 十一、测试工具

### HMAC 测试

```bash
export PLUGIN_CTX_HMAC_SECRET="base64-secret"
curl http://localhost:8080/_p/com.powerx.plugins.base/api/v1/templates \
  -H "X-PowerX-CTX: <signed_payload>"
```

### JWT 测试

```bash
curl http://localhost:8080/_p/com.powerx.plugins.base/api/v1/templates \
  -H "X-PowerX-CTX-JWT: Bearer eyJhbGciOi..."
```

---

## 十二、附录：环境变量总览

| 环境变量                     | 说明                |
| ------------------------ | ----------------- |
| `POWERX_CTX_JWKS_URL`    | JWKS 公钥集地址        |
| `POWERX_CTX_ISSUER`      | 签发方               |
| `POWERX_CTX_AUDIENCE`    | 受众                |
| `POWERX_CTX_TTL`         | Token 有效期         |
| `PLUGIN_CTX_HMAC_SECRET` | HMAC 签名密钥（base64） |
| `PLUGIN_CTX_KID`         | 密钥标识              |
| `POWERX_DEV_MODE`        | 开发模式，跳过验签         |

---

## 十三、关联规范

| 模块               | 文档                                               |
| ---------------- | ------------------------------------------------ |
| Plugin 注册结构      | [plugin.yaml 规范](./plugin_yaml_spec.md)          |
| RBAC/Manifest 接口 | [rbac_manifest_spec.md](./rbac_manifest_spec.md) |
| Agent 注册协议       | [agent_contract.md](./agent_contract.md)         |
| PowerX 集成流程      | [powerx_integration.md](./powerx_integration.md) |

---

## 十四、总结

- 插件端必须实现签名验证；
- 上下文携带多租户与权限信息；
- HMAC 与 JWT 二选一，优先 JWT；
- 验证通过后才能进入业务逻辑；
- 插件中可依赖 `TenantContext` 注入的作用域保证安全执行。

---

## 下一步阅读

- 🔄 [PowerX Integration 交互流程](./powerx_integration.md)
- 🧩 [plugin.yaml 规范](./plugin_yaml_spec.md)
