
var nopo = module.exports = {};

function nopoPublish(source, methodName, newMethodName) {
    nopo[newMethodName || methodName] = source[methodName].bind(source);
}

function nopoRequire(module){
    return nopo[module] = require('./nopo/' + module);
}

var cmd = nopoRequire('cmd'),
    config = nopoRequire('config'),
    error = nopoRequire('error'),
    file = nopoRequire('file'),
    logger = nopoRequire('logger'),
    option = nopoRequire('option'),
    task = nopoRequire('task'),
    template = nopoRequire('template'),
    util = nopoRequire('util');


// TODO read package.json
nopo.verson = '0.1.1';
nopo.startTime = (new Date()).getTime();

var observer = {
    onConfigLoaded: function(code, msg){
        if(code == 0){
            task.runTasks();
        }else{
            logger.error(msg);
        }
    }
};

nopo.run = function(){
    logger.writeline();
    logger.log('nopo'.cyan + ' core start to run!');
    config.load(observer.onConfigLoaded);
};

nopo.run();




