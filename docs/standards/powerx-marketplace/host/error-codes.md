# Host Integration Error Codes

| Code | HTTP Status | Description | Client Action |
|------|-------------|-------------|---------------|
| ERR_HEARTBEAT_PAYLOAD | 400 | Heartbeat payload missing required fields or contains invalid identifiers. | Fix payload and retry immediately. |
| ERR_HEARTBEAT_DISABLED | 503 | Heartbeat endpoints are disabled by configuration or maintenance. | Back off and retry after the maintenance window. |
| ERR_HEARTBEAT_STATE | 409 | Heartbeat rejected due to invalid status transition. | Inspect response message, correct status, and resubmit. |
| ERR_HEARTBEAT_OFFLINE | 200 | Marketplace marked host offline after missing heartbeats beyond threshold. | Reconnect host, send heartbeat, and monitor status until healthy. |

> The Marketplace responds using the standard envelope `{code,message,data}`. Error codes surface in the `message` field alongside actionable text.
