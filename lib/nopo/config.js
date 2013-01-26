
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
    MODE: 'all',
    // NOPO_FILE: 'nopo.json',
    // NOPO_PARSER: 'nopo-json',
    NOPO_FILE: 'nopo.js',
    NOPO_PARSER: 'nopo-node',
    DEAFAULT_CMD: 'copy',
    PLAIN_EXT: 'js,css,html,html,manifest,json',
    BIN_EXT: 'jpg,jpeg,bmp,ico,gif,png,exe,7z,zip,rar',
    ADD_PLAIN_EXT: '',
    ADD_BIN_EXT: '',
    // SOURCE_ROOT: './', // 作废
    TARGET_ROOT: './nopo-build',
    CUSTOM_CMD_ROOT: './nopo_cmds',
    DEAFAULT_SOURCE: './',
    DEAFAULT_TARGET: './',
    _TASKS: []
};

defaultCofig.NOPO_TEMP = path.join(defaultCofig.TARGET_ROOT, './nopo.temp');

// todo extend option config
_.extend(config, defaultCofig);

// 允许的扩展名
var allowPlainExt = config.PLAIN_EXT + ',' + config.ADD_PLAIN_EXT;
var allowBinExt = config.BIN_EXT + ',' + config.ADD_BIN_EXT;
var allowExt = allowPlainExt + ',' + allowBinExt;
config.ALLOW_EXT = _.compact(allowExt.split(','));
config.ALLOW_PLAIN_EXT = _.compact(allowPlainExt.split(','));
config.ALLOW_BIN_EXT = _.compact(allowBinExt.split(','));

config.load = function(callback){
    config.loadNopofile(callback);
};

config.loadNopofile = function(f, callback){

    if(_.isFunction(f)){
        callback = f;
        f = path.resolve(cwd, config.NOPO_FILE);
    }

    pathExists(f, function (exists) {
        if (exists) {
            var parser, nopoObject;
            try {
                parser = requireParser(config.NOPO_PARSER);
                // nopo object examples
                nopoObject = parser.parse(f);
                _.extend(config, nopoObject);
                console.log(JSON.stringify(config));
            }
            catch (e) {
                return callback(1, e);
            }
            callback(0, nopoObject);
        }
        else {
            callback(1, 'nopo file not exists!');
        }
    });

};

config.getTasks = function(){
    return config._TASKS;
};