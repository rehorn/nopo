var nopo = require('../../core'),
    _ = nopo.util._,
    file = nopo.file,
    logger = nopo.logger,
    util = nopo.util,
    css = require('css'),
    path = require('path'),
    fs = require('fs');

var spriter;

exports.run = function(cmdConfig, callback) {
    // css source
    var source = cmdConfig.source,
        target = cmdConfig.target;

    //  sprite / smart-sprite 共有配置项
    var options = {
        spriter: 'sprite', // sprite, smart-sprite
        engine: 'auto', // auto, gm, canvas
        prefix: 'sprite_',
        hash: 1,
        optiImg: 1
    };

    _.extend(options, cmdConfig.options);

    spriter = require('./spriter/' + options.spriter);
    spriter.init(source, target, options, callback);
    spriter.process();

};