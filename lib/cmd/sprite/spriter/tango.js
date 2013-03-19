
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

var _source, _target, _callback, spriteList, cssFiles, cssFilesMap, spriteRoot;
var _options = {},
    imageType = 'png,jpeg,jpg,gif',
    cssType = 'css',
    imageReplaces = {};

var ignoreNetworkRegexp = /^(https?|ftp):\/\//i;
var imageRegexp = /\(['"]?(.+\.(png|jpg|jpeg|gif))(\?.*?)?['"]?\)/i;
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
    _source = util.formatSourceFileType(_source, cssType);
    var ifError = false;
    cssFilesMap = file.getFilesSourceTargetMap(_source, _target);
    cssFiles = cssFilesMap.files;
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
    
    // 扫描所有含background-image规则
    // 将图片进行分类合并
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
            // 
            var imagesList = file.expandFiles(util.formatSourceFileType(item, imageType));
            if(!imagesList.length){
                callback();
                return ;
            }

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
                src: imagesList,
                algorithm: 'packing'
            };
            
            if(_.endsWith(item, '-n/')){
                // TODO
                // copy files to
                callback();
                return;
            }else if(_.endsWith(item, '-x/')){
                // repeat-x, sprite images width must equal in same -x sprite folder
                config.algorithm = 'top-down-width';
            }else if(_.endsWith(item, '-y/')){
                // repeat-y, sprite images height must equal in same -y sprite folder
                config.algorithm = 'left-rigth-height';
            }
            spriteRoot = _target;
            var spriteUrl = path.join(spriteRoot, _options.imgRoot , _options.prefix + path.basename(item, '/') + '.png');
            spritesmith(config, function(err, result){
                if(err){
                    logger.error(err);
                    return callback(err);
                }else{
                    file.write(spriteUrl, result.image, {
                        encoding: 'binary'
                    });
                    var tmpResult = result.coordinates;
                    for(var key in result.coordinates) {
                        var newKey = path.join(process.cwd(), key);
                        imageReplaces[newKey] = tmpResult[key];
                        imageReplaces[newKey].sprite = path.join(process.cwd(), spriteUrl);
                    }
                    callback();
                }
            });

        };
        return seriesTaskFunc;

    });

    async.parallel(seriesTaskQueue, function(err, results){
        // 替换css
        replaceCss();

        _callback();
    });

};

function mergeSplitBackground(splitBackground, splits){
    _.each(splits, function(value, key){
        splitBackground[key] = value;
    });
};

function getImageUrl(backgroundImage){
    var m = backgroundImage.match(imageRegexp);
    if(m){
        return m[1];
    }
    return null;
};

function findProperty(declarations, property){
    return _.find(declarations, function(declaration){
        return declaration.property == property;
    });
};

function updateRulesBackground(rules, from, to){

    var imageUrlRelative = path.dirname(from),
        newImageUrlRelative = path.dirname(to);

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
                return visit(rule.keyframes, backgroundsRules, extra);
            }

            console.log(rule.selectors || rule.values); // values for keyframes

            // 空css样式
            if(!rule.declarations){
                return ;
            }

            var splitBackground = {};
            rule.declarations.forEach(function(declaration) {
                var property = declaration.property,
                    value = declaration.value;
                    
                // console.log(property);

                if(property.indexOf('background-') == 0){
                    splitBackground[property] = value;
                }

                // 采用简写，将background拆分
                if(property == 'background' || property == 'background-image'){

                    if(property == 'background'){
                        var bgs = background.analyse(value);
                        mergeSplitBackground(splitBackground, bgs);
                    }

                    // var bgImgs = splitBackground['background-image'];
                    // if(bgImgs){
                    //     var newBgImgs = [], bgPositions = [], bgPosition, newBgImg;
                    //     _.each(bgImgs.split(','), function(bgImg){
                    //         var imageUrl = getImageUrl(bgImg);
                    //         var absImageUrl = path.resolve(process.cwd(), imageUrlRelative, imageUrl);
                    //         var coordinate = imageReplaces[absImageUrl];
                    //         var newImageUrl = path.relative(newImageUrlRelative, coordinate.sprite);
                    //         newImageUrl = newImageUrl.replace(/\\/g, '/');
                    //         bgImg = bgImg.replace(imageUrl, newImageUrl);
                    //         declaration.value = declaration.value.replace(imageUrl, newImageUrl);
                    //         bgPositions.push('-' + coordinate.x + 'px, -' + coordinate.y + 'px');
                    //         newBgImgs.push(bgImg);
                    //     });
                    //     // push backgournd-posiotion
                    //     bgPosition = bgPositions.join(',');
                    //     newBgImg = newBgImgs.join(',');
                    //     rule.declarations.push({
                    //         property: 'background-position',
                    //         value: bgPosition + ';'
                    //     });
                    //     splitBackground['background-image'] = newBgImg;
                    //     splitBackground['background-position'] = bgPosition;
                    // }
                }

            });

            // backgroundsRules.push({
            //     rule: rule,
            //     extra: extra,
            //     splitBackground: splitBackground
            // });

            console.log(splitBackground);
        });
        // console.log('backgrounds');
        // console.log(backgroundsRules);
        return backgroundsRules;
    };

    return visit(rules, []);
}


function mergeRulesBackground(rules){

}

function replaceCss(){

    // cssFiles.forEach(function(cssFile){
        // readCss
        // var str = file.read(cssFile);
        var cssFile = '../nopo-test3/css/test.cssjk';
        var toFile = cssFilesMap[cssFile];
        var str = file.read(cssFile);

        // try{
            // ast.stylesheet.rules[0].selectors|declarations[0].property|value
            var ast = css.parse(str);
            // console.log(ast.stylesheet.rules[0].keyframes)
        // }catch(e){
        //     console.log(e)
        //     logger.error('sprite error: parse css error!');
        //     return;
        // }

        // updateRulesBackground
        var rules = updateRulesBackground(ast.stylesheet.rules, cssFile, toFile);
        // mergeRulesBackground
        if(_options.mergeBackground){
            // mergeBackground(rules);
        }
        // saveCss
        str = css.stringify(ast);
        // cssPath
        // file.write(toFile, str);
    // });
    
};

