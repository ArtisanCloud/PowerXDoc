---
title: 配置介绍
date: 2022-05-06
description: PowerX安装完系统后，有一个初始化的配置，采用了页面化配置方案。

---



# 配置介绍

## 1. 配置powerx.yaml文件 
下载完项目后，第一步先直接复制etc/powerx-example.yml 改名为etc/powerx.yml

* 这里需要指出，改名为etc/powerx.yml 是你本地项目的环境配置
* 如果你不设置这个配置路径，启动会自动启用etc/powerx.yaml

最新的配置，请参阅：[powerx-example.yaml](https://github.com/ArtisanCloud/PowerX/blob/develop/etc/powerx-example.yaml)

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

JWT:
  JWTSecret: dev              # Dashboard JWT密钥
  MPJWTSecret: dev_mp              # 小程序 JWT密钥
  WebJWTSecret: dev_web              # Web JWT密钥

Casbin:
  SelfHosted: true           # 是否使用自己的Casbin服务

PowerXDatabase:
  # 数据驱动
  Driver: postgres # 我们主要使用基于Gorm+postgres
  #  Driver: mysql  # 可以连接，但是我们未基于mysql来开发应用。

  # 数据库连接信息
  DSN: host=localhost user=powerx password=powerxpw dbname=powerx port=5432 sslmode=disable TimeZone=UTC
  # 数据库是否初始化定制的种子数据
  SeedCommerceData: false

RedisBase:
  Host: 127.0.0.1:6379
  Password:

WechatOA:
  AppId: wx93607xxxxxxxxxx  # 微信公众号AppID
  Secret: 6ZwxxxtFouxxxxxxxxxxxxxxxxxxx0tgXYw4oh7KI  # 微信公众号Secret
  AESKey: PBcwPOp0e6tFou    # 微信公众号AES密钥
  OAuth:
    Callback: "https://wechat-oa.artisan-cloud.com/callback"
    Scopes: [ ]
  HttpDebug: true           # 是否启用HTTP调试模式
  Debug: false              # 是否启用微信hint的调试模式

WechatPay:
  AppId: wx93607xxxxxxxxxx    # 微信支付AppID
  AESKey: PBcwPOp0e6tFou      # 微信支付AES密钥
  MchId: "1626253240"        # 商户号
  MchApiV3Key:                # 商户API密钥
  Key:                        # 商户支付密钥
  CertPath:                   # 商户证书路径
  KeyPath:                    # 商户证书密钥路径
  RSAPublicKeyPath:           # 微信支付平台RSA公钥路径
  SerialNo:                   # 微信支付平台证书序列号
  WechatPaySerial:            # 微信支付序列号
  NotifyUrl:                  # 微信支付通知URL
  HttpDebug: true             # 是否启用HTTP调试模式
  Debug: false              # 是否启用微信hint的调试模式

WechatMP:
  AppId: wx93607xxxxxxxxxx  # 微信小程序AppID
  Secret: 188c70xxxxxxxxxx70xxxxxxxxxx56c4  # 微信小程序Secret
  AESKey: PBcwPOp0e6tFou      # 微信小程序AES密钥
  OAuth:
    Callback: "https://wechat-mp.artisan-cloud.com/callback"
    Scopes: [ ]
  HttpDebug: true           # 是否启用HTTP调试模式
  Debug: false              # 是否启用微信hint的调试模式

WeWork:
  CropId: wx93607xxxxxxxxxx  # 企业微信CropID
  AgentId: 1000005           # 企业微信应用AgentID
  Secret: 6ZwxxxtFouxxxxxxxxxxxxxxxxxxx0tgXYw4oh7KI  # 企业微信应用Secret
  Token: tEBuofHfxxxxxxxxxxxxBPTq9K                      # 企业微信应用的Token，用于处理接收到的消息
  EncodingAESKey: Gv3T4dP5QBDxxxxxxxxxxxxxxxxxxxxxxxc2vwlmUhY  # 企业微信应用的 EncodingAESKey，用于加密/解密接收和发送的消息
  HttpDebug: true            # 是否启用HTTP调试模式
  Debug: false              # 是否启用微信hint的调试模式

MediaResource:
  LocalStorage:
    StoragePath:
  OSS:
    Enable: true
    Minio:
      Endpoint: 127.0.0.1:9001
      Credentials:
        AccessKey: powerx
        SecretKey: powerxpwd
      useSSL: false
```


## 2. 选择你要的启动方式：
### [本地IDE启动](installation-ide.md)
### [本地命令行启动](installation-command.md)
###  [docker部署启动](installation-docker.md)
###  [docker-compose部署启动](installation-docker-compose.md)

[//]: # (###  [k3s部署启动]&#40;installation-k3s.md&#41;)

[//]: # ()
[//]: # (###  [k8s部署启动]&#40;installation-k8s.md&#41;)

