/**
 * THANKS TO
 * https://github.com/iazrael/ispriter/blob/master/src/BackgroundInterpreter.js
 * https://github.com/sliuqin/peaches/blob/master/lib/pom/splitBackground.js
 */

//url(../images/app_icon.png) white no-repeat 10px 50% border-box content-box fixed
(function(){

    var MATCH_ACTION = [
    {
        //background-image
        regexp: /\b(url\([^\)]+\))/i,
        exec: function(style, match){
            updateProperty(style, 'background-image', match[1]);
        }
    },{
        //background-repeat
        regexp: /((no-repeat)|(repeat-x)|(repeat-y)|(repeat))/i,
        exec: function(style, match){
            updateProperty(style, 'background-repeat', match[1]);
        }
    },{
        //background-attachment
        regexp: /\b(fixed|scroll)\b/i,
        exec: function(style, match){
            updateProperty(style, 'background-attachment', match[1]);
        }
    },{
        //background-origin, background-clip
        //使用简写的时候 origin 是比 clip 优先的
        regexp: /(\b(border|padding|content)-box)/i,
        exec: function(style, match){
            updateProperty(style, 'background-origin', match[1]);
        }
    },{
        //background-clip
        regexp: /(\b(border|padding|content)-box)/i,
        exec: function(style, match){
            updateProperty(style, 'background-clip', match[1]);
        }
    },{
        //background-position
        //两个值都设定的情况.
        regexp: /((-?\d+(%|in|cm|mm|em|ex|pt|pc|px))|0|center|left|right)\s+((-?\d+(%|in|cm|mm|em|ex|pt|pc|px))|0|center|top|bottom)/i,
        exec: function (style, match) {
            var cur = match[0].split(/\s+/);
            if (cur[0] === 'left') {
                cur[0] = '0';
            }
            if (cur[0] === '100%') {
                cur[0] = 'right';
            }
            if (cur[1] === 'top') {
                cur[1] = '0';
            }
            if (cur[1] === '100%') {
                cur[1] = 'bottom';
            }
            updateProperty(style, 'background-position', cur.join(' '));
        }
    },{
        //background-position
        //设定单个值的情况. 浏览器会默认设置第二个值 center,这里不推荐这样写.
        // 由于rgb中会含有0，等字符，所以这里将 position 放到最后面匹配
        regexp: /\b((-?\d+(%|in|cm|mm|em|ex|pt|pc|px))|0|center|left|right)\b/,
        exec: function (rule, match) {
            //position值为left时处理成0
            if (match[0] === 'left') {
                match[0] = '0';
            }
            updateProperty(style, 'background-position', match[0] + ' center');
        }
    },{
        //background-color: #fff
        regexp: /(^#([0-9a-f]{3}|[0-9a-f]{6})\b)/i,
        exec: function(style, match){
            updateProperty(style, 'background-color', match[1]);
        }
    },{
        //background-color: rgb()
        regexp: /(\brgb\(\s*(1[0-9]{2}|2[0-4][0-9]|25[0-5]|[1-9][0-9]|[0-9])\s*(,\s*(1[0-9]{2}|2[0-4][0-9]|25[0-5]|[1-9][0-9]|[0-9])\s*){2}\))/i,
        exec: function(style, match){
            updateProperty(style, 'background-color', match[1]);
        }
    },{
        //background-color: rgba()
        regexp: /(\brgba\((\s*(1[0-9]{2}|2[0-4][0-9]|25[0-5]|[1-9][0-9]|[0-9])\s*,){3}\s*(0?\.[0-9]+|[01])\s*\))/i,
        exec: function(style, match){
            updateProperty(style, 'background-color', match[1]);
        }
    },{
        //background-color: color-name
        //W3C 的 HTML 4.0 标准仅支持 16 种颜色名, 加上 orange + transparent 一共 18 种 
        regexp: /\b(aqua|black|blue|fuchsia|gray|green|lime|maroon|navy|olive|purple|red|silver|teal|white|yellow|orange|transparent)\b/i,
        exec: function(style, match){
            updateProperty(style, 'background-color', match[1]);
        }
    }
    ];

    function updateProperty(style, property, value){
        style = style || {};
        // 处理多背景情况
        style[property] = style[property] ? style[property] + ',' + value : value;
    };

    var analyse = function(value){
        //处理多 background 简写的情况
        var values = value.split(',');
        var style = {},
            match;
        for (var i = 0; i < values.length; i++) {
            value = values[i].trim();
            for(var j = 0, action; (action = MATCH_ACTION[j]) && value; j++) {
                match = value.match(action.regexp);
                if(match){
                    action.exec(style, match);
                    value = value.replace(match[0], '').trim();
                }
            };
        };
        
        return style;
    }

    exports.analyse = analyse;

})();