
var nopo = require('../../core'),
    _ = nopo.util._,
    file = nopo.file,
    logger = nopo.logger
    config = nopo.config;

var parseTask = function(taskConfig, taskKey){
    var task;
    if(taskConfig && taskConfig.cmd){
        var cmd = taskConfig.cmd,
        
        task = {
            taskId: taskKey,
            cmds: []
        };

        // stackline cmds
        var stackline = cmd.replace(/\s+/g, '').split('|');
        _.each(stackline, function(sl){
            // parallel cmds
            if(sl && sl.indexOf(',') > -1){
                var parallel = sl.split(',');
                var pCmds = [];
                _.each(parallel, function(pl){
                    var c = {
                        cmdId: pl,
                        source: '',
                        target: '',
                        options: {}
                    };
                    pCmds.push(c);
                });
                task.cmds.push(pCmds);
            }else{
                var c = {
                    cmdId: sl,
                    source: '',
                    target: '',
                    options: {}
                };
                task.cmds.push(c);
            }
        });

    }
    return task;
};

exports.parse = function(filepath){
    var no = file.readJSON(filepath);
    var tasks = no.tasks || {};
    var groups = no.groups || '';
    no._TASKS = [];

    if(groups){
        var cache = {};
        // stackline tasks
        var stackline = groups.replace(/\s+/g, '').split('|');
        _.each(stackline, function(sl){
            // parallel cmds
            if(sl && sl.indexOf(',') > -1){
                var parallel = sl.split(',');
                var pTasks = [];
                _.each(parallel, function(pl){
                    cache[pl] = 1;
                    pTasks.push(parseTask(tasks[pl], pl));
                });
                no._TASKS.push(pTasks);
            }else{
                cache[sl] = 1;
                no._TASKS.push(parseTask(tasks[sl], sl));
            }
        });

        _.each(tasks, function(value, key){
            if(!cache[key]){
                no._TASKS.push(value, key);
            }
        });
    }else{
        _.each(tasks, function(value, key){
            no._TASKS.push(value, key);
        });
    }
    
    console.log(JSON.stringify(no._TASKS));

    return no;
};