
# PowerX CLI 家族 · 统一安装与规范

> 目标：PowerX 各仓（PX / PX-ADMIN / PLG / MKP）CLI 命名统一、安装统一、版本统一。
> 语言：Golang。安装源：GitHub。适用系统：macOS / Linux / Windows。

## 1. 命名与仓库映射

| 角色                      | 二进制名（推荐）    | Go 包路径（示例）                                             | 仓库                            |
| ----------------------- | ----------- | ------------------------------------------------------ | ----------------------------- |
| PowerX（Backend，PX）      | `px`        | `github.com/ArtisanCloud/PowerX/cmd/px`                | `ArtisanCloud/PowerX`         |
| PowerX Admin（PX-ADMIN）  | `px-admin`  | `github.com/ArtisanCloud/PowerXAdmin/cmd/px-admin`     | `ArtisanCloud/PowerXAdmin`    |
| PowerX Plugin（PLG）      | `px-plugin` | `github.com/ArtisanCloud/PowerXPlugin/cmd/px-plugin`   | `ArtisanCloud/PowerXPlugin`   |
| PowerX Marketplace（MKP） | `px-market` | `github.com/Matrix-X/PowerXPluginMarket/cmd/px-market` | `Matrix-X/PowerXPluginMarket` |

> 约定：
>
> * 二进制命名统一为 `px-<scope>`（PX 主入口简写为 `px`）。
> * 各仓 CLI 的 `main.go` 放在 `cmd/<binary>/` 目录，便于 `go install`。

## 2. 快速安装（Go ≥ 1.21）

> 如果网络直连 GitHub 略慢，先配置 Go 代理（可选）：
> `export GOPROXY=https://proxy.golang.org,direct`

**安装最新版本：**

```bash
# PX
go install github.com/ArtisanCloud/PowerX/cmd/px@latest
# PX-ADMIN
go install github.com/ArtisanCloud/PowerXAdmin/cmd/px-admin@latest
# PLG
go install github.com/ArtisanCloud/PowerXPlugin/cmd/px-plugin@latest
# MKP
go install github.com/Matrix-X/PowerXPluginMarket/cmd/px-market@latest
```

**安装指定版本（建议在 CI 固定版本）：**

```bash
go install github.com/ArtisanCloud/PowerX/cmd/px@v1.12.0
go install github.com/ArtisanCloud/PowerXAdmin/cmd/px-admin@v1.12.0
go install github.com/ArtisanCloud/PowerXPlugin/cmd/px-plugin@v1.12.0
go install github.com/Matrix-X/PowerXPluginMarket/cmd/px-market@v1.12.0
```

> 安装路径：`$GOPATH/bin`（若未设 GOPATH，则为 `$HOME/go/bin`）。
> 请确保该目录已加入 `PATH`。

**验证：**

```bash
px --version
px-admin --version
px-plugin --version
px-market --version
```

## 3. 通过 GitHub Releases 安装（可选）

> 若各仓提供预编译二进制（建议命名）：
> `px-<scope>_<version>_<os>_<arch>.tar.gz`
> 示例：`px-plugin_v1.12.0_darwin_amd64.tar.gz`

**通用安装脚本（bash，macOS/Linux）：**

```bash
# 用法：install_px_bin <owner/repo> <binary> <version> <os> <arch>
install_px_bin() {
  REPO="$1"; BIN="$2"; VER="$3"; OS="$4"; ARCH="$5"
  URL="https://github.com/${REPO}/releases/download/${VER}/${BIN}_${VER}_${OS}_${ARCH}.tar.gz"
  TMP="$(mktemp -d)"
  curl -fsSL "$URL" -o "$TMP/${BIN}.tar.gz"
  tar -xzf "$TMP/${BIN}.tar.gz" -C "$TMP"
  install "$TMP/$BIN" /usr/local/bin/$BIN
  rm -rf "$TMP"
  command -v $BIN >/dev/null && $BIN --version
}

# 示例：
install_px_bin ArtisanCloud/PowerX px v1.12.0 $(uname -s | tr '[:upper:]' '[:lower:]') amd64
install_px_bin ArtisanCloud/PowerXAdmin px-admin v1.12.0 $(uname -s | tr '[:upper:]' '[:lower:]') amd64
install_px_bin ArtisanCloud/PowerXPlugin px-plugin v1.12.0 $(uname -s | tr '[:upper:]' '[:lower:]') amd64
install_px_bin Matrix-X/PowerXPluginMarket px-market v1.12.0 $(uname -s | tr '[:upper:]' '[:lower:]') amd64
```

> Windows（PowerShell）可直接下载对应 zip 并手动放入 `PATH` 目录，或用 Scoop/Chocolatey 打包分发（可选）。

## 4. 升级 / 卸载

**升级到最新：**

```bash
go install github.com/ArtisanCloud/PowerX/cmd/px@latest
go install github.com/ArtisanCloud/PowerXAdmin/cmd/px-admin@latest
go install github.com/ArtisanCloud/PowerXPlugin/cmd/px-plugin@latest
go install github.com/Matrix-X/PowerXPluginMarket/cmd/px-market@latest
```

**卸载：**

```bash
rm -f "$(go env GOPATH)/bin/px" \
      "$(go env GOPATH)/bin/px-admin" \
      "$(go env GOPATH)/bin/px-plugin" \
      "$(go env GOPATH)/bin/px-market"
```

## 5. Shell 补全（如已实现）

```bash
# bash
px completion bash    | sudo tee /etc/bash_completion.d/px >/dev/null
px-admin completion bash | sudo tee /etc/bash_completion.d/px-admin >/dev/null
px-plugin completion bash | sudo tee /etc/bash_completion.d/px-plugin >/dev/null
px-market completion bash | sudo tee /etc/bash_completion.d/px-market >/dev/null

# zsh
px completion zsh          > "${fpath[1]}/_px"
px-admin completion zsh    > "${fpath[1]}/_px-admin"
px-plugin completion zsh   > "${fpath[1]}/_px-plugin"
px-market completion zsh   > "${fpath[1]}/_px-market"
```

> 需要在各 CLI 中暴露 `completion` 子命令（Cobra 自动支持）。

## 6. 版本与输出规范（强烈建议）

* 统一打印版本格式：

  ```
  PowerX CLI Family v1.12.0 (binary: px, commit: abcdef0, date: 2025-10-20)
  ```
* 均支持：

  ```
  --version / version
  --help    / help
  ```
* 支持 `PX_CI=1`（或 `--ci`）输出纯机器可读日志，便于 CI 集成。

## 7. FAQ

* **提示 `command not found`？**
  把 `$(go env GOPATH)/bin` 或 `$HOME/go/bin` 加入 `PATH`。

* **公司网络访问 GitHub 慢？**
  使用 `GOPROXY` 或者改用 Releases 预编译二进制。

* **多版本并存？**
  用版本号后缀安装到不同路径，或使用 `asdf`/`rtx` 自定义 shim。

---
