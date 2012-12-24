
var nopo = module.exports = {},
    cli = require('./cli'),
    cmd = require('./cmd'),
    config = require('./config'),
    error = require('./error'),
    file = require('./file'),
    logger = require('./logger'),
    option = require('./option'),
    task = require('./task'),
    template = require('./template'),
    util = require('./util');

function nopoPublish(source, methodName, newMethodName) {
    nopo[newMethodName || methodName] = source[methodName].bind(source);
}

// TODO read package.json
// nopo.verson = 


