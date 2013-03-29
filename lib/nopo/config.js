
var _ = require('underscore'),
    path = require('path'),
    fs = require('fs'),
    file = require('./file'),
    logger = require('./logger');

var pathExists = fs.exists || path.exists;
var cwd = process.cwd();

var config = module.exports = {};

var requireParser = function(parser){
    return require('../driver/config-parser/' + parser);
}

var setting = {
    mode: 'dev',
    // nopoFile: 'nopo.json',
    // nopoParser: 'nopo-json',
    nopoFile: 'nopo.js',
    nopoParser: 'nopo-node',
    defaultCmd: 'copy',
    plainExt: 'js,css,html,html,manifest,json',
    binExt: 'jpg,jpeg,bmp,ico,gif,png,exe,7z,zip,rar',
    addPlainExt: '',
    addBinExt: '',
    cloneProject: 1, // 编译前是否clone项目，防止修改
    applyFileFilter: 1,
    sourceRoot: '__nopo_clone__/', // 不能自定义，为了避免编译修改原文件，编译前先将文件复制到临时目录
    targetRoot: 'nopo-build/',
    customCmdRoot: 'nopo_cmds',
    defaultSource: '',
    defaultTarget: '',
    tasks: [],
    meta: {}, // 变量
};

setting.nopoTemp = path.join(setting.targetRoot, '__nopo.temp__/');

// 允许的扩展名
var allowPlainExt = setting.plainExt + ',' + setting.addPlainExt;
var allowBinExt = setting.binExt + ',' + setting.addBinExt;
var allowExt = allowPlainExt + ',' + allowBinExt;
setting.allowExt = _.compact(allowExt.split(','));
setting.allowPlainExt = _.compact(allowPlainExt.split(','));
setting.allowBinExt = _.compact(allowBinExt.split(','));

config.load = function(callback){
    config.loadNopofile(callback);
};

config.loadNopofile = function(f, callback){

    if(_.isFunction(f)){
        callback = f;
        f = path.resolve(cwd, setting.nopoFile);
    }

    pathExists(f, function (exists) {
        if (exists) {
            var parser, nopoObject;
            try {
                parser = requireParser(setting.nopoParser);
                // nopo object examples
                nopoObject = parser.parse(f);
                _.extend(setting, nopoObject);

                // 是否clone
                if(!setting.cloneProject){
                    setting.sourceRoot = '';
                }
                config.setting = setting;
                // console.log(JSON.stringify(setting));
                logger.log('nopofile loaded'.cyan + ': [' + f + ']');
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

config.getSetting = function(){
    return setting;
};

config.getTasks = function(){
    return setting.tasks;
};

config.getMeta = function(){
    return setting.meta;
};