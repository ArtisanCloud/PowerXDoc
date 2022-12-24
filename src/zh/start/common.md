---
title: 安装配置
date: 2022-12-18
description: PowerX安装完系统后，有一个初始化的配置，采用了页面化配置方案。

---

# 安装配置

有两种方式可以配置项目的配置文件

# 1. 在Web启动界面上初始化config

## App配置

![img.png](images/config-app.png)


### 系统名称

- 类型: `字符串`
- 必传: `是`
- 默认值: `PowerX后台系统`


### 部署环境

- 类型: `字符串`
- 必传: `是`
- 默认值: `local`
- 描述: 你可以按照你的真实环境去配置: 
  - local
  - develop
  - test
  - production


### 本地化

- 类型: `字符串`
- 必传: `是`
- 默认值: `zh_CN`
- 描述: 你可以按照你的语言环境去配置:
  - zh_CN
  - tw_CN
  - hk_CN
  - en_US



### 时差

- 类型: `字符串`
- 必传: `是`
- 默认值: `Asia/Shanghai`



## Web配置

![img.png](images/config-web.png)

### 启动服务器地址

- 类型: `字符串`
- 必传: `是`
- 默认值: `0.0.0.0`


### 服务器端口

- 类型: `字符串`
- 必传: `是`
- 默认值: `8000`


## JWT服务器授权机制配置

