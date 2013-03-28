var nopo = require('../../core'),
    _ = nopo.util._,
    file = nopo.file,
    logger = nopo.logger,
    util = nopo.util,
    path = require('path'),
    fs = require('fs');

var _opt;
var regbuild = /<!--\s*build:(\w+)\s*(.+)\s*-->/;
var regend = /<!--\s*endbuild\s*-->/;
var scriptTemplate = '<script type="text/javascript" src="<%= dest %>"></script>';
var stylesheetTemplate = '<link type="text/css" rel="stylesheet" href="<%= dest %>">';

var buildCommand = {
    js: function(options){

    },
    css: function(options){

    },
    tmpl: function(options){

    },
    include: function(options){

    },
    remove: function(options){

    }
};

function getBlocks(html){
    var lines = html.replace(/\r\n/g, '\n').split(/\n/),
        block = false,
        sections = {},
        last,
        blockItem;

    lines.forEach(function(l){
        var build = l.match(regbuild),
            endbuild = regend.test(l);

        // block开始
        if(build){
            // 处于block中
            block = true;
            // create a random key to support multiple removes
            var key = build[2].length > 1 ? build[2] : (Math.random(1,2) * Math.random(0, 1));
            sections[[build[1], key.toString().trim()].join(':')] = last = [];
        }

        // block结束
        if(block && endbuild) {
            last.push(l);
            block = false;
        }

        // block中
        if(block && last) {
            last.push(l);
        }
    });

    var blocks = [];
    for(var s in sections) {

        blockItem = {

        }
        blocks.push(blockItem);
    }

    return blocks;
};

function htmlRefs(html, htmlFrom, htmlTo){
    var htmlFromDir = path.dirname(htmlFrom), 
        htmlToDir = path.dirname(htmlTo);

    var data = {
        origin: html
    };

    var blocks = getBlocks(html);
    var lf = /\r\n/g.test(html) ? '\r\n' : '\n';

    blocks.forEach(function (block) {
        var raw = block.raw.join(lf);
        var options = _.extend({}, _opt, { block: block, lf: lf });

        var replacement = buildCommand[block.cmd](options);
        html = html.replace(raw, replacement);
    });


    // 预留
    data.result = html;
    return html;
};

exports.run = function(cmdConfig, callback) {

    var source = cmdConfig.source,
        target = cmdConfig.target;

    var options = {
    };
    _.extend(options, cmdConfig.options);
    _opt = options;

    var fileMap = file.getFilesSourceTargetMap(source, target);

    fileMap.files.forEach(function(item) {
        var from = item,
            to = fileMap[from];

        var html = file.read(from);
        html = htmlRefs(html, from, to);
        file.write(to, html);
    });

};