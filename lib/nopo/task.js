
var _ = require('underscore'),
    config = require('./config');

var task = module.exports = {};

var _TASKS = [],
    taskQueue = [];

task.initTasks = function(tasks){
    _TASKS = tasks || config.getTasks();
    // tasks to queue
    _.map(_TASKS, function(item, callback){

        var taskFunc = function(callback){

        };

        if(_.isArray(item)){

        }else{

        }
    });
};

task.runTask = function(task){
    
};

task.runTasks = function(){
    _.each(_TASKS, function(item){
        // parallel
        if(_.isArray(item)){

        }else{
            
        }
    });
};

