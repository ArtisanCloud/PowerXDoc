---
title: 开发规范
date: 2022-12-18
description: PowerX安装完系统后，有一个初始化的配置，采用了页面化配置方案。

---

# 开发规范

## 项目设计结构介绍
* api: 配置玩api层的模块，由GoZero的GoCtl生成，
  * admin: 管理后台的api
  * mp: 小程序的api
  * custom: 自定义的api
  * plugin: 插件的api
* middleware: 中间件
* router: 路由，由GoZero的GoCtl生成
* handle: 控制器的入口，由GoZero的GoCtl生成
* Logic: 业务逻辑
* UC：crud系列包括，分页列表，详情，删除，更新，增新Upsert，transaction，
* Model：表字段配置，关系表配置
