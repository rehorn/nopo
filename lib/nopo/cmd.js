

var _ = require('underscore'),
    path = require('path'),
    async = require('async'),
    logger = require('./logger');

var cmd = module.exports = {};

cmd.loadCmd = function(item){
    
    // try{
        var tpath = path.join('../cmd', item.cmdName),
            cpath = path.join(config.CUSTOM_CMD_ROOT, item.cmdName);
        return require(tpath) || require(cpath);
    // }catch (e){
        // return null;
    // }
    
};

cmd.runCmd = function(item, callback){
    var cmdRuntime = cmd.loadCmd(item);
    if(cmdRuntime){
        cmdRuntime.run(item, callback);
    }else{
        logger.error('cmd ' + item.cmdName + ' not exists!!');
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
                        cmd.runCmd(pl, pCallback);
                    };
                    return parallelCmdFunc;
                });

                async.parallel(parallelCmdQueue, function(err, results){
                    console.log('cmd parallel success!');
                    console.log(task.taskId)
                    callback(null, task.taskId);
                });
            }else{
                cmd.runCmd(item, callback);
            }
        };

        return seriesCmdFunc;
    });

    async.series(seriesCmdQueue, function(err, results){
        console.log('cmd series success');
        console.log(task.taskId)
        taskCallback(null, task.taskId);
    });
};