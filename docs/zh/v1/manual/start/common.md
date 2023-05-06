---
title: 配置介绍
date: 2022-05-06
description: PowerX安装完系统后，有一个初始化的配置，采用了页面化配置方案。

---

# 配置介绍

# 1. 直接修改etc/powerx.yml


```yaml
Server:
  Name: PowerX后台系统        # 服务器名称
  Host: 0.0.0.0             # 服务器地址
  Port: 8888                # 服务器端口
  Timeout: 30000            # 超时时间

Root:
  Account: root             # 管理员账号
  Password: root            # 管理员密码
  Name: 超级管理员           # 管理员名称

JWTSecret: dev              # JWT密钥

Casbin:
  SelfHosted: true           # 是否使用自己的Casbin服务

PowerXDatabase:
  DSN: host=localhost user=postgres password=powerx dbname=powerx port=5432 sslmode=disable TimeZone=UTC
  # 数据库连接信息

WechatOA:
  AppId: wx93607xxxxxxxxxx  # 微信公众号AppID
  Secret: 6ZwxxxtFouxxxxxxxxxxxxxxxxxxx0tgXYw4oh7KI  # 微信公众号Secret
  HttpDebug: true           # 是否启用HTTP调试模式

WechatPay:
  AppId: wx93607xxxxxxxxxx  # 微信支付AppID
  Secret:                    # 微信支付Secret
  MchID:                     # 商户号
  MchApiV3Key:               # 商户API密钥
  Key:                       # 商户支付密钥
  CertPath:                  # 商户证书路径
  KeyPath:                   # 商户证书密钥路径
  RSAPublicKeyPath:          # 微信支付平台RSA公钥路径
  SerialNo:                  # 微信支付平台证书序列号
  HttpDebug: true            # 是否启用HTTP调试模式

WechatMP:
  AppId: wx93607xxxxxxxxxx  # 微信小程序AppID
  Secret: 188c70xxxxxxxxxx70xxxxxxxxxx56c4  # 微信小程序Secret
  HttpDebug: true           # 是否启用HTTP调试模式

WeWork:
  CropId: wx93607xxxxxxxxxx  # 企业微信CropID
  AgentId: 1000005           # 企业微信应用AgentID
  Secret: 6ZwxxxtFouxxxxxxxxxxxxxxxxxxx0tgXYw4oh7KI  # 企业微信应用Secret
  HttpDebug: true            # 是否启用HTTP调试模式


```

