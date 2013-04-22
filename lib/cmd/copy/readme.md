## 复制文件或文件夹到其他目录 copy folders / files into another

### 命令参数说明
```shell
quiet: 是否显示日志,
basePath: 复制目标路径基础路径（复制的时候将会移除）,
inclueDir: 是否包含文件夹,
includeEmpty: 是否包含空文件夹,
flatten: 是否保留目录结构
```

### 任务demo
```js
module.exports = {
    "tasks": {
        // 将 js 目录下所有 js 文件复制到js2
        "task1": {
            "cmd": "copy",
            "source": "js/*.js",
            "target": "js2/",
            "@copy": {
                "basePath": "js/"
            }
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
nopo-build/js2/a.js
nopo-build/js2/b.js
nopo-build/js2/c/d.js
```
