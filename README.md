# NoPo - Web项目自动化构建和编译工具
NoPo (No-Person-Operation) 是一个基于 NodeJS 平台的任务型 Web 项目自动化构建和编译工具，能够通过简单的 json 配置文件，实现项目自动打包，资源压缩、合并、变量替换（时间戳修改等）、自动sprite合图等前端项目常见的繁琐工作，减轻前端工程师工作压力，提供幸福感 ^_^。

## NoPo 安装
1. 下载并安装 [Node.js环境](http://nodejs.org)
2. git clone https://github.com/rehorn/nopo.git
3. nmp install nopo (todo)
4. 参照 test/nopo-test/nopo.js 写一个配置脚本
5. nopo 

## NoPo 特色
1. 配置简单，使用前端工程师熟悉的 JSON 进行配置
2. 更多的内置任务，基本涵盖大部分常见的前端构建工作
3. 基于 NodeJS，部分高级任务基于 Python，跨平台
4. NoPo 中一个最小操作单位是命令（cmd），一个任务（task）可以包含多个命令
5. 支持并行、串行命令和任务定义，更加高效
6. 引入命令管道概念，在串行命令中，上一个命令的输入将作为下一个命令输出

## NoPo 内置任务
* build: 常用 web 项目编译任务
* clean：删除文件或文件夹
* concat：合并多个文件为一个
* copy：复制文件或文件夹
* css：css优化命令，如：为图片自动增加时间戳/md5等，添加随机cdn host前缀等
* deploy：将本地文件通过 ftp/rsync 等方式发布到远程机器
* examples：命令插件demo
* exec：子进程执行系统命令简单封装
* htmlrefs：编译 html，实现引用 js/css 资源合并
* jsdoc：使用 jsdoc-toolkit/yuidoc 生成 jsdoc 文档
* lint：js/css 代码质量检查
* manifest：自动生成 html5 app cache manifest
* minify：js/css/html 代码压缩
* optimage：图片资源压缩
* pack：文件/文件夹打包 zip
* qzmin：解析 fiddler willow qzmin 文件，文件自定义合并
* replace：文件内容变量替换
* require：支持 requirejs 打包
* sprite：自动合图引擎 tango
* translate：支持 less/sass/coffee 实时编译成 js/css
* utest：单元测试
* ...

## NoPo 内建行为
* file-check：文件类型、大小监控
* live-build：监控文件系统变动，自动执行制定编译命令

## 说明
    NoPo 前身是本人之前为项目写的一个 [python 项目编译脚本](https://github.com/rehorn/webcompiler.git)
    在 WebQQ、Q+、QQ互联、Alloy团队等项目中都有应用
    NoPo 是在参考了大量开源项目（如grunt，jake，ant）后，结合工作需要和实践，整理出一套前端工具。
    将在后续不断完善，欢迎讨论提意见

## 安装
### windows
```shell
git clone https://github.com/rehorn/nopo
```
### linux
```shell
git clone https://github.com/rehorn/nopo
cd nopo
chmod +x ./lib/cmd/minify/node_modules/uglify-js/bin/uglifyjs
chmod +x ./lib/cmd/minify/node_modules/uglify-js/bin/cleancss
chmod +x ./lib/cmd/optimage/bin/gifsicle
chmod +x ./lib/cmd/optimage/bin/jpegtran
chmod +x ./lib/cmd/optimage/bin/optipng
```

## config 文件夹说明
支持 glob 配置，如果为文件夹必须以 ‘/’ 结尾
source 选择器示例
```shell
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
./abc**.js -> *0个以上任意字符 如：‘./abc.js’, ‘./abc1.js’, ‘./abc01.js’
#./aab.js -> 注释用的
!./aab.js -> 非
/ -> 当前盘根目录，如 E:\\
/Server -> E:\\Server\\ 在win平台下推荐使用相对路径写法
```
## 关于自动合图约定规范
图片容器大小
* 为了减低合图算法复杂度，背景图宽高必须和所在容器的宽高一致
* 如果切图比容器小，建议增加html增加一个大小一致容器，或者通过photoshop工具手动调整切图边框空白

padding对图片容器宽高的影响
* 切图容器不建议设置padding，在box-sizing:content-box默认设置下，padding会影响容器实际宽高

背景图定位position
* 尽量避免left/top/center/right/bottom/百分比（50% 100%、）等定位方式的使用（如果使用了，在smart合图引擎下，会使用对角线diagnose算法合并）
* 推荐使用标准px单位，如：background-position: -20 -20;

背景图repeat
* repeat不能和position一起使用，使用repeat的图片直接跳过，不参与合图
* css中repeat为缺省值，但在实际应用中，大多数情况下，不写 repeat 是因为背景图大小和所在容器的大小一致，开发者省略了
* 因而在nopo自动合图中，如果css不写repeat，认为是no-repeat
* 需要横向纵向平铺的样式，必须加上repeat-x，repeat-y

关于background写法
* 支持background合成写法
* 推荐使用backgound-image,background-position这样分开的属性写法，替换css的时候可以通过mergeBackground参数选择是否合成background
合并的写法处理

暂跳过含有css3相关 background 新特性的class样式
* 需要 sprite 的容器避免使用
    background-size
    background-clip
    background-origin

支持background多背景写法，但不推荐使用

@import, @keyframes, @charset, @media, @font-face, @page中规则的处理
* 只处理@media和部分@keyframes

自动合图引擎tango规则约定
* 流程：扫描图片 -> 按切图类别合图 -> 扫描css background -> 根据合图信息替换url，增加定位信息
* 配置项：
* imgRoot -> 需要合并的切图根目录, layout -> 合图算法

合图命名规则：
```shell
imgRoot下一级子目录按目录单独合并成一个sprite图，默认packing算法，默认将png,gif,jpeg,jpg进行合图
slice1/ -> sprite-slice1.png 默认采用packing合图算法
slice2/ -> sprite-slice2.png
slice-n/ -> 无需进行合并的切换，如大背景图jpg，动态gif，用于repeat的背景纹理等，只做copy操作
slice-1px-x/ -> sprite-slice-x.png -x结尾的文件夹(一般放置width一致需要repeat-x的切图)采用top-down-height合图算法
slice-5px-x/ -> 宽度为5px的repeat-x切图
slice-5px-y/ -> sprite-slice-y.png -y结尾的文件夹(一般放置height一致需要repeat-y的切图)采用left-right-width合图算法
```

css替换规则
* 扫描css的background和background-image属性，替换url路径，并添加background-position定位属性
* backgound:url(slice/test.png); -> backgound:url(sprite-slice.png);background-position:-20px -20px;
* backgound-image:url(slice/test.png);background-position:20 20;(已经sprite过的切图)
-> backgound-image:url(sprite-slice.png);background-position:-20px -20px; (重新计算定位)
* background简写优化（optiCss:1）
* background-image, background-position等合并为简写background形式

以下background属性写法的样式将不进行替换
```shell
含有background-size
含有background-clip
含有background-origin
background-image的url为绝对路径或者http/ftp协议
background-position为left/top/center/50%/100%的组合
background-repeat为显示注明repeat
```

### 已经sprite过的图片可以重复sprite
* 合图引擎会重新计算定位数字

### ie6透明解决方案（ie6已经低于20%，尽量简单处理）
* 1、使用DD_belatedPNG脚本(采用VML，性能优于滤镜，支持sprite，背景平铺，兼容性较好)
* 2、通过添加fixIe6:1参数，自定生成一张sprite-png8.png合图，自动增加_background-image: url() 属性

## 合图替换方案 -> datauri + mhtml(ie6/7/8)
```shell
datauri
优点：将图片base64打包到css中，可以减少请求
缺点：
ie6/7/8不支持，但有替代方案；
base64比图片大一倍，经过gzip后其实更小
直接对图片进行gzip，某些浏览器可能出现cpu占用高
```