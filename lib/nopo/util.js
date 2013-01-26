
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

util.endsWith = function(str, end){
    var index = str.lastIndexOf(end);
    return index + end.length == str.length;
};

util.noop = function(){};

// 从字符上判断路径类型
util.detectDestType = function(target) {
    return util.endsWith(target, path.sep) ? 'dir' : 'file';
};

util.suffix = function( filepath, suffix ){
    var dn = path.dirname(filepath);
    var en = path.extname(filepath);
    var bn = path.basename(filepath, en);

    return path.join(dn , bn + suffix + en);
};
