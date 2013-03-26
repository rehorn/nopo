// refer: https://github.com/iazrael/ioffline/blob/master/ioffline.js

var nopo = require('../../core'),
    _ = nopo.util._,
    file = nopo.file,
    logger = nopo.logger,
    util = nopo.util,
    path = require('path'),
    fs = require('fs');

var fs = require('fs'),
    path = require('path');

var pickupJs = function(url){
    var content = fs.readFileSync(url).toString();
    var reg = /<script\s+.*?src="?([^"]+)"?[^>]+>/gi;
    var jss = [];
    content.replace(reg, function(m, u1){
        jss.push(u1);
    });
    // console.log(jss);
    return jss;
}

var pickupCss = function(url, manifest, config){
    var content = fs.readFileSync(url).toString();
    var maniReg = /(<html.+manifest="?)[^"]*("?[^>]*>)/i;
    if(maniReg.test(content)){
        content = content.replace(maniReg, '$1' + manifest + '$2');
    }else{
        var attr = ' manifest="' + manifest + '" '
        content = content.replace(/(<html)([^>]*>)/i, '$1' + attr + '$2');
    }
    var filename = path.join(config.outputRoot, url);
    file.write(filename, content);
    var reg = /<link\s+.*?href="?([^"]+)"?[^>]+>/gi;
    var attReg = /rel="?\bstylesheet\b"?/i;
    var csss = [];
    content.replace(reg, function(m, u1){
        if(attReg.test(m)){
            csss.push(u1);
        }
    });
    // console.log(csss);
    return csss;
}

var pickupImg = function(url, config){
    url = url.split('?')[0];
    url = config.linkPrefix ? url.replace(config.linkPrefix, '') : url;
    // console.log(url);
    var content = fs.readFileSync(url).toString();
    var styleRoot = path.join(config.linkPrefix, path.dirname(url));
    var reg = /url\(["']?([^"')]+)["']?\)/gi;
    var imgs = [];
    content.replace(reg, function(m, u1){
        imgs.push(path.join(styleRoot, u1));
    });
    // console.log(imgs);
    return imgs;
}

var writeManifest = function(name, list, config){
    //write cache
    var record = [];
    record.push('CACHE MANIFEST');
    record.push('CACHE:');
    record = record.concat(list);
    //write network
    record.push('NETWORK:');
    record = record.concat(config.network);
    //write fallback
    record.push('FALLBACK:');
    record = record.concat(config.fallback);
    //write timestamp
    record.push('#generate @' + +new Date);
    var content = record.join('\n');
    var filename = path.join(config.outputRoot, name);
    file.write(filename, content);
}
/**
 * 合并数组，排除掉重复的
 * @param  {Array} origin 
 * @param  {Array} list   
 */
var mergeArray = function(origin, list){
    for(var i = 0, item; item = list[i]; i++) {
        if(origin.indexOf(item) === -1){
            origin.push(item);
        }
    }
}

/**
 * 入口函数
 * @param  {String} configFile 
 */
exports.generate = function(config){
    // 读取配置
    var cacheList = config.cache;
    var htmls, csss, jss, imgs, list, manifest;
    for(var name in cacheList){
        list = [];
        htmls = cacheList[name];
        manifest = name + '.' + config.manifestSuffix;
        for(var i = 0, html; html = htmls[i]; i++) {
            // 收集 html
            list.push(html);
            // 收集 js
            jss = pickupJs(html);
            mergeArray(list, jss);
            // 收集 css
            csss = pickupCss(html, manifest, config);
            mergeArray(list, csss);
            // 收集 css 里面的图片
            for(var j = 0, css; css = csss[j]; j++) {

                imgs = pickupImg(css, config);
                mergeArray(list, imgs);
            }
        }
        //创建 manifest 
        writeManifest(manifest, list, config);
    }
}

exports.run = function(cmdConfig, callback) {

    var source = cmdConfig.source,
        target = cmdConfig.target;

    var options = {
        'linkPrefix': '',
        'manifestSuffix': 'manifest',
        'network': [
            '*'
        ],
        'fallback': []
    };
    _.extend(options, cmdConfig.options);
    options.outputRoot = target;
    
    options.cache = {};
    var htmlList = file.expandFiles(util.formatSourceFileType(source, 'html'));
    _.each(htmlList, function(html){
        var basename = path.basename(html, '.html');
        options.cache[basename] = [ html ];
    });
    console.log(options)
    // generate manifest use ioffline
    // {
    //     css 文件中, 如果图片url是写了绝对路径, 也就是说 html 跟 css 或 图片不在一个域名下
    //     就要设置下面这个属性
    //     "linkPrefix": "http://cdn.xxx.com/",//optional
    //     "manifestSuffix": "manifest", // optional
    //     "outputRoot": "./output/", //optional 默认在当前目录输出 "./", 建议填入
    //     "cache": { //required 必须
    //         "offline": [//offline 是 输出的manifest的名字,跟 manifestSuffix 组合成文件名
    //             "index.html"
    //         ],
    //         "offline2": [
    //             "index.html",
    //             "main.html"
    //         ]
    //     },
    //     "network": [  "*"  ],//optional
    //     "fallback": [ // optional
    //         "/ fallback.html"
    //     ]
    // }
    exports.generate(options);

    callback();
};