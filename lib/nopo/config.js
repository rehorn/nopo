
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
    NOPO_FILE: 'nopo.json',
    NOPO_PARSER: 'nopo',
    PLAIN_EXT: 'js,css,html,html,manifest,json',
    BIN_EXT: 'jpg,jpeg,bmp,ico,gif,png,exe,7z,zip,rar',
    ADD_PLAIN_EXT: '',
    ADD_BIN_EXT: '',
    SOURCE_ROOT: './',
    TARGET_ROOT: './nopo-build',
    CUSTOM_CMD_ROOT: './custom_cmd',
    DEAFAULT_SOURCE: './',
    DEAFAULT_TARGET: './',
    _TASKS: []
};

defaultCofig.NOPO_TEMP = path.join(defaultCofig.TARGET_ROOT, './nopo.temp');

// todo extend option config
_.extend(config, defaultCofig);

// 
config.ALLOW_EXT = config.PLAIN_EXT + ',' + config.BIN_EXT;

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
                // nc object
                nopoObject = parser.parse(f);
                config._TASKS = nopoObject;
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