### html 链接引用处理命令
主要功能
1. 合并多个 css link 为一个
2. 将 css 内嵌直接内嵌到网页（某些对性能要求较高的页面）
3. 合并多个 js script 为一个
4. 移除某些开发才需要的 js，如less.js
5. 插入某些发布才需要的 js，如google-analyst
6. 重构页面模版到独立 js 中
7. 按 requirejs 配置合并 js

### 命令参数说明
```js

build:css, dest:cdn/css/main.css, stamp:md5, rev:1, assetHosts:1, basePath:cdn/

build:css, inline:1

build:tmpl, res:tmpl2js

build:js, dest:js/main.js, assetHosts:1

build:remove

build:include, res:h5Timing

```
### 任务demo
```js
"htmlrefs": {
    "cmd": "htmlrefs",
    "source": "*.html",
    "@htmlrefs": {
        "tmpl2js": "tools/tmpl2js.js",
        "h5Timing": "tools/h5-timing.html",
        "googleAnalytics": "tools/google-analytics.html"
    }
}
```

### 任务效果
```html
<!-- build:css, dest:cdn/css/main.css, stamp:md5, rev:1, assetHosts:1, basePath:cdn/ -->
<link rel="stylesheet" href="css/style.css?v=20130101" media="all">
<!-- endbuild -->

=>
<link rel="stylesheet" href="http://0.pub.idqqimg.com/qqfind/css/style-ecadfe.css" media="all">
```
