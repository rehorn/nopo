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
var stylesheetTemplate = '<link type="text/css" rel="stylesheet" href="@@dest" media="all">';
var inlineStylesheetTemplate = '<style>@@content\r\n</style>';

var scriptSrcRegx = /\<script.*src=\"(.*)\".*\>\<\/script\>/;
var cssHrefRegx = /\<link.*rel=\"stylesheet\".*href=\"(.*)\"[$|\s+.*\"].*\>/;

var defaultJsDest = 'js/all.js';
var defaultCssDest = 'css/main.css';
var defaultTmplDest = 'js/tmpl.compiled.js';

var buildCommand = {
    noop: function(options){
        return '';
    },
    js: function(options){
        var block = options.block,
            // 路径为空则使用默认值，todo:默认覆盖问题，dest建议书写
            dest = block.cmd.dest || defaultJsDest,
            stamp = block.cmd.stamp || '';

        // 格式化 pathInfo
        var urlSource = getBlockUrls(block, 'js');
        // 复制 js
        var target = path.join(_cmdConfig.target, dest);
        var content = getContents(urlSource);
        file.write(target, content);
        logger.log('concat js done.');
        // 匹配缩进空格
        var indent = (block.raw[0].match(/^\s*/) || [])[0];
        return indent + scriptTemplate.replace('@@dest', dest);
    },
    css: function(options){
        var block = options.block,
            lf = options.lf,
            inline = block.cmd.inline;

        // 格式化 pathInfo
        var urlSource = getBlockUrls(block, 'css');
        // 路径为空则使用默认值，todo:默认覆盖问题，dest建议书写
        var dest = block.cmd.dest || defaultCssDest;
        var indent = (block.raw[0].match(/^\s*/) || [])[0];
        // 复制 css
        var target = path.join(_cmdConfig.target, dest);
        var content = getContents(concatOption.source);
        if(inline){
            var lines = content.replace('\r\n', '\n').split('\n').map(function(line){
                return indent + line;
            });
            logger.log('import inline css done.');
            return lines.join(lf);
        }else{
            file.write(target, content);
            logger.log('concat css done.');
            // 匹配缩进空格
            return indent + stylesheetTemplate.replace('@@dest', dest);
        }
    },
    tmpl: function(options){
        // TODO extract html tmpl to js files
    },
    include: function(options){
        var block = options.block,
            lf = options.lf,
            res = _.trim(block.cmd.res);

        if(!_opt[res]){
            logger.log('include error: no res [ ' + res + ' ] config found.');
            return '';
        }

        var indent = (block.raw[0].match(/^\s*/) || [])[0];
        var src = file.normalizeTaskSourceTarget(_opt[res]).source;
        var content = getContents(src);
        var lines = content.replace('\r\n', '\n').split('\n').map(function(line){
            return indent + line;
        });
        logger.log('inline ' + res + ' done.');
        return lines.join(lf);
    },
    remove: function(options){
        return '';
    }
};

function getContents(source){
    var ioMap = file.getFileIOMaps(source);
    var content = _.map(ioMap.files, function(filepath){
        if (!file.exists(filepath)) {
            logger.warn('source file [' + filepath.red + ' ] not found.');
        }
        return file.read(filepath);
    }).join('\n');
    return content;
};

function getBlockUrls(block, type){
    type = type || 'js';
    var urls = [];
    var regx = type == 'js' ? scriptSrcRegx : cssHrefRegx;
    _.each(block.raw, function(line){
        var match = line.match(regx);
        if(match){
            urls.push(match[1].split('?')[0]);
        }
    });
    return urls;
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
    _cmdConfig = cmdConfig;
    var source = cmdConfig.source,
        target = cmdConfig.target;

    var options = {
        // 为js/css增加cdn host随机前缀 qplus[0,1,2...].idqqimg.com
        assetHosts: null
    };
    _.extend(options, cmdConfig.options);
    _opt = options;

    var ioMap = file.getFileIOMaps(source, target);

    ioMap.files.forEach(function(item) {
        var from = item,
            to = ioMap.filesMap[from];

        var html = file.read(from);
        html = htmlRefs(html, from, to);
        file.write(to, html);
    });

};