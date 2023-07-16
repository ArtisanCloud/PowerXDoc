---
title: 配置介绍
date: 2022-05-06
description: PowerX安装完系统后，有一个初始化的配置，采用了页面化配置方案。

---



# 配置介绍

## 1. 配置powerx.yaml文件 
下载完项目后，第一步先直接复制etc/powerx-example.yml 改名为etc/powerx.yaml

* 这里需要指出，改名为etc/powerx.yaml 是你本地项目的环境配置
* 如果你不设置这个配置路径，启动会自动启用etc/powerx.yaml

最新的配置，请参阅：[powerx-example.yaml](https://github.com/ArtisanCloud/PowerX/blob/release/v1.0.0/etc/powerx-example.yaml)



## 2. 选择你要的启动方式：
### [本地IDE启动](installation-ide.md)
### [本地命令行启动](installation-command.md)
###  [docker部署启动](installation-docker.md)
###  [docker-compose部署启动](installation-docker-compose.md)

[//]: # (###  [k3s部署启动]&#40;installation-k3s.md&#41;)

[//]: # ()
[//]: # (###  [k8s部署启动]&#40;installation-k8s.md&#41;)

