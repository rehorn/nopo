### css 处理命令 css processing
主要功能
1. 为图片增加时间戳 images cache buster 
url(image/img.png) -> url(image/img.png?v=1244444040)
url(image/img.png) -> url(image/img-ecfecd.png)
2. 把图片转为base64
url(image/img.png) -> datauri/base64
todo: mhtml fallback for ie6/7 
https://github.com/josephj/dataurize/blob/master/dataurize
3. 为图片增加 cdn 前缀域名
url(image/img.png) -> url(http://0.pub.idqqimg.com/qqfind/image/img.png?v=1244444040)
url(image/img2.png) -> url(http://1.pub.idqqimg.com/qqfind/image/img.png?v=1244444040)
4. 为 css 增加水印(所有图片的md5)
#nopo-auto-generated-mark{content:****}

### 命令参数说明
```js
// 为图片增加修改时间戳类型 ?v= , 空,mtime,md5
stamp: '',
// 为图片增加cdn host随机前准 qplus[0,1,2...].idqqimg.com
assetHosts: null,
// 是否生成新文件版本, 用于增量发布 -> 原文件名-[md5|mtime].png
rev: 1,
// 把图片资源base64后插入，优先级高于stamp
dataUri: 0,
// ie6,7,8 support base64 
// mhtmlUri: 0,
// dataUri exclude list
exclude: [],
// 是否跳过
skipDuplicate: 1,
// 是否增加一个nopo-build规则，content为处理时间、图片md5等信息
addMark: 1 
```
### 任务demo
```js
module.exports = {
    "tasks": {
        "enhancecss":{
            "cmd": "css",
            "source": "css/",
            "@css": {
                "stamp": "md5", // mtime, md5
                "assetHosts": "http://qplus[0,1,2,3,4,5,6,7,8,9].idqqimg.com/pub/",
                "rev": 1,
                "dataUri": 1,
                "exclude": ["img/test3.png"],
                "skipDuplicate": 1
            }
        }
    }
}
```

### 任务效果
```js
url(image/test2.png);
url(image/test3.png);

background:data/image:***
url(http://qplus0.idqqimg.com/pub/image/test3-abcdef.png);
```