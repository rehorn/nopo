### 使用 exec 执行一个命令

### 命令参数说明
```js
// 命令
'command': '',
// 输出log
'quiet': 1,
// buffer大小
'buffer': 1024 * 100000
```
### 任务demo
```js
// 获取 svn 信息
module.exports = {
    "tasks": {
        "deploy":{
            "cmd": "exec",
            "@exec": {
                "command": "svn info"
            }
        }
    }
}
```
### 任务效果
获取 svn 信息
