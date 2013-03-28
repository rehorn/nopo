
var nopo = require('../../core'),
    _ = nopo.util._,
    path = require('path'),
    file = nopo.file,
    logger = nopo.logger
    config = nopo.config,
    util = nopo.util;

// nopoObject examples
// {
//     "nopoParser": "nopo-node",
//     "tasks": {
//         "task1": {
//             "cmd": "copy|compress",
//             "mode": "dev",
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
//     "modes": {
//          "dev":"task1,*|task3", // * for other
//          "test":"task1,task2|task3",
//          "dist":"task1,task2|task3"
//     },
//     "tasks": [
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

var nopoObject, mode;
var setting = config.getSetting();

function getConfigValue(key){
    return nopoObject[key] || setting[key];
};

var parseTask = function(taskConfig, taskKey){
    var task;
    if(taskConfig){
        var cmd = taskConfig.cmd || setting.defaultCmd,
            tempRoot = path.join(getConfigValue('nopoTemp')),
            oSource = taskConfig.source,
            oTarget = taskConfig.target;

        var sourceRaw = oSource, 
            targetRaw = oTarget;

        // source可以是string或array, target 一般只能一个，多个target的情况，建议新加规则
        if(!_.isArray(oSource)){
            oSource = [oSource];
        }
        oSource = _.map(oSource, function(item){
            // return path.join(getConfigValue('sourceRoot'), item || setting.defaultSource);
            // 去除source root，作用不大
            item = item || setting.defaultSource;
            // 默认为 / 结尾的文件夹加上循环子目录选项
            if(util.detectDestType(item) == 'dir'){
                item = item + '**';
            }
            return item;
        });

        if(_.isArray(oTarget)){
            oTarget = oTarget[0];
            logger.warn('target must not be an Array!');
        }
        oTarget = oTarget || setting.defaultTarget;
        // 非根路径
        if(!_(oTarget).startsWith('/')){
            oTarget = path.join(getConfigValue('targetRoot'), oTarget);
        }

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
                        target = path.join(setting.nopoTemp, cmdId, path.sep);
                    }
                    var c = {
                        cmdId: cmdId,
                        cmdName: pl,
                        source: source,
                        target: target,
                        sourceRaw: sourceRaw,
                        targetRaw: targetRaw,
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
                    sourceRaw: sourceRaw,
                    targetRaw: targetRaw,
                    options: taskConfig['@' + sl] || {}
                };
                task.cmds.push(c);
            }
        });

    }
    return task;
};

function getModeTaskKeys(mode, tasks){
    var result = [];
    _.each(tasks, function(value, key){
        value.mode = value.mode || 'all';
        if(value.mode == mode){
            result.push(key);
        }
    });
    return result;
};

function normalize(modeConfig, tasks){
    var rule = {},
        otherRule = [];
    otherRule = getModeTaskKeys(mode, tasks);
    modeConfig = modeConfig.replace(/\s+/g, '');
    _.each(modeConfig.split(/,|\|/), function(item){
        if(item != '*'){
            rule[item] = 1;
            otherRule = _.without(otherRule, item);
        }
    });
    var patternOne = /(,?)\s*(\*)\s*(,?)/g, 
        patternTwo = /(\|?)\s*(\*)\s*(\|)/g;
    if(patternOne.test(modeConfig)){
        modeConfig = modeConfig.replace(patternOne, function(match, group1, group2, group3){
            return group1 + otherRule.join(',') + group3;
        });
    }else if(patternTwo.test(mode)){
        modeConfig = modeConfig.replace(patternTwo, function(match, group1, group2, group3){
            return group1 + otherRule.join('|') + group3;
        });
    }
    console.log(modeConfig)
    return modeConfig;
};

exports.parseNopoObject = function(no){
    no = nopoObject = no || {};
    mode = getConfigValue('mode');
    var tasks = no.tasks || {};
    var modeConfig = no.modes && no.modes[mode];
    no._TASKS = [];

    if(modeConfig){
        modeConfig = normalize(modeConfig, tasks);
        var cache = {};
        // series tasks
        var series = modeConfig.replace(/\s+/g, '').split('|');
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

        // 使用 * 替代
        // _.each(tasks, function(value, key){
        //     if(!cache[key]){
        //         no._TASKS.push(parseTask(value, key));
        //     }
        // });
    }else{
        _.each(tasks, function(value, key){
            no._TASKS.push(parseTask(value, key));
        });
    }

    delete no.modes;
    delete no.tasks;
    no.tasks = no._TASKS;

    return no;
};

exports.parse = function(filepath){
    var no = file.readJSON(filepath);
    return exports.parseNopoObject(no);
};