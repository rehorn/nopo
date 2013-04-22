## 删除文件或文件夹 remove files / floders

### 命令参数说明
无配置参数

### 任务demo
```js
module.exports = {
    "tasks": {
        // 删除 publish.zip 和 public 目录
        "task1": {
            "cmd": "clean",
            "source": ["../publish.zip", "public/"]
        }
    }
}
```
### 任务效果
删除上级目录文件publish.zip，删除public及所有子文件