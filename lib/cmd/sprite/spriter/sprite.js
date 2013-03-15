
var nopo = require('../../../core'),
    _ = nopo.util._,
    file = nopo.file,
    logger = nopo.logger,
    util = nopo.util,
    config = nopo.config,
    template = nopo.template,
    path = require('path'),
    fs = require('fs');

var _source, _target, _callback, engine, spriteList;
var _options = {};

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
        imgRoot: ''
    };
    
    _.extend(_options, options);
    _.extend(_options, opt);   
};

exports.process = function(){
    
    // 生成sprite图片
    exports.saveSprite();
    // 替换css
    exports.replaceCss();

};

exports.loadImages = function(){
    
};

exports.saveSprite = function(){

};

exports.replaceCss = function(){

};

