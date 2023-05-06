---
title: 本地开发安装部署
date: 2023-05-06
---

# 开发安装部署准备

## 定位好项目路径
请在安装好Golang环境后，进入到你到项目目录下

``` bash
> cd /{your_project_root_location}

```

## 下载项目文件
[PowerX](https://github.com/ArtisanCloud/PowerX)是基于Golang语言开发的后台系统服务项目

### 1.1 下载 [PowerX](https://github.com/ArtisanCloud/PowerX)

``` bash
> git clone git@github.com:ArtisanCloud/PowerX.git

# 使用git切换你需要的版本分之，默认可以在release/xxx或者develop上
git status

```

### 2.1 下载 [PowerXDashboard](https://github.com/ArtisanCloud/PowerXDashboard)

``` bash
> git clone git@github.com:ArtisanCloud/PowerXDashboard.git

# 使用git切换你需要的版本分之，默认可以在release/xxx或者develop上
git status

```

---

## 选择你要的启动方式：
### [本地IDE启动](installation-ide.md)

[//]: # (### [本地命令行启动]&#40;installation-command.md&#41;)

[//]: # ()
[//]: # (###  [docker部署启动]&#40;installation-docker.md&#41;)

###  [docker-compose部署启动](installation-docker-compose.md)



## 预安装数据库 Postgres

当前版本先只支持 [Postgres](https://www.postgresql.org/download/) 数据库

版本>=14，具体安装步骤请查看官方教程

``` bash
# 在终端查看安装postgres版本
> psql --version
> psql (PostgreSQL) 14.6 (Homebrew)

```

## 预安装缓存 Redis

* [源代码编译安装](https://redis.io/docs/getting-started/installation/install-redis-from-source)
* [在Linux上，安装Redis](https://redis.io/docs/getting-started/installation/install-redis-on-linux)
* [在macOS上，安装Redis](https://redis.io/docs/getting-started/installation/install-redis-on-mac-os)
* [在Windows上，安装Redis](https://redis.io/docs/getting-started/installation/install-redis-on-windows)

版本>=7，具体安装步骤请查看官方教程

``` bash
# 在Mac终端查看安装Redis版本
> brew info redis
==> redis: stable 7.0.5 (bottled), HEAD 

# 在Windows终端查看安装Redis版本
> redis-cli
127.0.0.1:6379> info
# Server
redis_version:7.0.5


```

## 预安装缓存 Minio(OSS)
* [服务安装](https://github.com/minio/minio)


---

> tip:
> * golang版本 :  >=1.19
> * golang官网 :  [国内镜像](https://golang.google.cn/dl/)
> * goproxy镜像:  [goproxy.cn](https://goproxy.cn/)
> * postgres:  [官方网址 版本>=14](https://www.postgresqltutorial.com)
> * redis:  [redis](https://github.com/ArtisanCloud/PowerLibs/blob/master/cache/redis.go)
> * minio: [minio](https://github.com/minio/minio) 


