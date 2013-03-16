
var nopo = require('../../../core'),
    _ = nopo.util._,
    file = nopo.file,
    logger = nopo.logger,
    util = nopo.util,
    config = nopo.config,
    template = nopo.template,
    path = require('path'),
    fs = require('fs'),
    async = require('async');

var _source, _target, _callback, engine, spriteList;
var _options = {},
    imageType = 'png,jpeg,jpg,gif';

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
        imgRoot: './'
    };
    
    _.extend(_options, options);
    _.extend(_options, opt);   
};

exports.process = function(){
    // check css
    var ifError = false;
    _source = util.formatSourceFileType(_source, 'css');
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
    console.log(folderLevelOne)
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
                // copy images to target dir
                callback();
                return;
            }else if(_.endsWith(item, '-x/')){
                // repeat-x, sprite images width must equal in same -x sprite folder
                config.algorithm = 'top-down-width';
            }else if(_.endsWith(item, '-y/')){
                // repeat-y, sprite images height must equal in same -y sprite folder
                config.algorithm = 'left-rigth-height';
            }else if(_.endsWith(item, '-xy/')){
                // need xy space sprite
                config.algorithm = 'alt-diagonal';
            }else if(_.endsWith(item, '-png8/')){
                // todo
                callback();
                return;
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

function replaceCss(){

};

