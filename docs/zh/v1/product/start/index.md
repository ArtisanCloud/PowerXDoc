---
title: 公司CRM开发系统
date: 2023-01-18
description: 关于PowerX

---

# Hello PowerX

无论哪家公司，都离不开自己的业务，而没有一个业务会离得开[CRM](https://baike.baidu.com/item/客户关系管理/254554?fromtitle=CRM&fromid=165070&fr=aladdin)，大到上市公司，小到初创团队，公司的团队永远需要有业务在运作，而业务运作的核心就是客户（需求），产品（方案）。


而PowerX就是一个开放式的项目，想梳理出一套基于CRM为基础的产品结构，从而衍生出更多应用场景的业务模式，打造一个灵活的，可扩展，多业务形态的产品项目。

## PowerX主打的业务模型界定：

* 客域电商直销 - B2C模式 (Business to Customers)
    * 基于CRM的电商功能模式
    * 支持客户裂变


* [SCRM](https://www.woshipm.com/it/4281421.html)基础模式
  * 基于企业微信的社交私域功能。
  * 由于是基础功能，所以基本上是扩展了企业微信的业务功能，以私域客户的触达和管理为主。


* 分销电商(PowerX-Pro) - BCC模式 (Business to Channels to Customers)
    * 加入了分销渠道的中间关系维护
    * 提供多渠道的定价策略
    * 提供多级渠道分润的机制

---
<br>

不为其他，就我们自己团队可以方便的把一些通用，常用的业务功能，抽象出很多模块，方便我们可以为特定的行业客户，做一些定制化的产品设计和开发。


我们力争产品达到一定的规范，可以方便各行业的IT团队使用。

虽然现在市面上，CRM已经有很多SaaS平台，但是我们是想自己体验一下作为有私有化部署的客户诉求，怎么可以完成一个比较完整的产品使用。

<br><br>


# PowerX的系统方案，组成部分分别包括：

* 产品设计
* 中台服务端  
* 后台管理页面
* 移动端

## 产品设计
提供开放式产品需求设计文档 [PowerXDoc](https://github.com/ArtisanCloud/PowerXDoc)，帮助用户理解该产品的设计逻辑，如有不完整或不正确，可以联系我们共同完善和迭代这个产品需求。
> PowerXDoc 开源

## 中台服务端
[PowerX](https://github.com/ArtisanCloud/PowerX)是后台服务端，基于[Go-Zero](https://go-zero.dev/cn/)微服务框架开发的，后段所有API接口。
> PowerX 开源

## 后台管理页面
[PowerXDashboard](https://github.com/ArtisanCloud/PowerXDashboard)是对应后台管理页面，基于[Arco Design Vue](https://arco.design)提供一套独立端WebUI，对接admin业务操作。
> PowerXDashboard 开源

## 移动端
而移动端，我们自身有一个"小裂匠(ArtisanForce)"的产品服务，开发基于[UniApp](https://uniapp.dcloud.net.cn)前端跨平台框架，兼容小程序和H5。  
> 提供基础功能的开源小程序，因为前端的应用比较多样性，所以我们只会开源一部分基础的功能，给予演示。