[JWT生成教程参考](https://docs.mia-platform.eu/docs/runtime_suite/client-credentials/jwt_keys)

```bash
# 生成JWT密钥命令
> ssh-keygen -t rsa -b 4096 -m PEM -f jwtRS256.key
# 不需要设置passphrase

# 生成JWT公钥命令
> openssl rsa -in jwtRS256.key -pubout -outform PEM -out jwtRS256.key.pub


# 打印密钥
> cat jwtRS256.key
-----BEGIN RSA PRIVATE KEY-----
MIIEowIBAAKCAQEAwRIRLjKml+zTq6Dnyoh8Uis3tiq3a8EIgqKU/gxW2/lll7Nh
CRKSgamly1vKR6pQXmAbhNvmzR6gwOZGGM+5oGEh3vqs0iCDBIwkGZkA/shj/C97
....
qDN/v+3cVWaWDijivzJ2qPaCuPnkKI8yFGT8AOzv5tSh+ImhgBqC4kYnbJWxVB46
4iHsU1xEp+PHw0O0XSMAy2/ygnq9YEGGiEMuDdSXwS/BWel+7xww
-----END RSA PRIVATE KEY-----


# 打印公钥
> cat jwtRS256.key.pub
-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAwRIRLjKml+zTq6Dnyoh8
...
wi52wqDhh+OQbkX9LUSsu3IRG5Nsg2A0zsZWYqK2fRcpI+voRWz09uUu99AOcVSw
6QIDAQAB
-----END PUBLIC KEY-----


```

![img.png](images/config-jwt.png)


### 公钥

- 类型: `字符串`
- 必传: `是`
- 默认值: ``


### 密钥

- 类型: `字符串`
- 必传: `是`
- 默认值: ``


## 日志路径配置

![img.png](images/config-log.png)
### 日志存储路径
- 类型: `字符串`
- 必传: `是`
- 默认值: `/var/log/ArtisanCloud/PowerX-dev`
- 描述: `请确保设置的路径，有足够的访问权限`


## 数据库配置

![img.png](images/config-database.png)
### 启动数据库服务地址
- 类型: `字符串`
- 必传: `是`
- 默认值: `127.0.0.1`


### 数据库端口
- 类型: `字符串`
- 必传: `是`
- 默认值: `5432`


### 数据库名称
- 类型: `字符串`
- 必传: `是`
- 默认值: `powerx`


### 数据库用户名称
- 类型: `字符串`
- 必传: `是`
- 默认值: `powerxdev`
- 描述: `用户填入自己配置在数据库的用户账号`


### 表前缀设置
- 类型: `字符串`
- 必传: `是`
- 默认值: `powerxdev`
- 描述: `目前不可编辑`


### 数据库默认摘要
- 类型: `字符串`
- 必传: `是`
- 默认值: `public`
- 描述: `目前不可编辑`


### SSL模式
- 类型: `字符串`
- 必传: `是`
- 默认值: `prefer`
- 描述: `目前不可编辑`


## Redis 缓存配置
![img.png](images/config-redis.png)

### 启动缓存服务地址
- 类型: `字符串`
- 必传: `是`
- 默认值: `127.0.0.1:6379`

### 启动缓存服务地址
- 类型: `字符串`
- 必传: `是`
- 默认值: `1`

### 缓存用户密码
- 类型: `字符串`
- 必传: `否`
- 默认值: ``


## 企业微信配置

企业微信后台访问地址：https://work.weixin.qq.com

![img_1.png](images/config-wecom.png)

### 企业微信账号
- 类型: `字符串`
- 必传: `是`
- 默认值: ``
- 描述: `登陆到企业微信后台，我的企业->企业ID`

### 企业微信Oauth回调地址
- 类型: `字符串`
- 必传: `是`
- 默认值: `1`
- 描述: `登陆到企业微信后台，应用管理->{应用}->企业微信授权登录`

### 企微应用账号
- 类型: `字符串`
- 必传: `是`
- 默认值: ``
- 描述: `登陆到企业微信后台，应用管理->{应用}->AgentId`

### 企微应用账号密钥
- 类型: `字符串`
- 必传: `是`
- 默认值: `127.0.0.1:6379`
- 描述: `登陆到企业微信后台，应用管理->{应用}->Secret`

### 企微应用AES密钥
- 类型: `字符串`
- 必传: `是`
- 默认值: ``
- 描述: `登陆到企业微信后台，管理工具->通讯录同步->设置接收事件服务器->EncodingAESKey`

### 企微应用消息回调地址
- 类型: `字符串`
- 必传: `是`
- 默认值: ``
- 描述: `登陆到企业微信后台，管理工具->通讯录同步->设置接收事件服务器->URL`

### 企微应用消息Token
- 类型: `字符串`
- 必传: `是`
- 默认值: ``
- 描述: `登陆到企业微信后台，管理工具->通讯录同步->设置接收事件服务器->Token`


---


# 2. 直接修改config.yml
{your_project_location}/PowerX/config.yml

请确保PowerX后台服务被启动过一次，系统会从config-example.yml复制一份为config.yml

```yaml
# 应用配置
name: "PowerX"
env: local
locale: zh_CN
server:
  host: 0.0.0.0
  port: 8080

# JWT 配置
jwt:
  public_key_file: |
    xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
    xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
    xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
    xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
  private_key_file: |
    xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
    xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
    xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
    xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# 系统运行状态配置
system:
  maintenance: false
  installed: false

log:
  log_path: /var/log/ArtisanCloud/PowerX-dev

# 数据库配置
database:
  # 我们开发团队现阶段是以Postgres为数据库
  default: "postgres"
  debug: false

  connections:
    # postgres 配置
    pgsql:
      driver: pgsql
      url:

      # localhost
      host: localhost
      port: 5432
      database: powerx
      username: user
      password:
      charset: utf8
      prefix: ac_
      prefix_indexes:
      schemas:
        default: public
        option: public
      search_path: "public"
      ssl_mode: prefer
    # mysql 配置
    mysql:
      driver: mysql
      url:
      host:
      port:
      database:
      username:
      password:
      unix_socket:
      charset:
      collation:
      prefix:
      prefix_indexes:
      strict:
      engine:
      options:

# 缓存配置
cache:
  default: "redis"
  connections:
    # Redis 配置，作者推荐使用redis，我们开发团队现以redis为基础进行开发
    redis:
      max_idle:
      maxActive:
      protocol:
      host: "127.0.0.1:6379"
      password:
      db: 1
      expiration:
      timeout_connect:
      timeout_read:
      timeout_write:
      timeout_idle:

    memory:
      max_idle:
      max_active:
      protocol:
      host:
      password:
      expiration:
      timeout_connect:
      timeout_read:
      timeout_write:
      timeout_idle:

# 微信配置
wx:
  # 授权回调配置
  auth_callback_host: "http://powerx-dev.artisancloud.cn"

  # 商户号支付配置
  mch_id: "1620xxxxx"
  mch_api_v3_key: "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
  wx_cert_path: |
    xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
    xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
    xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
    xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
  wx_key_path: |
    xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
    xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
    xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
    xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
  wx_pay_notify_url: "https://powerx.artisancloud.cn/wechat/notify"
  notify_url: "https://www.weixin.qq.com/wxpay/pay.php"

#企业微信配置
weCom:
  # 企业微信基础配置
  corp_id: "ww45xxxxxxxxxxxxxxx"
  weCom_agent_id: 10000001
  weCom_secret: "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"

  app_message_aes_key: "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
  app_message_callback_url: "https://powerx.artisancloud.cn/wechat/api/weCom/app"
  app_message_token: "xxxxxxxxxxxxxxxxxxxxxxxxx"
  app_oauth_callback_url: "http://power.artisancloud.cn"

  # 企业微信客户联系人配置
  customer_message_aes_key: "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
  customer_message_callback_url: "https://powerx.artisancloud.cn/wechat/api/weCom/customer"
  customer_message_token: "xxxxxxxxxxxxxxx"

  # 企业微信内部联系人配置
  employee_message_aes_key: "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
  employee_message_callback_url: "https://powerx.artisancloud.cn/wechat/api/weCom/employee"
  employee_message_token: "xxxxxxxxxxxxxxx"

```

