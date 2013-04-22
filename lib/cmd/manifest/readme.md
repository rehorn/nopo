### 扫描代码生成 html5 app缓存列表
```js
# appcache manifest generate
```

### 命令参数说明
```js
'linkPrefix': '',
'manifestSuffix': 'manifest',
'network': [
    '*'
],
'fallback': []
```

### 任务demo
```js
module.exports = {
    "tasks": {
        "manifest":{
            "cmd": "manifest",
            "source": "*.html",
            "@manifest": {
                "linkPrefix": "http://cdn.qplus.com/qplus/",//optional
                "manifestSuffix": "manifest", // optional
                "network": [ "*" ],//optional
                "fallback": [ // optional
                    "/ fallback.html"
                ]
            }
        }
    }
}
```

### 任务效果