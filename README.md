# NoPo - Web项目自动化构建和编译工具
---
NoPo (No-Person-Operation) 是一个基于 NodeJS 平台的任务型 Web 项目自动化构建和编译工具，能够通过简单的 json 配置文件，实现项目自动打包，资源压缩、合并、变量替换（时间戳修改等）、自动sprite合图等前端项目常见的繁琐工作，减轻前端工程师工作压力，提供幸福感 ^_^。

## NoPo 安装
* git clone
* npm install nopo (todo)

## NoPo 特色
* 配置简单，使用前端工程师熟悉的 JSON 进行配置
* 更多的内置任务，基本涵盖大部分常见的前端构建工作
* 基于 NodeJS，部分高级任务基于 Python，跨平台
* NoPo 中一个最小操作单位是命令（cmd），一个任务（task）可以包含多个命令
* 支持并行、串行命令和任务定义，更加高效
* 引入命令管道概念，在串行命令中，上一个命令的输入将作为下一个命令输出

## NoPo 内置任务
* appcache： 自动生成 html5 app cache 离线缓存列表
* clean：删除文件或文件夹
* coffee：编译coffeescript
* concat：合并多个js
* copy：复制文件或文件夹
* examples：命令插件demo
* filesync：本地/远程文件或文件夹同步
* jsdocs：自动生成jsdocs
* less：编译less
* lint：js/css 代码质量检查
* minify：js/css/html 代码压缩
* optimage：图片资源压缩
* pack：文件/文件夹打包zip
* qzmin：解析 fiddler willow qzmin 文件，文件自定义合并
* replace：文件内容变量替换
* sprite：自动合图
* ver：文件自动版本化，如增加时间戳，md5后缀
* watch：实时监控文件变化，实时构建
* ...

## 说明
* NoPo 前身是本人之前为项目写的一个 python 项目编译脚本
* git：https://github.com/rehorn/webcompiler
* 在 WebQQ、Q+、QQ互联、Alloy团队等项目中都有应用
* NoPo 是在参考了大量开源项目（如grunt，jake，ant）后，结合工作需要和实践，整理出一套前端工具。
* 将在后续不断完善，欢迎讨论提意见

## 安装
### windows
git clone https://github.com/rehorn/nopo

### linux
git clone https://github.com/rehorn/nopo
cd nopo
chmod +x ./lib/cmd/minify/node_modules/uglify-js/bin/uglifyjs
chmod +x ./lib/cmd/minify/node_modules/uglify-js/bin/cleancss
chmod +x ./lib/cmd/optimage/bin/gifsicle
chmod +x ./lib/cmd/optimage/bin/jpegtran
chmod +x ./lib/cmd/optimage/bin/optipng