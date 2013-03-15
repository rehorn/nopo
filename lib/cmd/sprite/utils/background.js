// thanks to 
// url(../images/app_icon.png) white no-repeat 10px 50% border-box content-box fixed
// https://github.com/sliuqin/peaches/blob/master/lib/pom/splitBackground.js
// https://github.com/iazrael/ispriter/blob/master/src/BackgroundInterpreter.js

function Backgound(stylesheet) {
    'use strict';
    if (!(this instanceof Backgound)) {
        return new Backgound(stylesheet);
    }
    this.stylesheet = stylesheet;
    return this._init();
}

Backgound.prototype = {
    MATCH_ACTION: [{
        //background-image
        regexp: /\b(url\(['"]?([^\)\'\"]+)['"]?\))/i,
        exec: function(rule, match) {
            'use strict';
            var declaration = {
                property: 'background-image',
                // 统一使用 url(xx.png)这种形式，去掉引号。
                value: 'url(' + match[2] + ')'
            };
            rule.setDeclaration(declaration);
        }
    }, {
        //background-repeat
        regexp: /((no-repeat)|(repeat-x)|(repeat-y)|(repeat))/i,
        exec: function(rule, match) {
            'use strict';
            var declaration = {
                property: 'background-repeat',
                value: match[1]
            };
            rule.setDeclaration(declaration);
        }
    }, {
        //background-attachment 属性设置背景图像是否固定或者随着页面的其余部分滚动。
        regexp: /\b(fixed|scroll)\b/i,
        exec: function(rule, match) {
            'use strict';
            var declaration = {
                property: 'background-attachment',
                value: match[1]
            };
            rule.setDeclaration(declaration);
        }
    }, {
        //background-clip 用来判断 background 是否包含 border 区域。
        //而 background-origin 用来决定 background-position 计算的参考位置。
        //使用简写的时候 origin 是比 clip 优先的
        regexp: /(\b(border|padding|content)-box)\b/i,
        exec: function(rule, match) {
            'use strict';
            var declaration = {
                property: 'background-origin',
                value: match[1]
            };
            rule.setDeclaration(declaration);
        }
    }, {
        //background-clip
        regexp: /(\b(border|padding|content)-box)\b/i,
        exec: function(rule, match) {
            'use strict';
            var declaration = {
                property: 'background-clip',
                value: match[1]
            };
            rule.setDeclaration(declaration);
        }
    }, {
        //background-color: #fff
        regexp: /(^#([0-9a-f]{3}|[0-9a-f]{6})\b)/i,
        exec: function(rule, match) {
            'use strict';
            var declaration = {
                property: 'background-color',
                value: match[1]
            };
            rule.setDeclaration(declaration);
        }
    }, {
        //background-color: rgb()
        regexp: /rgb\((\s*(1[0-9]{2}|2[0-4][0-9]|25[0-5]|[1-9][0-9]|[0-9])\s*,){2}\s*(1[0-9]{2}|2[0-4][0-9]|25[0-5]|[1-9][0-9]|[0-9])\s*\)/i,
        exec: function(rule, match) {
            var declaration = {
                property: 'background-color',
                value: match[0]
            };
            rule.setDeclaration(declaration);
        }
    }, {
        //background-color: rgba()
        regexp: /(\brgba\((\s*(1[0-9]{2}|2[0-4][0-9]|25[0-5]|[1-9][0-9]|[0-9])\s*,){3}\s*(0?\.[0-9]+|[01])\s*\))/i,
        exec: function(rule, match) {
            var declaration = {
                property: 'background-color',
                value: match[0]
            };
            rule.setDeclaration(declaration);
        }
    }, {
        //background-color: color-name
        //W3C 的 HTML 4.0 标准仅支持 16 种颜色名, 加上 orange + transparent 一共 18 种
        regexp: /\b(aqua|black|blue|fuchsia|gray|green|lime|maroon|navy|olive|purple|red|silver|teal|white|yellow|orange|transparent)\b/i,
        exec: function(rule, match) {
            var declaration = {
                property: 'background-color',
                value: match[0]
            };
            rule.setDeclaration(declaration);
        }
    }, {
        //background-position
        //两个值都设定的情况.
        regexp: /((-?\d+(%|in|cm|mm|em|ex|pt|pc|px))|0|center|left|right)\s+((-?\d+(%|in|cm|mm|em|ex|pt|pc|px))|0|center|top|bottom)/i,
        exec: function(rule, match) {
            Split.prototype._updatePositionAction(rule, match[0]);
        }
    }, {
        //background-position
        //设定单个值的情况. 浏览器会默认设置第二个值 50%,这里不推荐这样写.
        // 由于rgb中会含有0，等字符，所以这里将 position 放到最后面匹配
        regexp: /\b((-?\d+(%|in|cm|mm|em|ex|pt|pc|px))|0|center|left|right)\b/,
        exec: function(rule, match) {
            //position值为left时处理成0
            if (match[0] === 'left') {
                match[0] = '0';
            }
            var declaration = {
                property: 'background-position',
                value: match[0] + ' 50%'
            };
            rule.setDeclaration(declaration);
        }
    }],
    _init: function() {
        this.split();
        this.updatePosition();
        return this.stylesheet;
    },
    _updatePositionAction: function(rule, value) {
        var cur = value.split(/\s+/);
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
        var declaration = {
            property: 'background-position',
            value: cur.join(' ')
        };
        rule.setDeclaration(declaration);
    },
    updatePosition: function() {
        var self = this;
        this.stylesheet.rules.forEach(function(rule, idx) {
            //  如果不是一个普通的样式定义 rule
            if (!rule.getDeclarationValue) {
                return;
            }
            var value = rule.getDeclarationValue('background-position');
            if (value.length === 1) {
                self._updatePositionAction(rule, value[0]);
            }
        });
    },
    split: function() {
        var self = this;
        this.stylesheet.rules.forEach(function(rule, idx) {
            var rules = self.splitAtRule(rule) || self.splitRule(rule);
        });
    },
    splitRule: function(rule) {
        if (!rule.selectors) {
            return;
        }

        var backgrounds = rule.getDeclarationValue('background');
        if (backgrounds.length !== 1) {
            return;
        }
        var self = this;
        //TODO: 处理多个背景
        var background = backgrounds[0],
            match, matched = false;
        this.MATCH_ACTION.forEach(function(action) {
            match = background.match(action.regexp);
            if (match) {
                // 引用值rule，发生变更。
                action.exec.call(self, rule, match, action.regexp);
                //移除已经匹配到的属性；
                background = background.replace(action.regexp, '');
                matched = true;
            }
        });
        if (matched) {
            rule.removeDeclaration('background');
        }
    }
};
module.exports = Split;
