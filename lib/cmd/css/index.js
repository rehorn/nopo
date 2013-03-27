var nopo = require('../../core'),
    _ = nopo.util._,
    file = nopo.file,
    logger = nopo.logger,
    util = nopo.util,
    path = require('path'),
    fs = require('fs'),
    crypto = require('crypto'),
    querystring = require('querystring'),
    existsSync = fs.existsSync || path.existsSync;

var urlPattern = /url\(([^\)]+)\)/g;
var isWindows = process.platform === 'win32';
var _opt = {};
var cycleList = [], cycleIndex = 0;

function parseImageUrl(url, rel) {
    var tokens = url.replace(/['"]/g, '').split('?');
    var query = tokens[1] ? querystring.parse(tokens[1]) : {};
    var imagePath = path.normalize(tokens[0]);
    var absolutePath = path.resolve(path.join(rel, imagePath));
    var relPath = path.relative(process.cwd(), absolutePath);

    if (isWindows && imagePath.indexOf('data:image') < 0) {
        imagePath = imagePath.replace(/\\/g, '/');
        relPath = relPath.replace(/\\/g, '/');
    }
    return {
        root: rel,
        origin: imagePath,
        relative: relPath,
        absolute: absolutePath,
        query: query,
        exists: existsSync(absolutePath)
    };
}

function enhanceCss(css, filepath) {
    var cssDir = path.dirname(filepath);
    var data = {
        origin: css
    };
    var duplicateUrls = {};
    var allUrls = [];
    var dHost = {};
    var md5Mark = '';

    // parse all images & duplicate images
    (css.match(urlPattern) || []).forEach(function(match) {
        var url = match.substring(4, match.length - 1);
        var pathInfo = parseImageUrl(url, cssDir);

        if(duplicateUrls[pathInfo.absolute]){
            duplicateUrls[pathInfo.absolute]++;
        }else{
            duplicateUrls[pathInfo.absolute] = 1;
        }

        allUrls.push(pathInfo);

        if(_opt.addMark){
            md5Mark += getFileHex(pathInfo.absolute);
        }
    });

    data.result = css.replace(urlPattern, function(match, url){
        // // data uri
        var pathInfo = parseImageUrl(url, cssDir);

        // skip remote / not-exists images
        if(!pathInfo.exists){
            return match;
        }

        // datauri & !exclude & 跳过重复并且url重复了
        if(_opt.dataUri && 
            !file.isMatch(_opt.exclude, pathInfo.relative) &&
            !(_opt.skipDuplicate && duplicateUrls[pathInfo.absolute] > 1))
        {
            var type = path.extname(pathInfo.origin).substring(1);
            if(type == 'jpg'){
                type = 'jpeg';
            }
            if(type == 'svg'){
                type = 'svg+xml';
            }

            if (!/(jpeg|gif|png|svg\+xml)/.test(type)){
                return match;
            }

            var base64 = fs.readFileSync(pathInfo.absolute).toString('base64');

            return "url(data:image/" + type + ";base64," + base64 + ")";
        }

        // stamp
        if(_opt.stamp){
            var host = (getNextAssetHost() || '');
            if(duplicateUrls[pathInfo.absolute] > 1){
                host = dHost[pathInfo.absolute] || host;
                dHost[pathInfo.absolute] = host;
            }

            addFileStamp(pathInfo);

            return ['url(', host , pathInfo.stamp, ')'].join('');
        }
        
    });

    // addMark
    if(_opt.addMark){
        var encrypted = crypto.createHash('md5');
        encrypted.update(md5Mark);
        data.result += '\r\n#nopo-build-generate-mark{content: "' + encrypted.digest('hex') + '";}';
    }

    return data.result;
}

function getFileHex(absolute){
    var source = fs.readFileSync(absolute);
    var encrypted = crypto.createHash('md5');

    encrypted.update(source.toString('utf8'));
    var stamp = encrypted.digest('hex');
    return stamp;
}

function getNextAssetHost() {
    var hosts = _opt.assetHosts;
    if(!hosts){
        return '';
    }

    if(hosts.indexOf('[') == -1){
        return fixAssetHost(hosts);
    }
   
    var start = hosts.indexOf('[');
    var end = hosts.indexOf(']');
    var pattern = hosts.substring(start + 1, end);

    pattern.split(',').forEach(function(version) {
        cycleList.push(hosts.replace(/\[([^\]])+\]/, version));
    });

    if(cycleIndex == cycleList.length){
        cycleIndex = 0;
    }
    return fixAssetHost(cycleList[cycleIndex++]);
};

function fixAssetHost(host){
    if(/^http:\/\//.test(host) || /^https:\/\//.test(host) || /^\/\//.test(host)) {
        return host;
    }
    return '//' + host;
};

function addFileStamp(pathInfo){
    pathInfo.stamp = pathInfo.relative;
    if(_opt.cryptedStamp){
        pathInfo.stamp += "?v=" + getFileHex(pathInfo.absolute).substring(0, 8);
    } else {
        pathInfo.stamp += "?v=" + Date.parse(fs.statSync(pathInfo.absolute).mtime) / 1000;
    }
    return pathInfo;
};

exports.run = function(cmdConfig, callback) {

    var source = cmdConfig.source,
        target = cmdConfig.target;

    var options = {
        // 是否为图片增加修改时间搓 ?m=
        stamp: 1,
        // 使用md5作为时间戳
        cryptedStamp: 0,
        // 为图片增加cdn host随机前准 qplus[0,9].idqqimg.com
        assetHosts: null,
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
    };
    _.extend(options, cmdConfig.options);
    _opt = options;

    var fileMap = file.getFilesSourceTargetMap(source, target);

    fileMap.files.forEach(function(item) {
        var from = item,
            to = fileMap[from];

        var css = file.read(from);
        css = enhanceCss(css, from);
        file.write(to, css);
    });

    callback();
};
