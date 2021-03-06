### 自动合图引擎 Tango
查看 [demo](https://github.com/rehorn/nopo/blob/master/test/nopo-test3/nopo.js)

### 命令参数说明
```js
spriter: 'tango', // tango, smart
engine: 'auto', // auto, gm, canvas
prefix: 'sprite-',
hash: 1,
optiImg: 1,
layout: 'packing', // packing, top-down, top-down-width, left-right,left-right-height, diagonal \, alt-diagonal /
imgRoot: './',
output: './',
fixIe6: 0,
mergeBackground: 1
```

### 任务demo

### 任务效果


-----------
### 关于自动合图约定规范
图片容器大小
```
为了减低合图算法复杂度，背景图宽高必须和所在容器的宽高一致
如果切图比容器小，建议增加html增加一个大小一致容器，或者通过photoshop工具手动调整切图边框空白
```

padding对图片容器宽高的影响
```
切图容器不建议设置padding，在box-sizing:content-box默认设置下，padding会影响容器实际宽高
```

背景图定位position
```
尽量避免left/top/center/right/bottom/百分比 (50% 100%) 等定位方式的使用
(如果使用了，在smart合图引擎下，会使用对角线diagnose算法合并)
推荐使用标准px单位，如：background-position: -20 -20;
```

背景图repeat
```
repeat不能和position一起使用，使用repeat的图片直接跳过，不参与合图
css中repeat为缺省值，但在实际应用中，大多数情况下，不写 repeat 是因为背景图大小和所在容器的大小一致，开发者省略了
因而在nopo自动合图中，如果css不写repeat，认为是no-repeat
需要横向纵向平铺的样式，必须加上repeat-x，repeat-y
```

关于background写法
```
支持background合成写法
推荐使用backgound-image,background-position这样分开的属性写法，替换css的时候可以通过mergeBackground参数选择是否合成background
合并的写法处理

暂跳过含有css3相关 background 新特性的class样式
需要 sprite 的容器避免使用
background-size
background-clip
background-origin
```

支持background多背景写法，但不推荐使用

@import, @keyframes, @charset, @media, @font-face, @page中规则的处理
只处理@media和部分@keyframes

自动合图引擎tango规则约定
```
流程：扫描图片 -> 按切图类别合图 -> 扫描css background -> 根据合图信息替换url，增加定位信息
配置项：
imgRoot -> 需要合并的切图根目录, layout -> 合图算法

合图命名规则：
imgRoot下一级子目录按目录单独合并成一个sprite图，默认packing算法，默认将png,gif,jpeg,jpg进行合图
slice1/ -> sprite-slice1.png 默认采用packing合图算法
slice2/ -> sprite-slice2.png
slice-n/ -> 无需进行合并的切换，如大背景图jpg，动态gif，用于repeat的背景纹理等，只做copy操作
slice-1px-x/ -> sprite-slice-x.png -x结尾的文件夹(一般放置width一致需要repeat-x的切图)采用top-down-height合图算法
slice-5px-x/ -> 宽度为5px的repeat-x切图
slice-5px-y/ -> sprite-slice-y.png -y结尾的文件夹(一般放置height一致需要repeat-y的切图)采用left-right-width合图算法
```

css替换规则
```
扫描css的background和background-image属性，替换url路径，并添加background-position定位属性
backgound:url(slice/test.png); -> backgound:url(sprite-slice.png);background-position:-20px -20px;
backgound-image:url(slice/test.png);background-position:20 20;(已经sprite过的切图)
-> backgound-image:url(sprite-slice.png);background-position:-20px -20px; (重新计算定位)
background简写优化（optiCss:1）
background-image, background-position等合并为简写background形式
```

以下background属性写法的样式将不进行替换
```
含有background-size
含有background-clip
含有background-origin
background-image的url为绝对路径或者http/ftp协议
background-position为left/top/center/50%/100%的组合
background-repeat为显示注明repeat
```

### 已经sprite过的图片可以重复sprite
```
合图引擎会重新计算定位数字
```

### ie6透明解决方案（ie6已经低于20%，尽量简单处理）
```
1、使用DD_belatedPNG脚本(采用VML，性能优于滤镜，支持sprite，背景平铺，兼容性较好)
2、通过添加fixIe6:1参数，自定生成一张sprite-png8.png合图，自动增加_background-image: url() 属性
```

### 合图替换方案 -> datauri + mhtml(ie6/7/8)
```
datauri
优点：将图片base64打包到css中，可以减少请求
缺点：
ie6/7/8不支持，但有替代方案；
base64比图片大一倍，经过gzip后其实更小
直接对图片进行gzip，某些浏览器可能出现cpu占用高
```

### THANKS TO 
https://github.com/twolfson/layout/
https://github.com/Ensighten/spritesmith
https://github.com/iAdramelk/grunt-oversprite

