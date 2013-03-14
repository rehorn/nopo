

var _source, _target, _callback, _options, engine, spriteList, css;
exports.init = function(source, target, opt, callback){

    _source = source;
    _target = target;
    _callback = callback;

    // sprite 特有配置项
    var options = {
        layout: 'packing', // packing, vertical, horizontal, vertical-right, horizontal-bottom
        order: 'maxSide', // 'maxSide', 'width', 'height', 'area'
        imgRoot: ''
    };
    
    _.extend(_options, options);
    _.extend(_options, opt);   
};

exports.process = function(){
    // 载入图片，根据图片类别初始化
    exports.loadImages();
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

