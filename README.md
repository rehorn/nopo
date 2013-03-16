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

## config 文件夹说明
支持 glob 配置，如果为文件夹必须以 ‘/’ 结尾
source 选择器示例
./ -> 获取当前目录下所有文件和文件夹（默认加上**，即包含所有子文件夹）
./* -> 获取当前目录下所有文件和文件夹（不包含子目录）
./*.js -> 获取当前目录下所有js文件（不包含子目录）
./***.js -> 等价于 ./*.js
./*/*.js -> 获取一级子目录下js文件，如：‘./test/test.js’
./*/*/*.js -> 获取二级子目录下js文件，如：‘./test/test/test.js’
./**/*/*.js -> 获取子目录级别大于1的目录下js文件，如：‘./test/test.js’, ‘./test/test/test.js’
./*/**/*.js -> 等价于./**/*/*.js
./**/*.js -> 获取当前目录下及子文件夹下所有js文件
./**/*.{js,txt} -> 获取 js/txt 
./abc?.js -> ?指代1个任意字符 如：‘./abc1.js’,
./abc*.js -> *0个以上任意字符 如：‘./abc.js’, ‘./abc1.js’, ‘./abc01.js’
#./aab.js -> 注释用的
!./aab.js -> 非

## 关于自动合图约定规范
背景图定位position
尽量避免left/top/center/right/bottom等定位方式的使用（如果使用了，在smart合图引擎下，会使用对角线diagnose算法合并）
不能使用百分比，如42%
推荐使用标准px单位

背景图repeat
repeat不能和position一起使用，使用repeat的图片直接跳过，不参与合图
css中repeat为缺省值，但在实际应用中，大多数情况下，不写 repeat 是因为背景图大小和所在容器的大小一致，开发者省略了
因而在nopo自动合图中，如果css不写repeat，认为是no-repeat
需要横向纵向平铺的样式，必须加上repeat-x，repeat-y

关于background写法
推荐使用backgound-image,background-position这样分开的属性写法，替换css的时候可以通过optiCss参数选择是否合成background
background合并的写法处理

关于多背景

