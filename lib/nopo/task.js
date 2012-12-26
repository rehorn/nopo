
var _ = require('underscore'),
    config = require('./config');

var task = module.exports = {};

var _TASKS = [];

task.initTasks = function(tasks){
    _TASKS = tasks || config.getTasks();
};

task.run = function(){
    _.each(_TASKS, function(item){
        // parallel
        if(_.isArray(item)){

        }else{
            
        }
    });
};

