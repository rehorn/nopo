### 部署文件到服务器
通过 ftp 等途径将文件部署到服务器

### 命令参数说明
```js
// ftp 或 rsync
type: ftp

```

### 任务demo
```js
// 将当前文件夹下所有文件同步到远程 /htdocs/ 下
module.exports = {
    "nopoParser": "nopo-node",
    "tasks": {
        "deploy":{
            "cmd": "deploy",
            "source": "**",
            "target": "/htdocs/",
            "@deploy": {
                "host": "***",
                "port": "21",
                "user": "***",
                "password": "***"
            }
        }
    }
}
```

### 任务效果
将当前文件夹下所有文件同步到远程 /htdocs/ 下