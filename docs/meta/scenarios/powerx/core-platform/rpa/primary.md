# PowerX RPA 设计文档（完整可复制）

## 一、设计目标

PowerX-RPA 的目标：为企业智能体提供跨系统自动化执行能力，使智能体不仅能“决策”，还能**落地执行**企业内部的流程动作，包括：

* 网页自动化
* 系统登录与人机交互
* 文件处理与数据整理
* 定时任务
* 复杂的跨系统流程自动化

RPA 扮演的是 **自动执行引擎**，补足 CoreX 智能体的感知与任务落地能力。

---

## 二、总体定位：独立插件 + 深度集成 CoreX

### 1. 为什么做成独立插件？

* 可独立商业化（企业自动化本身就是付费能力）
* 用户可选择安装，不影响 CoreX 轻量运行
* 插件可扩展运行器（BrowserRunner, DesktopRunner, API Runner）
* 对不同行业可定制
* 安全隔离（RPA 涉及模拟鼠标键盘、登录密码、Cookie 等）

### 2. 为什么又要深度集成到 CoreX？

因为智能体必须能**调度** RPA：

* 意图识别 → 自动编排 → 调用 RPA Task → 得到执行结果
* CoreX 的 Workflow Engine 可以内嵌 RPA Step 节点
* RPA 执行日志纳入统一可观测性层
* 权限体系复用 CoreX ACL

最终形态：

```
PowerX (企业 AgentOS)
 ├── CoreX（智能体执行框架）
 ├── Plugin
 │    ├── RPA Plugin（Browser / Desktop / API / Script Runner）
 │    ├── CRM Plugin
 │    ├── E-Commerce Plugin
 │    └── ...
```

---

## 三、功能范围

### 1. 可视化自动化构建器

* 录制流程（Record）
* 拖拽式节点（Click、Input、Wait、Loop、IF、API 调用、文件处理）
* 生成标准化的 RPA Flow JSON

### 2. 网页自动化

* DOM XPath/Selector 识别
* 自动点击、输入、读取内容
* 多步表单、分页、滚动
* Cookie 与 Session 管理
* 异步元素等待机制

### 3. 桌面自动化（可选插件包）

* 图像识别点击
* OCR 文本采集
* 模拟键鼠
* 多窗口管理

### 4. API 自动化

* REST/GraphQL 调用
* 作为一个节点插入流程图
* 与 CoreX 知识库/CRM 等系统打通

### 5. 文件处理

* Excel/CSV 操作
* PDF 文本识别
* 临时文件池
* 上传/下载自动化

### 6. 智能体对接能力

* Agent→RPA：执行任务
* RPA→Agent：产出变量（如采集的数据）
* 复杂流程自动化时，Agent 负责监督、补偿、判断

### 7. 权限与安全

* 加密凭据
* 沙箱执行
* 审计日志
* 人工确认步骤（Approval Step）

---

## 四、架构设计

### 1. 模块结构（插件内部结构）

```
PowerXPlugin-RPA/
 ├── plugin.yaml
 ├── backend
 │     ├── cmd/rpa-plugin
 │     ├── internal
 │     │     ├── flow     (RPA 流程规范)
 │     │     ├── runner   (执行引擎)
 │     │     ├── recorder (录制器)
 │     │     ├── browser  (网页自动化)
 │     │     ├── desktop  (桌面自动化，可选)
 │     │     └── api      (API Runner)
 │     └── ...
 ├── web-admin
 │     ├── pages/rpa
 │     ├── components/flow-editor
 │     └── ...
 └── docs/
```

---

## 五、RPA Flow 规范

### 1. 标准结构

```json
{
  "id": "rpa-flow-001",
  "name": "采购网站自动抓取",
  "triggers": ["manual", "cron"],
  "steps": [
    {
      "type": "browser.open",
      "url": "https://xxx.com/login"
    },
    {
      "type": "browser.input",
      "selector": "#username",
      "value": "{{env.USER}}"
    },
    {
      "type": "browser.click",
      "selector": "#submit"
    },
    {
      "type": "wait.dom",
      "selector": ".dashboard"
    },
    {
      "type": "browser.extract.list",
      "selector": ".items",
      "output": "itemList"
    }
  ]
}
```

### 2. Step 类型分类

* `browser.*`（网页操作）
* `desktop.*`（桌面动作）
* `api.*`（API 调用）
* `data.*`（Excel、PDF 等）
* `flow.*`（分支、循环、并行）
* `agent.*`（智能体补充判断）

---

## 六、与 CoreX 的整合设计

### 1. Workflow Engine 中的 RPA Step

CoreX 的 Workflow 支持以下节点：

* 普通 LLM 推理节点
* Tool 调用节点
* **RPA Step 节点（由插件注入）**

示例：

```
[用户意图] → [智能体分析] → [RPA 执行流程] → [结果总结] → [输出]
```

### 2. 调度机制

CoreX → RPA Plugin：

```
POST /rpa/flow/run
{
  "flowId": "xxx",
  "params": {...}
}
```

RPA Plugin → CoreX：

* 回传变量给智能体
* 异常情况由智能体做恢复（ReAct 或 Plan-and-Execute）

### 3. Agent 的“自动流程补全”

智能体可以：

* 自动生成 RPA Flow
* 自动补全缺失的 XPath
* 根据失败情况自动修复流程
* 自动生成数据清洗逻辑

---

## 七、插件管理

### 1. 插件安装

* 与其他 PowerXPlugin 一样
* 在 PowerX 主系统可按需启用
* 桌面自动化部分可拆分为独立扩展包（RPA-Desktop）

### 2. 计费策略（可选）

* 按执行次数
* 按每月流程时长
* 按流程数量
* “深度行业版本”（如投标领域专版 RPA）

---

## 八、典型场景示例

### 场景 1：自动化投标信息抓取

* 打开政府采购网
* 登录
* 自动翻页抓取标讯
* 结构化数据提交给智能体进行筛选
* 最终自动推送到企业负责人

### 场景 2：跨系统同步（CRM ↔ ERP）

* 从 ERP 导出月度对账单
* 自动批量导入到 CRM
* 智能体审核异常订单
* 输出对账报告

### 场景 3：企业 OA 自动化

* 登录 OA
* 自动查询今日待办
* 下载附件并解析
* 产出日报并自动填报

---

## 九、未来扩展能力

* AI 自动解析 UI → 自动生成 RPA 节点
* Vision RPA（CV 模型识别界面控件）
* 语义化构建 RPA（用户一句话 → 自动生成流程）
* 多智能体协同执行（如拆分多页任务）

---

## 十、总结（一句话）

PowerX RPA 是一个“可独立安装的执行引擎插件”，但与 CoreX 智能体深度整合，使企业智能体能够真正“自动执行”跨系统业务流程。

---

> 如需补充内容，可进一步扩展：RPA Flow JSON Schema / 插件 Go 后端骨架 / Flow Editor 组件结构 / 系统时序图等。
