
var nopo = require('../../core'),
    _ = nopo.util._,
    file = nopo.file,
    logger = nopo.logger,
    util = nopo.util,
    path = require('path'),
    fs = require('fs');

var urlPattern = /url\(([^\)]+)\)/g;

function parseImageUrl(url){
    var query = tokens[1] ? querystring.parse(tokens[1]) : {};
    var imagePath = path.normalize(tokens[0]);
    var absolutePath = path.join(this.options.rootPath, imagePath);

    if(isWindows && imagePath.indexOf('data:image') < 0){
        imagePath = imagePath.replace(/\\/g, '/');
    }

    return {
        relative: imagePath,
        absolute: absolutePath,
        query: query,
        exists: existsSync(absolutePath)
    };
}

// enhance-css
function enhanceCss(css){
    var data = { original: css };
    var embedUrls = {};
    var allUrls = [];

    (css.match(this.urlPattern) || []).forEach(function(url){
      var pathInfo = parseImageUrl(url.substring(4, url.length - 1));

      if (pathInfo.query.embed !== undefined) {
        if (embedUrls[pathInfo.relative])
          embedUrls[pathInfo.relative]++;
        else
          embedUrls[pathInfo.relative] = 1;
      }

      allUrls.push(pathInfo);
    });

    return css;
}

exports.run = function(cmdConfig, callback) {

    var source = cmdConfig.source,
        target = cmdConfig.target;

    var options = {
        stamp: 1, // 是否为图片增加修改时间搓 ?m=
        cryptedStamp: 0, // 使用md5作为时间戳
        assetHosts: null, // 为图片增加cdn host随机前准 qplus[0,9].idqqimg.com
        dataUri: 0, // 把图片资源base64后插入
        mhtmlUri: 0, // ie6,7,8 support base64 
        exclude: [], // dataUri exclude list
        addMark: 1 // 是否增加一个nopo-build规则，content为处理时间、图片md5等信息
    };
    _.extend(options, cmdConfig.options);

    var fileMap = file.getFilesSourceTargetMap(source, target);

    fileMap.files.forEach(function(item){
        var from = item,
            to = fileMap[from];

        var css = file.read(from);
        css = enhanceCss(css);
        file.write(to, css);
    });

    callback();
};
