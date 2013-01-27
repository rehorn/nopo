

var _ = require('underscore'),
    path = require('path'),
    async = require('async'),
    logger = require('./logger'),
    config = require('./config');

var cmd = module.exports = {};

var setting = config.getSetting();

cmd.loadCmd = function(item){
    try{
        var tpath = path.join('../cmd', item.cmdName),
            cpath = path.join(setting.customCmdRoot, item.cmdName);
        return require(tpath) || require(cpath);
    }catch (e){
        return null;
    }
};

cmd.runCmd = function(item, callback){
    var cmdRuntime = cmd.loadCmd(item);
    if(cmdRuntime){
        logger.log('cmd: [ ' + item.cmdName.cyan + ' ] is running ...');
        cmdRuntime.run(item, callback);
    }else{
        logger.error('cmd: [ ' + item.cmdName.cyan + ' ] not exists!!');
    }
};

cmd.runCmds = function(task, taskCallback){
    var cmds = task && task.cmds || [];
    var seriesCmdQueue = [];
    // cmd to queue
    seriesCmdQueue = _.map(cmds, function(item){

        var seriesCmdFunc = function(callback){
            // parallel
            if(_.isArray(item)){
                var parallelCmdQueue = _.map(item, function(pl){
                    var parallelCmdFunc = function(pCallback){
                        var done = function(){
                            logger.log('cmd :[ ' + pl.cmdName.cyan + ' ] done');
                            pCallback();
                        };
                        cmd.runCmd(pl, done);
                    };
                    return parallelCmdFunc;
                });

                async.parallel(parallelCmdQueue, function(err, results){
                    callback(null, task.taskId);
                });
            }else{
                var done = function(){
                    logger.log('cmd :[ ' + item.cmdName.cyan + ' ] done');
                    callback();
                };
                cmd.runCmd(item, done);
            }
        };

        return seriesCmdFunc;
    });

    async.series(seriesCmdQueue, function(err, results){
        // console.log('cmd series success');
        logger.log('task:[ ' + task.taskId.cyan + ' ] done');
        taskCallback(null, task.taskId);
    });
};