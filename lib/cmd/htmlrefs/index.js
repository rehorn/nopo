var nopo = require('../../core'),
    _ = nopo.util._,
    file = nopo.file,
    template = nopo.template,
    logger = nopo.logger,
    util = nopo.util,
    path = require('path'),
    fs = require('fs');

var _opt, _cmdConfig;
var regbuild = /<!--\s*(build:\w+\s*.+)\s*-->/;
var regend = /<!--\s*endbuild\s*-->/;
var scriptTemplate = '<script type="text/javascript" src="@@dest"></script>';
var stylesheetTemplate = '<link type="text/css" rel="stylesheet" href="@@dest">';

var buildCommand = {
    noop: function(options){

    },
    js: function(options){
        var block = options.block;
        // compile file dest
        // 路径为空则获取第一个script src值作为默认值
        block.cmd.dest = block.cmd.dest || '';
        // 格式化 pathInfo

        // 复制 js
        
        // 匹配缩进空格
        var indent = (block.raw[0].match(/^\s*/) || [])[0];
        return indent + scriptTemplate;
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

function parseCmdOptions(cmdString){
    // 默认配置项
    var defOptions = {
        build: 'noop',
        dest: '',
        stamp: 'ctime', // ctime, md5
        rev: 0
    };
    // 配置项
    var options = {};
    var pairs = cmdString.split(/,\s+/);
    _.each(pairs, function(pair){
        var splits = pair.split(':');
        if(splits){
            options[splits[0]] = splits[1];
        }
    });
    // 扩展配置
    return _.extend(defOptions, options);
};

function getBlocks(html){
    var lines = html.replace(/\r\n/g, '\n').split(/\n/),
        isInBlock = false,
        blocks = [],
        block,
        last,
        cmdOptions,
        blockItem;

    lines.forEach(function(l){
        var build = l.match(regbuild),
            endbuild = regend.test(l);

        // block开始
        if(build){
            // 处于block中
            isInBlock = true;
            last = [];
            cmdOptions = parseCmdOptions(build[1]);
            block = {
                cmd: cmdOptions,
                raw: last
            };
            blocks.push(block);
        }

        // block结束
        if(isInBlock && endbuild) {
            last.push(l);
            isInBlock = false;
        }

        // block中
        if(isInBlock && last) {
            last.push(l);
        }
    });
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

        var replacement = (buildCommand[block.cmd.build] || buildCommand.noop)(options);
        html = html.replace(raw, replacement);
    });


    // 预留
    data.result = html;
    return html;
};

exports.run = function(cmdConfig, callback) {
    _cmdConfig = _cmdConfig;
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