
var _ = require('underscore'),
    path = require('path'),
    fs = require('fs'),
    file = require('./file');

var pathExists = fs.exists || path.exists;
var cwd = process.cwd();

var config = module.exports = {};

var requireParser = function(parser){
    return require('../driver/config-parser/' + parser);
}

var defaultCofig = {
    NOPO_FILE: 'nopo.json',
    NOPO_PARSER: 'json',
    PLAIN_EXT: ['js', 'css', 'html', 'htm', 'manifest', 'json'],
    BINARY_EXT: ['jpg', 'jpeg', 'bmp', 'gif', 'png', 'exe', '7z', 'zip', 'rar'],
    SRC_ROOT: './',
    TARGET_ROOT: './nopo-build'
};

// todo mixin option config
_.mixin(config, defaultCofig);

// 
config.ALLOW_EXT = config.PLAIN_EXT.concat(config.BINARY_EXT);

exports.load = function(callback){
    exports.loadNopofile(callback);
};

exports.loadNopofile = function(f, callback){

    if(_.isFunction(f)){
        callback = f;
        f = path.resolve(cwd, config.NOPO_FILE);
    }

    pathExists(f, function (exists) {
        if (exists) {
            try {
                var parser = require(config.NOPO_PARSER);
                // nc object
                var nc = parser.parse(f);
            }
            catch (e) {
                return callback(1, e);
            }
            callback(0);
        }
        else {
            callback(1, 'nopo file not exists!');
        }
    });

};