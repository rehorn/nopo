var nopo = require('../../core'),
    _ = nopo.util._,
    file = nopo.file,
    logger = nopo.logger,
    util = nopo.util,
    path = require('path'),
    fs = require('fs');

exports.run = function(cmdConfig, callback) {

    var source = cmdConfig.source,
        target = cmdConfig.target;

    var buster = {
        type: 'time' // time | hash
    };
    var datauri = {
        exclude: [] // 
    };
    var host = {
        assets: []  
    };
    var mark = 1;
    var options = {};
    _.extend(options, cmdConfig.options);

    

};