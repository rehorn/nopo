
// var glob = require('glob');

// glob('/Server/', {}, function(er, files){
//     console.log(files);
// });


var css = require('css'),
    fs = require('fs'),
    path = require('path'),
    // mkdirp = require('mkdirp').sync,
    // Canvas = require('canvas'),
    // Packer = require('./packer');

exports = module.exports = spriter;

var urlPattern = /url\(['"]?((?:[^'"@)]+)(@[^\.]+)?[^'"]*)['"]?\)/;
var retinaQuery = '(-webkit-min-device-pixel-ratio: 1.5)';
var positionPattern = /\s*(?:no\-repeat|(\d+)(?:px)?\s+(\d+)(?:px)?)/g;
var retinaPattern = /(@\w+)\./;

var findBackgrounds = function(rules, filter) {
    var visit = function(rules, backgrounds, media) {
        rules.forEach(function(rule) {
            if (rule.media) return visit(rule.rules, backgrounds, rule.media);

            rule.declarations && rule.declarations.forEach(function(declaration) {
                if ((declaration.property == 'background' || declaration.property == 'background-image')) {
                    var matches = urlPattern.exec(declaration.value);

                    if (matches) {
                        var url = matches[1];

                        if (!filter || ~url.indexOf(filter)) {
                            backgrounds.push({
                                rule: rule,
                                declaration: declaration,
                                url: url,
                                media: media
                            });
                        }
                    }
                }
            });
        });

        return backgrounds;
    };

    return visit(rules, []);
};


function spriter(str, sourcePath, targetPath, filter, optimize) {
    var str = fs.readFileSync('./test/nopo-test3/test.css');
    var ast = css.parse(str);

    var backgrounds = findBackgrounds(ast.stylesheet.rules, filter);
    console.log(backgrounds);
    // var groups = groupBackgrounds(backgrounds, path.basename(targetPath, '.png'));
    // var sheets = createSpriteSheets(groups, sourcePath, path.dirname(targetPath));
    // var rules = updateRules(sheets);

    // if (optimize) optimizeRules(rules);

    console.log(css.stringify(ast));
}