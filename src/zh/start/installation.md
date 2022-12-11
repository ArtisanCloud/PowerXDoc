---
title: 安装
date: 2022-12-08
---

# 安装

请在安装好golang环境后，进入到你到项目目录下

``` bash
> cd {your_project_location}
> 

```


## 预安装数据库 Postgres
当前版本先只支持 [Postgres](https://www.postgresql.org/download/) 数据库

版本>=14


## 预安装缓存 Redis
* [源代码编译安装](https://redis.io/docs/getting-started/installation/install-redis-from-source)
* [在Linux上，安装Redis](https://redis.io/docs/getting-started/installation/install-redis-on-linux)
* [在macOS上，安装Redis](https://redis.io/docs/getting-started/installation/install-redis-on-mac-os)
* [在Windows上，安装Redis](https://redis.io/docs/getting-started/installation/install-redis-on-windows)

版本>=6


## 安装 PowerX



如果有遇到问题，欢迎点击右上角联系我们。

### 下载 [PowerX](https://github.com/ArtisanCloud/PowerX)

``` bash
> git clone git@github.com:ArtisanCloud/PowerX.git
```

### 编译源代码

``` bash
# 进入clone下来的项目文件夹
> cd PowerX

# 编译项目，确保在根目录上有powerx可执行文件
> go build 

# 检查powerx工具包的版本
> ./PowerX version

# 启动PowerX服务
# 系统会启动gin服务，默认端口 "0.0.0.0:8080"
> ./PowerX serve


```

### 本地访问启动服务
打开浏览器，输入 [http://localhost:8000](http://localhost:8000)

第一次打开浏览器，系统会进入安装界面






::: tip

* golang版本 :  >=1.16
* golang官网 :  [国内镜像](https://golang.google.cn/dl/)
* goproxy镜像:  [goproxy.cn](https://goproxy.cn/)
* postgres:  [官方网址 版本>=14](https://www.postgresqltutorial.com)
* redis:  [redis](https://github.com/ArtisanCloud/PowerLibs/blob/master/cache/redis.go)


:::
