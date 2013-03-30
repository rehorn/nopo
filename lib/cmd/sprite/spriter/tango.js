
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
var repeatXYFolderRegexp = /(-x|-y)\//i;

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
    _source = util.formatFileType(_source, cssType);
    var ifError = false;
    cssFilesMap = file.getFileIOMaps(_source, _target);
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
    imagesFiles = file.expandFiles(util.formatFileType(_options.imgRoot, imageType));
    if(imagesFiles.length <= 0){
        logger.warn('sprite error: no images to sprite');
        ifError = true;
    }
    if(ifError){
        _callback();
        return;
    }
    
    async.series([
        function(callback){
            // 生成sprite图片
            saveSprite(callback);
        },
        function(callback){
            // 替换css
            replaceCss(callback);
        }
    ],
    function(err, results){
        _callback();
    });

};

function saveSprite(cb){
    // 扫描所有一级目录，按照分类进行sprite
    var folderLevelOne = file.expandDirs(_options.imgRoot + '*/');
    // 将imgRoot根目录下的文件合并为一张
    folderLevelOne.push(_options.imgRoot);
    // console.log(folderLevelOne)
    var seriesTaskQueue = _.map(folderLevelOne, function(item){
        
        var seriesTaskFunc = function(callback){
            var isRoot = (item == _options.imgRoot) ? 1 : 0;
            var recursive = !isRoot;
            var imagesList = file.expandFiles(util.formatFileType(item, imageType, recursive));
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
            var name = isRoot ? 'root' : path.basename(item, '/');
            var spriteUrl = path.join(spriteRoot, _options.imgRoot , _options.prefix + name + '.png');
            logger.log('generate sprite [ ' + spriteUrl.grey + ' ] using layout ' + config.algorithm.cyan);
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
        cb();
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

function getSpiltBackgroundProperty(splitBackground, property, idx){
    var defaultValue = '0 0';
    switch(property){
        case 'background-position':
            defaultValue = '0 0';
            break;
        case 'background-repeat':
            defaultValue = 'no-repeat';
            break;
        default:

    }
    return splitBackground[property] ? 
            (!_.isUndefined(splitBackground[property].split(',')[idx]) ? splitBackground[property].split(',')[idx].trim() : defaultValue)
            : defaultValue;
};

function mergeBackgroundRule(rule, splitBackground){
    // Assemble in syntax order (https://developer.mozilla.org/en-US/docs/CSS/background#Syntax)
    var order = ['background-color', 'background-image', 'background-position', 
            'background-size', 'background-repeat', 'background-attachment', 'background-clip'];

    if(splitBackground['background-image'] && splitBackground['background-position']){
        var declarations = rule.declarations.filter(function(declaration) {
            if (declaration.property.indexOf('background') === 0) {
                return false;
            }
            return true;
        });

        var values = Object.keys(splitBackground).sort(function(a, b) {
            return order.indexOf(a) - order.indexOf(b);
        }).map(function(key){
            return splitBackground[key];
        });
        // console.log(values);

        var bgImgs = splitBackground['background-image'].split(',');
        var backgrounds = [];
        _.each(bgImgs, function(bgImg, idx){
            var splits = [];
            _.each(values, function(value){
                splits.push(value.split(',')[idx]);
            });
            backgrounds.push(splits.join(' '));
        });

        var declaration = {
            property: 'background',
            value: backgrounds.join(', ') + ';'
        };

        rule.declarations = declarations.concat(declaration);
    }

    return rule;
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

            // console.log(rule.selectors || rule.values); // values for keyframes

            // 空css样式
            if(!rule.declarations){
                return ;
            }

            var splitBackground = {}, waterMark;
            rule.declarations.forEach(function(declaration){
                var property = declaration.property,
                    value = declaration.value;
                if(property.indexOf('background-') === 0){
                    splitBackground[property] = value;
                }
                if(property == 'background'){
                    mergeSplitBackground(splitBackground, background.analyse(value));
                }
                if(property == 'background' || property == 'background-image'){
                    waterMark = property;
                }
            });

            rule.declarations.filter(function(declaration){
                var property = declaration.property;
                if(property == waterMark){
                    return true;
                }
                return false;
            }).forEach(function(declaration) {
                var property = declaration.property,
                    value = declaration.value;
               
                var bgImgs = value;
                // 采用简写，将background拆分
                if(property == 'background'){
                    var bgs = background.analyse(value);
                    bgImgs = bgs['background-image'];
                }

                if(bgImgs){

                    var isReplaced = false,
                        isPosUpdated = false,
                        newBgImgs = [],
                        newBgPositions = [], 
                        newBgPosition, 
                        newBgImg,
                        imageUrl, 
                        absImageUrl, 
                        coordinate, 
                        newImageUrl;

                    _.each(bgImgs.split(','), function(bgImg, idx){
                        imageUrl = getImageUrl(bgImg);
                        absImageUrl = path.resolve(process.cwd(), imageUrlRelative, imageUrl);
                        coordinate = imageReplaces[absImageUrl];

                        var pos = getSpiltBackgroundProperty(splitBackground, 'background-position', idx),
                            repeat = getSpiltBackgroundProperty(splitBackground, 'background-repeat', idx);

                        // 跳过特殊网址: 远程网址 || 图片不存在 || 图片不在imgRoot下
                        // 只进行复制：使用center/right/left定位 || 使用repeat || 使用 repeat-x|-y，并且切图不在-x,-y文件夹下
                        // 只进行复制：图片不在sprite切图列表中 
                        if(ignoreNetworkRegexp.test(imageUrl) || 
                            !file.exists(absImageUrl)){

                            newBgPositions.push(pos);
                            newBgImgs.push(bgImg);

                        }else if(!coordinate || 
                            ignorePositionRegexp.test(pos) ||
                            ignoreRepeatRegexp.test(repeat) ||
                            (repeatXYRegexp.test(repeat) && repeatXYFolderRegexp.test(imageUrl))
                        ){

                            isReplaced = true;

                            var filename = path.basename(absImageUrl);
                            var target = path.join(spriteRoot, _options.imgRoot, filename);
                            file.copy(absImageUrl, target);

                            newImageUrl = path.relative(newImageUrlRelative, target);
                            newImageUrl = newImageUrl.replace(/\\/g, '/');
                            bgImg = bgImg.replace(imageUrl, newImageUrl);
                            declaration.value = declaration.value.replace(imageUrl, newImageUrl);
                            newBgImgs.push(bgImg);

                        }else{

                            isReplaced = true;
                            isPosUpdated = true;
                            newImageUrl = path.relative(newImageUrlRelative, coordinate.sprite);
                            newImageUrl = newImageUrl.replace(/\\/g, '/');
                            bgImg = bgImg.replace(imageUrl, newImageUrl);
                            declaration.value = declaration.value.replace(imageUrl, newImageUrl);
                            pos = pos.split(/\s+/);
                            pos[0] = parseInt(pos[0]) - coordinate.x;
                            pos[1] = parseInt(pos[1]) - coordinate.y;
                            newBgPositions.push((pos[0] ? pos[0] + 'px' : 0) + ' ' + (pos[1] ? pos[1] + 'px' : 0));
                            newBgImgs.push(bgImg);
                        }
                    });
                    
                    // 替换
                    if(isReplaced){
                        // push background-position
                        newBgPosition = newBgPositions.join(',');
                        newBgImg = newBgImgs.join(',');
                        splitBackground['background-image'] = newBgImg;
                        // console.log(declaration.value)

                        if(isPosUpdated){
                            var declarations = rule.declarations.filter(function(declaration){
                                if(declaration.property == 'background-position'){
                                    return false;
                                }
                                return true;
                            });
                            declarations.push({
                                property: 'background-position',
                                value: newBgPosition
                            });
                            rule.declarations = declarations;
                            splitBackground['background-position'] = newBgPosition;
                        }
                    }
                }

            });
            // console.log(splitBackground);
            if(_options.mergeBackground){
                rule = mergeBackgroundRule(rule, splitBackground);
            }
        });
        // console.log('backgrounds');
        // console.log(backgroundsRules);
        // return backgroundsRules;
    };

    return visit(rules, []);
}

function replaceCss(cb){

    cssFiles.forEach(function(cssFile){
        // readCss
        // var str = file.read(cssFile);
        // var cssFile = '../nopo-test3/css/test.cssjk';
        var toFile = cssFilesMap.filesMap[cssFile];
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
        // saveCss
        str = css.stringify(ast);
        // cssPath
        file.write(toFile, str);
        logger.log('replace css background [ ' + toFile.grey + ' ]');
    });

    cb();
};

