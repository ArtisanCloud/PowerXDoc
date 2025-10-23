# Audit Logging Module (PRD)

## 1. 背景与目标

PowerX Plugin Marketplace 涉及多条合规敏感链路（供应商入驻、风险审批、环境开通等）。为了在各业务域内维持统一、可追溯的审计记录，本模块提供一套共享的审计写入机制：

- 业务层无需重复定义表结构与写库逻辑。
- 所有审计事件具备统一字段集合（stage/action/actor/payload）。
- 可与结构化日志/未来的审计管道（Kafka、SIEM、OpenTelemetry）平滑对接。

## 2. 范围

- 管理 `onboarding_audit_events` 表的写入逻辑。
- 提供领域包装（目前仅 Onboarding），便于追加类型安全的 Stage 枚举。
- 生成 zap 结构化日志，方便实时检索。

不包含：
- 审计事件查询/报表（由后续 API/BI 负责）。
- 审计事件归档/落地外部系统。

## 3. 关键组件

| 组件 | 路径 | 功能 |
|------|------|------|
| Shared Recorder | `backend/internal/services/audit/logger.go` | 写入 `onboarding_audit_events`、记录结构化日志 |
| Domain Wrapper | `backend/internal/services/onboarding/audit.go` | 将领域枚举映射到 Recorder 的通用接口 |
| Domain Model | `backend/internal/domain/models/onboarding_audit_event.go` | 定义表结构、GORM 配置 |
| Telemetry | `backend/internal/telemetry/onboarding_metrics.go` | 与审计协作，记录阶段耗时与失败次数（可选） |

### 3.1 Shared Recorder

```go
recorder := audit.NewRecorder(gormDB, zapLogger)
err := recorder.Record(ctx, audit.Event{
    ApplicationID: &appID,
    Stage:         "agreement",
    Action:        "sign_request_sent",
    ActorType:     "system",
    Payload:       payload,
})
```

Recorder 会：
1. 将事件写入 `onboarding_audit_events`。
2. 输出结构化 zap log（logger 名称 `audit`）。

### 3.2 Domain Wrapper

Onboarding 通过 `AuditRecorder` 添加类型安全的 Stage 枚举，避免“magic string”。

```go
onboardingAudit := onboarding.NewAuditRecorder(recorder)
_ = onboardingAudit.RecordStageEvent(ctx, onboarding.StageEvent{
    ApplicationID: &appID,
    Stage:         onboarding.StageAgreement,
    Action:        "sign_completed",
    ActorType:     "vendor",
    Payload:       payload,
})
```

## 4. 数据模型

`onboarding_audit_events` 字段：

| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 主键 |
| application_id | UUID | 可空，关联 `vendor_applications` |
| vendor_id | UUID | 可空，审批后关联 vendor |
| stage | TEXT | 枚举：registration / submission / risk_evaluation / agreement / portal_setup / environment_provision |
| action | TEXT | 自定义动作描述 |
| actor_type | TEXT | system / reviewer / vendor / ops |
| actor_id | UUID | 可空，指向执行者 |
| payload | JSONB | 任意上下文（幂等写入） |
| created_at | TIMESTAMP | 创建时间 |

约束：
- GORM AutoMigrate + 20251013 SQL 迁移提供 CHECK 约束。
- 存储策略：事件不可更新/删除（仅追加）。

## 5. 事件规范

- `stage`: 由业务域枚举定义，禁止写入未声明的值。
- `action`: 使用动词过去式或事件描述，如 `sign_request_sent` / `risk_auto_rejected`。
- `actor_type`: system / reviewer / vendor / ops，必要时扩展。
- `payload`: JSON 对象，推荐不超过 10KB；包含关键字段（应用 ID、风险分数等）。

## 6. 与其他模块的协同

| 模块 | 协作点 |
|------|--------|
| Telemetry (`telemetry/onboarding_metrics.go`) | 记录阶段耗时与失败；审计事件可作为补充上下文 |
| HTTP Handlers | 调用领域服务 -> 审计 Wrapper -> Shared Recorder |
| Integrations (MinIO、风险引擎) | 在成功/失败回调处写审计事件 |
| Tests (`backend/tests/onboarding/harness.go`) | Harness 提供 `SeedAuditEvent` 辅助写入审计数据 |

## 7. 部署与运维

- 审计表包含敏感数据（KYC 信息引用）。数据库备份需纳入合规审计范围。
- 结构化日志默认写 stdout；生产环境应通过 log aggregation 收集。
- 若需要导出到其他系统，可在 Recorder 内增加 hook（如 Kafka producer）。

## 8. Roadmap 迭代

1. **多域支持**：新增其他业务域（许可证、下载）对应的 wrapper。
2. **查询接口**：构建审计查询 API + RBAC 权限。
3. **外部导出**：支持流式导出到 Kafka / SIEM。
4. **OpenTelemetry**：将审计事件同步转发至 OTLP trace/span。

## 9. FAQ

- **Q**: 审计记录失败怎么办？
  **A**: Recorder 返回 error，由上层服务决定是否回滚业务操作；建议关键路径确保事务一致。

- **Q**: Payload 太大影响性能？
  **A**: 建议只存结构化摘要，文件等大对象放对象存储并记录引用。

- **Q**: 如何在测试中使用？
  **A**: 引入 `backend/tests/onboarding/harness.go`，使用 `Harness.SeedAuditEvent()` 或直接访问 `Harness.Audit`。

