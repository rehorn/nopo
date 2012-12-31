
var _ = require('underscore');

var util = module.exports = {};

util._ = _;

util.linefeed = process.platform === 'win32' ? '\r\n' : '\n';

util.normalizelf = function(str) {
    return str.replace(/\r\n|\n/g, util.linefeed);
};

util.endsWith = function(str, end){
    var index = str.lastIndexOf(end);
    return index + end.length == str.length;
}