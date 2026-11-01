在当前目录执行下面两行。工具只查询官方 Release、校验发布清单并保存版本，**不会安装或升级服务**；可先[查看工具源码](/downloads/resolve-powerx-release.py)。

```bash
curl -fsSLo resolve-powerx-release.py https://raw.githubusercontent.com/ArtisanCloud/PowerXDoc/feat/docs-clear-start/scripts/tutorials/resolve-release.py
python3 resolve-powerx-release.py
```

**通过条件**：显示选中的 Release、发布时间及是否预发布，并生成 `powerx-release/release.env`。后续步骤使用这份版本记录；网络或校验失败会停止，不会退回旧版。已生成文件时直接继续，不要重复覆盖。
