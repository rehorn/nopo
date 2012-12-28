
var _ = require('underscore'),
    async = require('async'),
    path = require('path'),
    cmd = require('./cmd'),
    config = require('./config'),
    logger = require('./logger');

var task = module.exports = {};

task.runTask = function(task, callback){
    logger.info('task:' + task.taskId + ' is running!');
    cmd.runCmds(task, callback);
};

task.runTasks = function(tasks){
    var _TASKS = [],
    seriesTaskQueue = [];

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

                    var groupId = _.reduce(item, function(memo, i){
                        return i.taskId + ',' + memo;
                    }, '');

                    callback(null, groupId);
                });

            }else{
                task.runTask(item, callback);
            }

        };

        return seriesTaskFunc;
       
    });

    async.series(seriesTaskQueue, function(err, results){
        console.log(results);
    });

};

