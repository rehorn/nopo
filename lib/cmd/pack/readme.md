### 将文件或文件夹打包为一个zip包

### 命令参数说明
```js
basePath: 基础路径
```

### 任务demo
```js
// 将nopo_node目录下文件打包为一个zip包
module.exports = {
    "task6": {
        "cmd": "pack",
        "source": ["nopo_node/"],
        "target": "../../publish.zip",
        "@pack": {
            "basePath": "nopo_node"
        }
    }
}
```

### 任务效果