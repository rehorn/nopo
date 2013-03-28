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
var _opt = {}, revFileList = [];
var cycleList = [], cycleIndex = 0;

function parseImageUrl(url, cssFrom, cssTo) {
    var tokens = url.replace(/['"]/g, '').split('?');
    var query = tokens[1] ? querystring.parse(tokens[1]) : {};
    var imagePath = path.normalize(tokens[0]);
    var absolutePath = path.resolve(path.join(cssFrom, imagePath));
    var relPath = path.relative(process.cwd(), absolutePath);
    var toAbsolutePath = path.resolve(path.join(cssTo, imagePath));
    var toRelPath = path.relative(process.cwd(), toAbsolutePath);

    if (isWindows && imagePath.indexOf('data:image') < 0) {
        imagePath = imagePath.replace(/\\/g, '/');
        relPath = relPath.replace(/\\/g, '/');
        toRelPath = toRelPath.replace(/\\/g, '/');
    }
    return {
        origin: imagePath,
        cssFrom: cssFrom,
        cssTo: cssTo,
        relative: relPath,
        absolute: absolutePath,
        toRelative: toRelPath,
        toAbsolute: toAbsolutePath,
        query: query,
        exists: existsSync(absolutePath)
    };
}

function enhanceCss(css, cssFrom, cssTo) {
    var cssFromDir = path.dirname(cssFrom), 
        cssToDir = path.dirname(cssTo);
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
        var pathInfo = parseImageUrl(url, cssFromDir, cssToDir);

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
        var pathInfo = parseImageUrl(url, cssFromDir, cssToDir);

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
    
    // copy new rev files
    if(_opt.rev && revFileList.length > 0){
        _.each(revFileList, function(item){
            file.copy(item.from, item.to);
        });
    }

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

function toStampName(filepath, stamp){
    if(_opt.rev){
        var extensionDotIndex = filepath.lastIndexOf('.');
        return filepath.substring(0, extensionDotIndex) + '-' + stamp + '.' + filepath.substring(extensionDotIndex + 1);
    }else{
        return filepath + '?v=' + stamp;
    }
};

function addRevFile(from, toAbsolutePath, stamp){
    var newPath = toStampName(toAbsolutePath, stamp);
    var copyTask = {
        from: from,
        to: newPath
    };
    revFileList.push(copyTask);
};

function addFileStamp(pathInfo){
    var stamp = '';
    if(_opt.cryptedStamp){
        stamp = getFileHex(pathInfo.absolute).substring(0, 8);
        pathInfo.stamp = toStampName(pathInfo.relative, stamp);
    }else{
        stamp = String(Date.parse(fs.statSync(pathInfo.absolute).mtime) / 1000).substring(0, 8);
        pathInfo.stamp = toStampName(pathInfo.relative, stamp);
    }
    if(_opt.rev){
        addRevFile(pathInfo.relative, pathInfo.toAbsolute, stamp);
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
    };
    _.extend(options, cmdConfig.options);
    _opt = options;

    var fileMap = file.getFilesSourceTargetMap(source, target);

    fileMap.files.forEach(function(item) {
        var from = item,
            to = fileMap[from];

        var css = file.read(from);
        css = enhanceCss(css, from, to);
        file.write(to, css);
    });

    callback();
};
