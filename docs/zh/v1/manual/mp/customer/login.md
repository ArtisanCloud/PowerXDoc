---
title: 小程序客户登录机制
date: 2022-12-18
---

# 小程序登录

[官方文档介绍](https://developers.weixin.qq.com/miniprogram/dev/framework/open-ability/login.html)

小程序可以通过微信官方提供的登录能力方便地获取微信提供的用户身份标识，快速建立小程序内的用户体系。

![img](https://res.wx.qq.com/wxdoc/dist/assets/img/api-login.2fcc9f35.jpg)




## PowerX小程序登录和获取收取信息的流程

按照官方的流程示意图，同时我们制定用户的手机号码是必要的授权信息,我们开发小程序登录的大致流程如下：

1. 客户打开小程序，小程序的检查入口事件，比如onLaunch，onshow，检查本地是否有jwt-token存在 
2. 如果存在，则直接访问业务接口。
3. 如果jwt-token访问后台接口过期，则重新获取token。
4. 如需重新登录，将会默认调用wx.login()，获取code 
5. 小程序获取Code后，返回给开发者服务端,可以理解login接口
6. 开发者服务端，使用code换取openid和session_key
7. 根据openid获取数据库中的用户授权信息（手机号码，昵称，头像），手机号码为授权依据。 
8. 如果后台发现，openid有生成过手机号码授权的客户记录，update一条小程序客户的信息，包含openid和session_key，返回并返回需要手机授权结果，包括jwt-token 前端检查，有客户信息，则jwt-token，返回给到前端小程序，保存在前端小程序
9. 如果后台发现，openid没有生成过手机号码授权的客户记录，返回前端，要求需要客户手机授权注册，前度检查，需要跳转到登陆界面，通过获取code和手机授权信息，再次传给后段的客户注册接口
10. 后端通过token的customerUUID,更新用户数据。



后台的接口
* api/v1/mp/customer/login
* api/v1/mp/customer/authByPhone