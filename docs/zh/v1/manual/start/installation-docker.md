[//]: # (---)

[//]: # (title: 本地开发安装部署)

[//]: # (date: 2023-05-06)

[//]: # (---)

[//]: # ()
[//]: # (# 本地开发安装部署)

[//]: # ()
[//]: # (## 定位好项目路径)

[//]: # (请在安装好Golang环境后，进入到你到项目目录下)

[//]: # ()
[//]: # (``` bash)

[//]: # (> cd /{your_project_root_location})

[//]: # ()
[//]: # (```)

[//]: # ()
[//]: # (## 预安装数据库 Postgres)

[//]: # ()
[//]: # (当前版本先只支持 [Postgres]&#40;https://www.postgresql.org/download/&#41; 数据库)

[//]: # ()
[//]: # (版本>=14，具体安装步骤请查看官方教程)

[//]: # ()
[//]: # (``` bash)

[//]: # (# 在终端查看安装postgres版本)

[//]: # (> psql --version)

[//]: # (> psql &#40;PostgreSQL&#41; 14.6 &#40;Homebrew&#41;)

[//]: # ()
[//]: # (```)

[//]: # ()
[//]: # (## 预安装缓存 Redis)

[//]: # ()
[//]: # (* [源代码编译安装]&#40;https://redis.io/docs/getting-started/installation/install-redis-from-source&#41;)

[//]: # (* [在Linux上，安装Redis]&#40;https://redis.io/docs/getting-started/installation/install-redis-on-linux&#41;)

[//]: # (* [在macOS上，安装Redis]&#40;https://redis.io/docs/getting-started/installation/install-redis-on-mac-os&#41;)

[//]: # (* [在Windows上，安装Redis]&#40;https://redis.io/docs/getting-started/installation/install-redis-on-windows&#41;)

[//]: # ()
[//]: # (版本>=7，具体安装步骤请查看官方教程)

[//]: # ()
[//]: # (``` bash)

[//]: # (# 在Mac终端查看安装Redis版本)

[//]: # (> brew info redis)

[//]: # (==> redis: stable 7.0.5 &#40;bottled&#41;, HEAD )

[//]: # ()
[//]: # (# 在Windows终端查看安装Redis版本)

[//]: # (> redis-cli)

[//]: # (127.0.0.1:6379> info)

[//]: # (# Server)

[//]: # (redis_version:7.0.5)

[//]: # ()
[//]: # ()
[//]: # (```)

[//]: # ()
[//]: # (## 1. 使用IDE启动后台服务&#40;推荐使用Goland&#41; )

[//]: # ()
[//]: # ([PowerX]&#40;https://github.com/ArtisanCloud/PowerX&#41;是基于Golang语言开发的后台系统服务项目)

[//]: # ()
[//]: # (### 1.1 下载 [PowerX]&#40;https://github.com/ArtisanCloud/PowerX&#41;)

[//]: # ()
[//]: # (``` bash)

[//]: # (> git clone git@github.com:ArtisanCloud/PowerX.git)

[//]: # ()
[//]: # (```)

[//]: # ()
[//]: # (### 1.2.1 打开项目)

[//]: # ()
[//]: # (![img.png]&#40;images/install_ide.png&#41;)

[//]: # ()
[//]: # (### 1.2.2 打开右上角的编译工具配置)

[//]: # (![img_1.png]&#40;images/install_ide_1.png&#41;)

[//]: # ()
[//]: # (### 1.2.2 打开右上角的编译工具配置)

[//]: # (![img.png]&#40;images/install_ide_2.png&#41;)

[//]: # ()
[//]: # (* 输入powerx.go的路径：{your_project_root_location}/PowerX/cmd/server/powerx.go)

[//]: # (* 输入项目工作的路径: {your_project_root_location}/PowerX)

[//]: # (* 输入 -f etc/{powerx-local}.yaml)

[//]: # (  * 这里需要指出，你可以到项目路径的etc下，copy一个powerx.yaml，改为powerx-local.yaml，作为你本地的项目环境配置)

[//]: # (  * 如果你不设置这个配置路径，启动会自动启用etc/powerx.yaml)

[//]: # (* 可以给编译操作取名为"go build powerx.go")

[//]: # (* 点击按钮"OK")

[//]: # ()
[//]: # (### 1.2.3 启动后台服务)

[//]: # ()
[//]: # (![img.png]&#40;images/install_ide_4.png&#41;)

[//]: # (![img.png]&#40;images/install_ide_3.png&#41;)

[//]: # ()
[//]: # (### 1.2.4 打开浏览器，输入访问地址 http://127.0.0.1:8000)

[//]: # ()
[//]: # (![img.png]&#40;images/install_web.png&#41;)

[//]: # ()
[//]: # (### 1.3 编译源代码)

[//]: # ()
[//]: # (``` bash)

[//]: # (# 进入clone下来的项目文件夹)

[//]: # (> cd PowerX)

[//]: # (> pwd)

[//]: # (/{your_project_location}/PowerX)

[//]: # ()
[//]: # (```)

[//]: # ()
[//]: # (编译项目，确保在根目录上有PowerX可执行文件)

[//]: # ()
[//]: # (```bash)

[//]: # (# Linux环境编译)

[//]: # (> CGO_ENABLED=0  GOOS=linux  GOARCH=amd64 go build -o PowerX)

[//]: # (```)

[//]: # ()
[//]: # (```bash)

[//]: # (# Windows环境编译)

[//]: # (> CGO_ENABLED=0  GOOS=windows  GOARCH=amd64 go build -o PowerX.exe)

[//]: # (```)

[//]: # ()
[//]: # (```bash)

[//]: # (# Linux环境编译)

[//]: # (> CGO_ENABLED=0  GOOS=darwin  GOARCH=arm64 go build -o PowerX)

[//]: # (```)

[//]: # ()
[//]: # (```bash)

[//]: # ()
[//]: # (> ls PowerX)

[//]: # (PowerX)

[//]: # (# linux/mac检查powerx工具包的版本)

[//]: # (> ./PowerX version)

[//]: # (b2c)

[//]: # (# windows检查powerx工具包的版本)

[//]: # (> .\PowerX.exe version)

[//]: # (b2c)

[//]: # (```)

[//]: # ()
[//]: # (### 1.3 启动后台服务)

[//]: # ()
[//]: # (``` bash)

[//]: # (# Linux/mac启动PowerX服务)

[//]: # (> ./PowerX serve)

[//]: # ("0.0.0.0:8080")

[//]: # ()
[//]: # (# windows启动PowerX服务)

[//]: # (> .\PowerX.exe serve)

[//]: # ("0.0.0.0:8080")

[//]: # (```)

[//]: # ()
[//]: # (第一次启动服务后，在项目根目录下，会自动生成一个config.yml文件。)

[//]: # ()
[//]: # (系统会启动gin服务，默认端口 "0.0.0.0:8080")

[//]: # ()
[//]: # (## 2. 安装启动，前端项目 [PowerXDashboard]&#40;https://github.com/ArtisanCloud/PowerXDashboard&#41;)

[//]: # (PowerXDashboard是基于ReactJS架构的前端页面系统。)

[//]: # ()
[//]: # (### 2.0 预安装环境)

[//]: # ()
[//]: # ()
[//]: # (版本管理使用[yarn]&#40;https://yarnpkg.com/getting-started/install&#41;)

[//]: # ()
[//]: # (```bash)

[//]: # (> yarn --verion)

[//]: # (yarn version b2c.22.19)

[//]: # ()
[//]: # (```)

[//]: # ()
[//]: # (PowerX的前端项目是基于[Ant Design Pro]&#40;https://procomponents.ant.design&#41;进行开发。)

[//]: # ()
[//]: # ()
[//]: # (PowerXDashboard使用Ant Design Pro官方推荐的脚手架[UmiJS]&#40;https://umijs.org/docs/tutorials/getting-started&#41;进行搭建。)

[//]: # (&#40;current version>=4.0&#41;)

[//]: # ()
[//]: # ()
[//]: # ()
[//]: # (### 2.1 下载 [PowerXDashboard]&#40;https://github.com/ArtisanCloud/PowerXDashboard&#41;)

[//]: # ()
[//]: # (``` bash)

[//]: # (> git clone git@github.com:ArtisanCloud/PowerXDashboard.git)

[//]: # ()
[//]: # (```)

[//]: # ()
[//]: # (### 2.2 编译源代码)

[//]: # ()
[//]: # (安装依赖库)

[//]: # (``` bash)

[//]: # (# 进入clone下来的项目文件夹)

[//]: # (> cd PowerXDashboard)

[//]: # (> pwd)

[//]: # (/{your_project_location}/PowerXDashboard)

[//]: # ()
[//]: # (# 安装依赖库)

[//]: # (> yarn -i)

[//]: # ()
[//]: # (```)

[//]: # ()
[//]: # ()
[//]: # (配置环境变量)

[//]: # ()
[//]: # (根据.umirc.ts文件中的环境变量设置，需要在本地先添加一个.env文件)

[//]: # ()
[//]: # (```yaml)

[//]: # (REACT_APP_BASE_URL=http://localhost:8080)

[//]: # (REACT_APP_WX_OAUTH_URL=https://open.work.weixin.qq.com/wwopen/sso/qrConnect?appid=ww454dfb9d6f6d432a&agentid=1000005&redirect_uri=https://michael-web.debug.artisancloud.cn/user/wx/authorized&state=code)

[//]: # (REACT_APP_OAUTH_URL=https://michael-web.debug.artisancloud.cn)

[//]: # (REACT_APP_OAUTH_STATE=code)

[//]: # ()
[//]: # (```)

[//]: # (REACT_APP_BASE_URL是本地请求后端的地址，和PowerX启动服务的端口呼应，默认端口：8080)

[//]: # ()
[//]: # (你也可以复制.umirc.ts成.umirc.local.ts，作为本地开发环境)

[//]: # ()
[//]: # ()
[//]: # (启动前端项目，使用开发模式，默认端口8000)

[//]: # (```bash)

[//]: # (> yarn dev)

[//]: # (yarn run b2c.22.19)

[//]: # ($ max dev)

[//]: # (info  - [你知道吗？] 如果要支持低版本浏览器，可尝试新出的 legacy 配置项，详见 https://umijs.org/docs/api/config#legacy)

[//]: # (info  - Umi v4.0.36)

[//]: # (info  - MFSU eager strategy enabled)

[//]: # (info  - [MFSU][eager] restored cache)

[//]: # (event - [MFSU][eager] start build deps)

[//]: # (info  - [MFSU] skip buildDeps)

[//]: # (        ╔════════════════════════════════════════════════════╗)

[//]: # (        ║ App listening at:                                  ║)

[//]: # (        ║  >   Local: http://localhost:8000                  ║)

[//]: # (ready - ║  > Network: http://192.168.71.68:8000              ║)

[//]: # (        ║                                                    ║)

[//]: # (        ║ Now you can open browser with the above addresses↑ ║)

[//]: # (        ╚════════════════════════════════════════════════════╝)

[//]: # (info  - [MFSU][eager] worker init, takes 904ms)

[//]: # (event - [Webpack] Compiled in 1543 ms &#40;671 modules&#41;)

[//]: # (wait  - [Webpack] Compiling...)

[//]: # (event - [MFSU][eager] start build deps)

[//]: # (info  - [MFSU] skip buildDeps)

[//]: # (event - [Webpack] Compiled in 129 ms &#40;657 modules&#41;)

[//]: # ()
[//]: # (```)

[//]: # ()
[//]: # (### 本地访问启动服务)

[//]: # ()
[//]: # (打开浏览器，输入 localhost:8000)

[//]: # ()
[//]: # (第一次打开浏览器，系统会进入安装界面)

[//]: # ()
[//]: # (![img.png]&#40;images/config-app.png&#41;)

[//]: # ()
[//]: # ()
[//]: # (能看到当前页面，恭喜你，说明前后端的代码部署已经完成。)

[//]: # ()
[//]: # (进入下一节，开始前后端[安装配置]&#40;common.html&#41;)

[//]: # ()
[//]: # ()
[//]: # (---)

[//]: # ()
[//]: # (::: tip)

[//]: # ()
[//]: # (* golang版本 :  >=1.19)

[//]: # ()
[//]: # (* golang官网 :  [国内镜像]&#40;https://golang.google.cn/dl/&#41;)

[//]: # ()
[//]: # (* goproxy镜像:  [goproxy.cn]&#40;https://goproxy.cn/&#41;)

[//]: # ()
[//]: # (* postgres:  [官方网址 版本>=14]&#40;https://www.postgresqltutorial.com&#41;)

[//]: # ()
[//]: # (* redis:  [redis]&#40;https://github.com/ArtisanCloud/PowerLibs/blob/master/cache/redis.go&#41;)

[//]: # ()
[//]: # (:::)
