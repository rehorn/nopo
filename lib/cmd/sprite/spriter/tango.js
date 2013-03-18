
var nopo = require('../../../core'),
    _ = nopo.util._,
    file = nopo.file,
    logger = nopo.logger,
    util = nopo.util,
    config = nopo.config,
    template = nopo.template,
    css = require('css'),
    path = require('path'),
    fs = require('fs'),
    async = require('async');

var background = require('../utils/background');

var _source, _target, _callback, engine, spriteList, cssFiles;
var _options = {},
    imageType = 'png,jpeg,jpg,gif',
    cssType = 'css';

var ignoreNetworkRegexp = /^(https?|ftp):\/\//i;
var imageRegexp = /\(['"]?(.+\.(png|jpg|jpeg))(\?.*?)?['"]?\)/i;
var ignorePositionRegexp = /right|center|bottom/i;
var ignoreRepeatRegexp = /^(repeat)$/i;
var repeatXYRegexp = /^(repeat-x|repeat-y)$/i;

var spritesmith = require('spritesmith');
spritesmith.Layout.addAlgorithm('packing', require('../layout/grow-packing.js'));
spritesmith.Layout.addAlgorithm('top-down-width', require('../layout/top-down-width.js'));
spritesmith.Layout.addAlgorithm('left-rigth-height', require('../layout/left-right-height.js'));

exports.init = function(source, target, opt, callback){

    _source = source;
    _target = target;
    _callback = callback;

    // sprite 特有配置项
    var options = {
        layout: 'packing', // packing, top-down, top-down-width, left-right,left-right-height, diagonal \, alt-diagonal /
        imgRoot: './',
        fixIe6: 0,
        mergeBackground: 1
    };
    
    _.extend(_options, options);
    _.extend(_options, opt);   
};

exports.process = function(){
    // check css
    var ifError = false;
    _source = util.formatSourceFileType(_source, cssType);
    cssFiles = file.expandFiles(_source);
    if(cssFiles.length <= 0){
        logger.warn('sprite error: no css files');
        ifError = true;
    }
    // check imgRoot
    if(util.detectDestType(_options.imgRoot) == 'file'){
        logger.warn('sprite error: imgRoot must be a folder');
        ifError = true;
    }
    // check images
    imagesFiles = file.expandFiles(util.formatSourceFileType(_options.imgRoot, imageType));
    if(imagesFiles.length <= 0){
        logger.warn('sprite error: no images to sprite');
        ifError = true;
    }
    if(ifError){
        _callback();
        return;
    }
    
    // 生成sprite图片
    saveSprite();

    // _callback();
};

function saveSprite(){
    // TODO: 将imgRoot根目录下的文件合并为一张
    // 扫描所有一级目录，按照分类进行sprite
    var folderLevelOne = file.expandDirs(_options.imgRoot + '*/');
    // console.log(folderLevelOne)
    var seriesTaskQueue = _.map(folderLevelOne, function(item){
        
        var seriesTaskFunc = function(callback){
            // 'src': []
            // 'algorithm': 'alt-diagonal',
            // // OPTIONAL: Rendering engine: auto, canvas, gm
            // 'engine': 'gm',
            // // OPTIONAL: Preferences for resulting image
            // 'exportOpts': {
            //     // Image formst (buy default will try to use dest extension)
            //     'format': 'png',
            //     // Quality of image (gm only)
            //     'quality': 90
            // }
            var config = {
                src: file.expandFiles(util.formatSourceFileType(item, imageType)),
                algorithm: 'packing'
            };
            var sprite = './sprite'+ new Date().getTime() + '.png' ;

            if(_.endsWith(item, '-n/')){
                // TODO
                // nothing to do
                callback();
                return;
            }else if(_.endsWith(item, '-x/')){
                // repeat-x, sprite images width must equal in same -x sprite folder
                config.algorithm = 'top-down-width';
            }else if(_.endsWith(item, '-y/')){
                // repeat-y, sprite images height must equal in same -y sprite folder
                config.algorithm = 'left-rigth-height';
            }

            spritesmith(config, function(err, result){
                if(err){
                    logger.error(err);
                    return callback(err);
                }else{
                    file.write(sprite, result.image, {
                        encoding: 'binary'
                    });
                    // var tmpResult = result.coordinates;
                    // for(var key in result.coordinates) {
                    //     var newKey = path.join(process.cwd(), key);
                    //     imageReplaces[newKey] = tmpResult[key];
                    //     imageReplaces[newKey].sprite = path.join(process.cwd(), sprite);
                    // }
                    callback();
                }
            });

        };
        return seriesTaskFunc;

    });

    async.parallel(seriesTaskQueue, function(err, results){
        _callback();
    });

    // 替换css
    replaceCss();
};

function getCssProperty(declaration, property){
    return _.find(declaration, function(declaration){
        return declaration.property == property;
    });
};

function findBackgroundRules(rules){

    var visit = function(rules, backgroundsRules, extra) {
        rules.forEach(function(rule) {
            if(rule.media){
                var extra = {
                    media: rule.media
                };
                return visit(rule.rules, backgroundsRules, extra);
            }
            if(rule.keyframes){
                var extra = {
                    keyframes: rule.name 
                };
                return visit(rule.rules, backgroundsRules, extra);
            }

            console.log(rule.selectors);
            var splitBackgrounds = [];
            rule.declarations && rule.declarations.forEach(function(declaration) {
                console.log(declaration.property);

                // background-size 不能使用简写, 提前判断并跳过
                if(declaration.property == 'background-size'){
                    return;
                }

                // 采用简写，将background拆分
                if(declaration.property == 'background'){
                    splitBackgrounds.concat(background.analyse(declaration.value));

                }

                if(declaration.property == 'background-image'){
                    // 处理多背景情况
                    var bgImgs = declaration.value.split(',');
                    var bgRepeat = getCssProperty(declaration, 'background-repeat');
                    var bgRepeats = bgRepeats && bgRepeats.split(',') || [];
                    var bgPostion = getCssProperty(declaration, 'background-position');
                    var bgPostions = bgPostion && bgPostion.split(',') || [];
                    
                    _.each(bgImgs, function(bgImg, idx){
                        splitBackgrounds.push({
                            'background-image': bgImg,
                            'background-repeat': bgRepeats[idx] || 'no-repeat',
                            'background-position': bgPostions[idx] || '0 0'
                        });
                    });
                    
                }

                // 过滤不需要合并的background，只做copy操作和替换rule url地址
                // background-position是 right center bottom 的图片不合并
                // background-repeat是repeat
                // background-repeat是repeat-x或repeat-y并且图片没有在合并切图地址map列表中
                // background-image 是url是远程地址
                // background-image 是url是远程地址
                // background-image 引用的图片不在imgRoot目录下
                // _.filter(splitBackgrounds, function(splitBackground){
                //     ignorePositionRegexp.test(splitBackground['background-position'])
                //     ignoreRepeatRegexp.test(splitBackground['background-repeat'])
                //     repeatXYRegexp.test(splitBackground['background-repeat'])
                //     ignoreNetworkRegexp.test(splitBackground['background-image'])
                //     ignorePositionRegexp.test(splitBackground['background-position'])
                // });

            });

            backgroundsRules.push({
                rule: rule,
                extra: extra,
                splitBackgrounds: splitBackgrounds
            });

            console.log(splitBackgrounds);
        });
        // console.log('backgrounds');
        // console.log(backgroundsRules);
        return backgroundsRules;
    };

    return visit(rules, []);
}

function updateRulesBackground(rules){

}

function mergeRulesBackground(rules){

}

function replaceCss(){

    // cssFiles.forEach(function(cssFile){
        // readCss
        // var str = file.read(cssFile);
        var str = file.read('test.css');

        // try{
            // ast.stylesheet.rules[0].selectors|declarations[0].property|value
            var ast = css.parse(str);
        // }catch(e){
        //     console.log(e)
        //     logger.error('sprite error: parse css error!');
        //     return;
        // }

        // findBackgroundRules
        var backgrounds = findBackgroundRules(ast.stylesheet.rules);
        // updateRulesBackground
        var rules = updateRulesBackground(backgrounds);
        // optimizeRulesBackground
        if (_options.mergeBackground) mergeRulesBackground(rules);
        // saveCss
        str = css.stringify(ast);
        // cssPath
        // file.write
    // });
    
};

