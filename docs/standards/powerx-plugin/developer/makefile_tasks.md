# Makefile 任务与构建说明（Makefile Tasks & Build System）

> 本页目标：帮助开发者理解 **PowerX Plugin Base** 的多文件 Make 体系，  
> 包括任务划分、变量继承、构建流程与发布模式。  
> 读者对象：工程师 / CI 维护者 / 发布负责人。

---

## 一、系统概述

PowerX 插件模板采用模块化的 **Makefile 体系**，  
所有命令集中定义在以下文件中：

```

make-files/
├── build.mk        # 后端编译与打包逻辑
├── common.mk       # 公共变量、颜色输出与帮助函数
├── dev.mk          # 本地开发初始化（lint、deps）
├── docker.mk       # Docker 构建与运行
├── migrate.mk      # 数据库迁移任务
├── project.mk      # 主入口（include 所有子 makefile）
└── test.mk         # 测试与覆盖率

````

项目根目录通常包含一个顶层 `Makefile`：

```makefile
include make-files/project.mk
````

这样可以直接在根目录执行：

```bash
make build
make package
make docker-build
```

---

## 二、核心设计思想

| 原则        | 说明                                                   |
| --------- | ---------------------------------------------------- |
| **模块化**   | 每个 `.mk` 文件负责一个构建领域（编译 / 测试 / 打包 / Docker）。          |
| **可覆盖变量** | 变量都可通过命令行覆盖，如 `VERSION=0.1.2 make build`。            |
| **显式依赖**  | 各任务显式调用子任务，例如 `release` 依赖 `build + frontend-build`。 |
| **CI 友好** | 所有路径、版本号均从变量读取，方便注入环境参数。                             |

---

## 三、关键变量

| 变量名                  | 默认值                                | 说明                                   |
| -------------------- | ---------------------------------- | ------------------------------------ |
| `VERSION`            | `0.1.0`                            | 当前插件版本号                              |
| `BUILD_DIR`          | `backend/bin`                      | Go 二进制输出路径                           |
| `FRONTEND_BUILD_CMD` | `npm --prefix web-admin run build` | 前端构建命令                               |
| `DIST_ROOT`          | `dist`                             | 本地安装目录根（PowerX `install/local` 模式使用） |
| `RELEASE_ROOT`       | `target`                           | 发布产物目录根                              |
| `DOCKER_IMAGE`       | `powerx-plugin-base:$(VERSION)`    | Docker 镜像名称                          |
| `PROJECT_NAME`       | `powerx-plugin-base`               | 插件名称（影响压缩包名）                         |
| `GO_BUILD_FLAGS`     | 空                                  | 额外 Go 构建参数（如 `-tags release`）        |

> 可在执行命令时覆盖任意变量：
>
> ```bash
> BUILD_DIR=backend/out VERSION=0.1.1 make build
> ```

---

## 四、主要任务分类

### 🧱 Build & Compile

| 命令                     | 说明                                                   |
| ---------------------- | ---------------------------------------------------- |
| `make build`           | 构建本机平台后端二进制（默认输出至 `backend/bin/plugin`）              |
| `make build-linux`     | 交叉编译 Linux/amd64 二进制                                 |
| `make frontend-build`  | 执行 `npm --prefix web-admin run build` 构建前端 `.output` |
| `make dist`            | 生成安装目录结构到 `dist/<version>/`                          |
| `make release`         | 构建完整发布产物 `target/<version>/`（含前后端）                   |
| `make package`         | 压缩 `dist/<version>` 目录为 zip                          |
| `make package-release` | 压缩 `target/<version>` 目录为 zip                        |
| `make clean`           | 清除缓存与临时文件                                            |

#### 产物目录结构示例

```
dist/
  0.1.0/
    plugin.yaml
    backend/bin/plugin
    web-admin/.output/
```

---

### 🧪 Test & Check

| 命令                   | 说明                           |
| -------------------- | ---------------------------- |
| `make lint`          | 运行 `golangci-lint run ./...` |
| `make test`          | 执行单元测试                       |
| `make test-coverage` | 输出测试覆盖率报告                    |
| `make check`         | 连续执行 lint + test             |

> 若未安装 `golangci-lint`，执行 `make dev-setup` 会自动安装到 `$(GOPATH)/bin`。

---

