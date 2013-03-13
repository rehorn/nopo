var nopo = require('../../core'),
    _ = nopo.util._,
    file = nopo.file,
    logger = nopo.logger,
    util = nopo.util,
    css = require('css'),
    path = require('path'),
    fs = require('fs');

exports.run = function(cmdConfig, callback) {
    // css source
    var source = cmdConfig.source,
        target = cmdConfig.target;

    var options = {
        type: 'folder', // folder, project
        layout: 'packing', // packing, vertical, horizontal, vertical-right, horizontal-bottom
        // order: '', // 'maxSide', 'width', 'height', 'area'
        prefix: 'sprite_',
        maxSize: 0, // sprite max size 
        png8: 0,
        ratio: 1,
        hash: 1,
        opticss: 0,
        optipng: 1
    };
    _.extend(options, cmdConfig.options);

    // 载入css
    // 分析background和background-image
    // 将background-position，repeat信息解析出来
    // 

};