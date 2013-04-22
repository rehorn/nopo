### 生成 js doc 文档
查看 [demo](https://github.com/rehorn/nopo/blob/master/test/nopo-test8/nopo.js)

### 命令参数说明
```js
engine:
jsdoc-toolkit
yui-doc
```
### 任务demo
```js
// 获取 svn 信息
module.exports = {
    "tasks": {
        "js-doc-gen": {
            "cmd": "jsdoc",
            "source": "js/",
            "target": "js-doc/",
            "@jsdoc": {
                "conf": "tools/jet-doc-config.conf"
            }
        }
    }
}
```
### 任务效果
