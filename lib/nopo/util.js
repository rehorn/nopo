
var util = module.exports = {};

util.linefeed = process.platform === 'win32' ? '\r\n' : '\n';

util.normalizelf = function(str) {
    return str.replace(/\r\n|\n/g, util.linefeed);
};