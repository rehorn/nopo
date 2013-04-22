### 替换文件内容
qzmin 类似 concat，对文件进行合并，配合 fiddler/willow 使用的一种合并声明方式

### 命令参数说明
```js
// 参数列表
meta: {},
// 参数前缀
prefix: '@@'
```

### 任务demo
```js
// 替换 minifest 中时间戳
module.exports = {
    "task7": {
        "cmd": "replace",
        "source": "./cache.manifest",
        "target": "./app.manifest",
        "@replace": {
            'meta': {
                'timestamp': '<%= nopo.template.today() %>'
            }
        }
    }
}
```

### 任务效果
```shell
# @@timestamp

=>

# 20130420
```
