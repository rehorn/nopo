# NoPo - Web项目自动化构建和编译工具
NoPo (No-Person-Operation) 是一个基于 NodeJS 平台的任务型 Web 项目自动化构建和编译工具，能够通过简单的 json 配置文件，实现项目自动打包，资源压缩、合并、变量替换（时间戳修改等）、自动sprite合图等前端项目常见的繁琐工作，减轻前端工程师工作压力，提供幸福感 ^_^。

## NoPo 特色
1. 配置简单，使用前端工程师熟悉的 JSON 进行配置
2. 更多的内置任务，基本涵盖大部分常见的前端构建工作
3. 基于 NodeJS，跨平台
4. NoPo 中一个最小操作单位是命令（cmd），一个任务（task）可以包含多个命令
5. 支持并行、串行命令和任务定义，更加高效
6. 引入命令管道概念，在串行命令中，上一个命令的输入将作为下一个命令输出 (thanks to [azrael](https://github.com/iazrael/))

## NoPo 安装与运行
1. 下载并安装 [Node.js环境](http://nodejs.org)
2. 按下面安装方法安装 nopo
3. 参照 [test/nopo-test/nopo.js](https://github.com/rehorn/nopo/blob/master/test/nopo-test/nopo.js) 写一个配置脚本，放到需要编译项目根目录
4. 进入项目根目录
5. 执行 nopo 

## 安装方式1：使用 git
### windows
```shell
git clone https://github.com/rehorn/nopo
```
### linux
```shell
git clone https://github.com/rehorn/nopo
cd nopo
chmod +x ./node_modules/uglify-js/bin/uglifyjs
chmod +x ./node_modules/cleancss/bin/cleancss
chmod +x ./lib/cmd/optimage/bin/gifsicle
chmod +x ./lib/cmd/optimage/bin/jpegtran
chmod +x ./lib/cmd/optimage/bin/optipng
```

## 安装方式2：使用 npm
```shell
npm install -g nopo
sudo npm install -g node-gyp
```

## NoPo 内置命令
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

### 如何在 nopo.js 定义一个 NoPo 任务（Task）
```js
module.exports = {
    "tasks": {
        "task1": {
            // optional 定义该任务中执行的命令，默认为copy
            "cmd": "copy",
            // required 任务作用域
            "source": ["css/"],
            // optional 任务输入目录，默认为当前
            "target": "./",
            // optional 任务分组，默认为all
            "mode": "dev",
            // optional 命令参数，会将@copy参数传给copy命令
            "@copy":{
                
            }
        }
    }   
}
```
### NoPo 中并行与串行
nopo 默认支持命令和任务的并行和串行，使用“,”代表并行，使用“|”代表串行

### 如何在 nopo.js 定义一个包含并行串行命令的 NoPo 任务（Task）
```js
module.exports = {
    "tasks": {
        "task1": {
            // optional 定义该任务中执行的命令，默认为copy
            "cmd": "copy|css,optimage",
            // required 任务作用域
            "source": ["src/"],
            // optional 任务输入目录，默认为当前
            "target": "./",
            // optional 命令参数，会将@copy参数传给copy命令
            "@copy":{
                
            },
            // optional 命令参数，会将@css参数传给css命令
            "@css":{
                stamp: 1
            },
            // optional 命令参数，会将@optimage参数传给optimage命令
            "@optimage":{
                
            }
        }
    }   
}
```

### 运行 examples
cd path-to-nopo/test/nopo-test
nopo

## 说明
NoPo 前身是本人之前为项目写的一个 [python 项目编译脚本](https://github.com/rehorn/webcompiler.git)
在 [WebQQ](http://web.qq.com)、[Q+](http://www.qplus.com)、[QQ互联](http://connect.qq.com)、[Alloy团队](http://alloyteam.github.com)等项目中都有应用
NoPo 是在参考了大量开源项目（如grunt，jake，ant）后，结合工作需要和实践，整理出一套前端工具。
将在后续不断完善，欢迎讨论提意见