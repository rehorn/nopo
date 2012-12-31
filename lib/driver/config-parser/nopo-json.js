
var nopo = require('../../core'),
    _ = nopo.util._,
    path = require('path'),
    file = nopo.file,
    logger = nopo.logger
    config = nopo.config;

// nopoObject examples
// {
//     "NOPO_PARSER": "nopo-node",
//     "tasks": {
//         "task1": {
//             "cmd": "copy|compress",
//             "source": "./",
//             "target": "./",
//             "@copy": {
//                 "test": true
//             }
//         },
//         "task2": {
//             "cmd": "copy,compress,concat",
//             "source": "./",
//             "target": "./"
//         },
//         "task3": {
//             "cmd": "copy",
//             "source": "./",
//             "target": "./"
//         }
//     },
//     "groups": "task1,task2|task3",
//     "_TASKS": [
//         [{
//             "taskId": "task1",
//             "cmds": [{
//                 "cmdId": "task1.copy",
//                 "cmdName": "copy",
//                 "source": "./",
//                 "target": "./",
//                 "options": {
//                     "test": true
//                 }
//             }, {
//                 "cmdId": "task1.compress",
//                 "cmdName": "compress",
//                 "source": "./",
//                 "target": "./",
//                 "options": {}
//             }]
//         }, {
//             "taskId": "task2",
//             "cmds": [
//                 [{
//                     "cmdId": "task2.copy",
//                     "cmdName": "copy",
//                     "source": "./",
//                     "target": "nopo-build\\nopo.temp\\task2.copy\\",
//                     "options": {}
//                 }, {
//                     "cmdId": "task2.compress",
//                     "cmdName": "compress",
//                     "source": "nopo-build\\nopo.temp\\task2.copy\\",
//                     "target": "nopo-build\\nopo.temp\\task2.compress\\",
//                     "options": {}
//                 }, {
//                     "cmdId": "task2.concat",
//                     "cmdName": "concat",
//                     "source": "nopo-build\\nopo.temp\\task2.compress\\",
//                     "target": "./",
//                     "options": {}
//                 }]
//             ]
//         }],
//         {
//             "taskId": "task3",
//             "cmds": [{
//                 "cmdId": "task3.copy",
//                 "cmdName": "copy",
//                 "source": "./",
//                 "target": "./",
//                 "options": {}
//             }]
//         }]
// }

var nopoObject;
var getConfigValue = function(key){
    return nopoObject[key] || config[key];
};

var parseTask = function(taskConfig, taskKey){
    var task;
    if(taskConfig){
        var cmd = taskConfig.cmd || config.DEAFAULT_CMD,
            oSource = path.join(getConfigValue('SOURCE_ROOT'), taskConfig.source || config.DEAFAULT_SOURCE),
            oTarget = path.join(getConfigValue('TARGET_ROOT'), taskConfig.target || config.DEAFAULT_TARGET),
            tempRoot = path.join(getConfigValue('NOPO_TEMP'));
        
        task = {
            taskId: taskKey,
            cmds: []
        };

        // series cmds
        var series = cmd.replace(/\s+/g, '').split('|');
        _.each(series, function(sl){
            // parallel cmds
            if(sl && sl.indexOf(',') > -1){
                var parallel = sl.split(',');
                var pCmds = [];
                var source = oSource,
                    target = oTarget;
                _.each(parallel, function(pl, index){
                    var cmdId = taskKey + '.' + pl;
                    // 最后一个cmd的target=oTarget
                    if(index == parallel.length - 1){
                        target = oTarget;
                    }else{
                        target = path.join(config.NOPO_TEMP, cmdId, path.sep);
                    }
                    var c = {
                        cmdId: cmdId,
                        cmdName: pl,
                        source: source,
                        target: target,
                        options: taskConfig['@' + pl] || {}
                    };
                    pCmds.push(c);
                    source = target;
                });
                task.cmds.push(pCmds);
            }else{
                var c = {
                    cmdId:  taskKey + '.' + sl,
                    cmdName: sl,
                    source: oSource,
                    target: oTarget,
                    options: taskConfig['@' + sl] || {}
                };
                task.cmds.push(c);
            }
        });

    }
    return task;
};

exports.parseNopoObject = function(no){
    no = nopoObject = no || {};
    var tasks = no.tasks || {};
    var groups = no.groups || '';
    no._TASKS = [];

    if(groups){
        var cache = {};
        // series tasks
        var series = groups.replace(/\s+/g, '').split('|');
        _.each(series, function(sl){
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
                no._TASKS.push(parseTask(value, key));
            }
        });
    }else{
        _.each(tasks, function(value, key){
            no._TASKS.push(parseTask(value, key));
        });
    }

    delete no.groups;
    delete no.tasks;

    return no;
};

exports.parse = function(filepath){
    var no = file.readJSON(filepath);
    return exports.parseNopoObject(no);
};