### 🧰 Dev Utilities

| 命令               | 说明                       |
| ---------------- | ------------------------ |
| `make dev-setup` | 初始化开发依赖（Go 工具、Node 模块）   |
| `make run`       | 启动后端服务（含日志与热重载配置）        |
| `make migrate`   | 运行数据库迁移（参照 `migrate.mk`） |
| `make seed`      | 初始化基础数据                  |
| `make fmt`       | 执行 go fmt 与 eslint 格式化   |

---

### 🐳 Docker

| 命令                  | 说明                              |
| ------------------- | ------------------------------- |
| `make docker-build` | 构建 Docker 镜像（使用 `DOCKER_IMAGE`） |
| `make docker-run`   | 运行容器并暴露端口                       |
| `make docker-clean` | 清理旧镜像与容器                        |

Docker 构建过程默认包含：

```bash
docker build -t $(DOCKER_IMAGE) .
```

> 可通过以下覆盖镜像标签：
>
> ```bash
> DOCKER_IMAGE=registry.mycorp.com/powerx/base:1.0.0 make docker-build
> ```

---

## 五、组合任务依赖关系

```
release
 ├─ build
 ├─ frontend-build
 └─ dist
      └─ package-release
```

每个高层任务自动依赖前置任务：

| 主任务               | 自动依赖                            |
| ----------------- | ------------------------------- |
| `release`         | `build + frontend-build + dist` |
| `package`         | `dist`                          |
| `package-release` | `release`                       |
| `docker-build`    | `build`                         |

---

## 六、CI/CD 建议集成示例

### GitHub Actions 示例

```yaml
name: Build & Release
on:
  push:
    tags: ['v*']

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-go@v5
        with: { go-version: '1.21' }
      - uses: actions/setup-node@v4
        with: { node-version: '18' }

      - name: Install deps
        run: make dev-setup

      - name: Build release
        run: VERSION=${GITHUB_REF_NAME#v} make release

      - name: Package zip
        run: make package-release
```

---

## 七、环境变量注入（CI/本地）

常见覆盖用法：

| 环境变量                             | 说明                |
| -------------------------------- | ----------------- |
| `POWERX_ENV=dev`                 | 当前环境名             |
| `VERSION=$(git describe --tags)` | 从 git tag 自动提取版本号 |
| `GOOS/GOARCH`                    | 交叉编译目标平台          |
| `FRONTEND_BUILD_CMD`             | 替换默认前端构建逻辑        |
| `RELEASE_ROOT`                   | 替换默认产物根目录         |

---

## 八、发布产物与安装方式

### 本地目录模式

```bash
make build frontend-build
make dist
```

PowerX 可直接安装：

```
install/local?src_dir=$(pwd)/dist/0.1.0
```

### Release 模式（对外分发）

```bash
make release
make package-release
```

生成：

```
target/0.1.0/
└── powerx-plugin-base-0.1.0-release.zip
```

---

## 九、扩展与自定义建议

| 场景      | 建议操作                                             |
| ------- | ------------------------------------------------ |
| 添加新任务   | 在 `project.mk` 引入自定义 `.mk` 文件                    |
| 拆分多插件构建 | 使用变量 `PLUGIN_ID` + `PLUGIN_PATH` 控制              |
| 多平台构建   | 结合 `GOOS/GOARCH` 循环调用                            |
| 版本追踪    | 在 CI 中注入 `VERSION=$(git rev-parse --short HEAD)` |
| 环境隔离    | 在 `Makefile` 中使用 `.env.<stage>` 文件加载变量           |

---

## 十、常见问题（FAQ）

**Q:** 为什么 `make frontend-build` 报错 `.output` 不存在？
A: 先执行 `npm --prefix web-admin install`，再运行构建命令。

**Q:** 如何跳过前端构建？
A: 执行 `make build dist` 即可，`make release` 会自动跳过缺失的前端目录检查。

**Q:** Windows 下执行报错？
A: 推荐使用 WSL2 / Docker 环境执行构建任务。

---

## 下一步阅读

* 🚀 [部署与 Docker 指南](../deploy/docker_guide.md)
* 🧩 [plugin.yaml 规范](../contract/plugin_yaml_spec.md)
* 🔧 [构建与打包指引（build.mk 详细说明）](../../make-files/guide.md)
