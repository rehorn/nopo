
var _ = require('underscore'),
    path = require('path');

var util = module.exports = {};

_.str = require('underscore.string');

_.mixin(_.str.exports());

util._ = _;

var win32 = process.platform === 'win32';

util.linefeed = win32 ? '\r\n' : '\n';

util.normalizelf = function(str) {
    return str.replace(/\r\n|\n/g, util.linefeed);
};

// Normalize \\ paths to / paths.
var normalize = util.normalize = function(str) {
    return win32 ? str.replace(/\\/g, '/') : str;
};

util.noop = function(){};

// 从字符上判断路径类型
util.detectDestType = function(target) {
    // return util.endsWith(target, path.sep) ? 'dir' : 'file';
    return (_.endsWith(target, '\\') || _.endsWith(target, '/')) ? 'dir' : 'file';
};

// 如 jquery.js => jquery.min.js
util.suffix = function(filepath, suffix){
    var dn = path.dirname(filepath);
    var en = path.extname(filepath);
    var bn = path.basename(filepath, en);

    return path.join(dn , bn + suffix + en);
};

// fileType: 'js,txt'
util.formatFileType = function(source, fileType, recursive){
    recursive = _.isUndefined(recursive) ? 1 : 0;
    fileType = fileType || '*';
    if(!_.isArray(source)){
        source = [source];
    }
    if(_.str.include(fileType, ',')){
        fileType = '{' + fileType + '}';
    }

    source = _.map(source, function(item){
        item = normalize(item);
        if(_.endsWith(item, '/*')){
            return item + '.' + fileType;
        }else if(_.endsWith(item, '/**')){
            return item + '/*.' + fileType;
        }else if(util.detectDestType(item) == 'dir'){
            if(recursive){
                return item + '**/*.' + fileType;
            }else{
                return item + '*.' + fileType;
            }
        }
        return item;
    });
    // console.log(source)
    return source;
};

