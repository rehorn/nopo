
var _ = require('underscore'),
    async = require('async'),
    path = require('path'),
    config = require('./config'),
    logger = require('./logger');

var task = module.exports = {};

var _TASKS = [],
    seriesTaskQueue = [];

// task.requireTask = function(task){
//     var tpath = path.resolve('../cmd', task.taskId),
//         cpath = path.resolve(config.CUSTOM_CMD_ROOT, task.taskId);
//     var t = require(tpath) || require(cpath);
//     if(t){

//     }else{
//         logger.error('task')
//     }
// };

task.initTasks = function(tasks){
    _TASKS = tasks || config.getTasks();
    // tasks to queue
    seriesTaskQueue = _.map(_TASKS, function(item){

        var seriesTaskFunc = function(callback){
            
            if(_.isArray(item)){

                var parallelTaskQueue = _.map(item, function(pl){
                    var parallelTaskFunc = function(pCallback){
                        task.runTask(pl, pCallback);
                    };
                    return parallelTaskFunc;
                });

                async.parallel(parallelTaskQueue, function(err, results){
                    callback(null, 1);
                });

            }else{
                task.runTask(item, callback);
            }

        };

        return seriesTaskFunc;
       
    });
};
// var cmdQueue = [];
//     // cmd to queue
//     cmdQueue = _.map(task, function(item){
//         // parallel
//         if(_.isArray(item)){
//             var taskFunc = function(callback){

//             };
//         }else{
//             var taskFunc = function(callback){
//                 task.runTask(item, taskOptions, callback);
//             };
//         }
//     });
task.runTask = function(task, callback){
    logger.info('task:' + task.taskId + ' is running!');
    cmd.initCmds(task.cmds);
    cmd.runCmds()
};

task.runTasks = function(){

    async.series(seriesTaskQueue, function(err, results){
        console.log(results);
    });

};

