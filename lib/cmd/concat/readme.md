## 合并文件 combine files into one

### 命令参数说明
无配置参数

### 任务demo
```js
module.exports = {
    "tasks": {
        // 将 js 目录下所有 js 文件合并成 nopo_concat.js
        "task1": {
            "cmd": "concat",
            "source": "js/**.js",
            "target": "js/nopo_concat.js"
        }
    }
}
```
### 任务效果
```shell
获取js目录下所有js文件
js/a.js
js/b.js
js/c/d.js
...

生成文件
nopo-build/js/nopo_concat.js
```