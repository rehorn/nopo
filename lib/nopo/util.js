
var _ = require('underscore'),
    path = require('path');

var util = module.exports = {};

_.str = require('underscore.string');

_.mixin(_.str.exports());

util._ = _;

util.linefeed = process.platform === 'win32' ? '\r\n' : '\n';

util.normalizelf = function(str) {
    return str.replace(/\r\n|\n/g, util.linefeed);
};

util.noop = function(){};

// 从字符上判断路径类型
util.detectDestType = function(target) {
    // return util.endsWith(target, path.sep) ? 'dir' : 'file';
    return (_.endsWith(target, '\\') || _.endsWith(target, '/')) ? 'dir' : 'file';
};

util.suffix = function( filepath, suffix ){
    var dn = path.dirname(filepath);
    var en = path.extname(filepath);
    var bn = path.basename(filepath, en);

    return path.join(dn , bn + suffix + en);
};

// 
util.genSourceTargetFilesMap = function(source, target, isFlatten){
    isFlatten = _.isUndefined(isFlatten) ? false : isFlatten;
    var srcFiles = file.expandFiles(source) || [];
    var stMap = {
        files: srcFiles
    };
    if(srcFiles.length <=0){
        return stMap;
    }

    var targetType = util.detectDestType(target);
    if(srcFiles.length == 1 && targetType == 'file'){
        stMap[srcFiles[0]] = target;
        return stMap;
    }else if(srcFiles.length > 1 && targetType == 'file'){
        target = path.dirname(target);
    }

    srcFiles.forEach(function(fileInput){
        var fileOutput = '';
        if(isFlatten){
            fileOutput = path.join(target, path.basename(fileInput));
        }else{
            var relFilePath = path.relative(process.cwd(), fileInput);
            fileOutput = path.join(target, relFilePath);
        }
        stMap[fileInput] = fileOutput;
    });
    
    return stMap;
};
