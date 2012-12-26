
var nopo = module.exports = {};

function nopoPublish(source, methodName, newMethodName) {
    nopo[newMethodName || methodName] = source[methodName].bind(source);
}

function nopoRequire(module){
    return nopo[module] = require('nopo/' + module);
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
nopo.verson = '0.0.1';




