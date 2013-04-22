### 按照 qzmin 配置进行文件合并
qzmin 类似 concat，对文件进行合并，配合 fiddler/willow 使用的一种合并声明方式

### 命令参数说明
```js
无
```

### 任务demo
```js
// 解析*.qzmin 文件并进行合并
module.exports = {
    "task4": {
        "cmd": "qzmin",
        "source": ["tools/", "tools/tmp/test_qzmin3.qzmin"],
        "target": "./qzmin/"
    }
}
```

### 任务效果
