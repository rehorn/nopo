
var nopo = require('../../core'),
    _ = nopo.util._,
    file = nopo.file,
    logger = nopo.logger,
    util = nopo.util,
    path = require('path'),
    async = require('async'),
    copyCmd = require('../copy'),
    cleanCmd = require('../clean');

var exec = require('child_process').exec;

var platform = require('os').platform();
var prefix = (platform === 'win32') ? 'node ' : '';

function minify(filepath, target, options, callback){
    var command, isClean;
    var tmpFiles = [];
    var ext = path.extname(filepath);
    var cEngine = options.cmap[ext];
    var relative = path.relative(target, filepath);
    var fileOut = path.join(target, relative);
    if(options.suffix){
        fileOut = util.suffix(fileOut, options.suffix);
    }

    // path in === out && engine = gcc
    if(!path.relative(filepath, fileOut) && cEngine == 'gcc'){
        var tmpFile = filepath + '.nt';
        isClean = true;

        var copyOption = {
            source: filepath,
            target: tmpFile
        };

        copyCmd.run(copyOption, util.noop);

        fileOut = filepath;
        filepath = tmpFile;
        tmpFiles.push(tmpFile);
    }

    switch(cEngine){
        case 'yui-css':
            logger.log('yui-css:' + filepath);
            command = 'java -jar -Xss2048k "' + __dirname + '/bin/yuicompressor-2.4.6.jar" "' + filepath + '" -o "' + fileOut + '" --type css ';
            break;
        case 'gcc':
            logger.log('gcc:' + filepath);
            command = 'java -jar "' + __dirname + '/bin/compiler.jar" --js="' + filepath + '" --js_output_file="' + fileOut + '" ';
            break;
        case 'uglifyjs':
            logger.log('uglifyjs:' + filepath);
            command = prefix + '"' + __dirname + '/node_modules/uglify-js/bin/uglifyjs" --output "' + fileOut + '" ' + (options.copyright ? '' : '--no-copyright') + ' "' + filepath + '" ';
            break;
        case 'clean-css':
            logger.log('clean-css:' + filepath);
            command = prefix + '"' + __dirname + '/node_modules/clean-css/bin/cleancss" ' + (options.copyright ? '--s1' : '--s0') + ' -o "' + fileOut + '" "' + filepath + '" ';
            break;
        default:
            command = '';
    }

    exec(command, { maxBuffer: options.buffer }, function (err, stdout, stderr) {
        if (callback) {
            if (err) {
                console.log('compress error!');
                console.log(err);
                callback(err);
            } else {
                callback(null);
            }

            if(isClean){
                _.each(tmpFiles, function(file){
                    var cleanOption = {
                        source: file
                    };
                    cleanCmd.run(cleanOption, util.noop);
                });
            }
        }
    });
};

exports.run = function(cmdConfig, callback) {

    var source = cmdConfig.source,
        target = cmdConfig.target;

    var cmap = {
        '.js': 'uglifyjs', //gcc, uglifyjs
        '.css': 'clean-css', // yui-css, clean-css
        '.html': 'htmlminifier'
    };

    var options = {
        timestamp: false,
        copyright: true,
        suffix: '', // '.min'
        buffer: 1000 * 1024
    };

    _.extend(options, cmdConfig.options);

    // 把自定义的compile engine扩展到option
    options.cmap = _.extend(cmap, options.cmap);

    var srcFiles = file.expandFiles(source);

    var parallelQueue = _.map(srcFiles, function(filepath){
        var parallelFunc = function(cCallback){
            minify(filepath, target, options, cCallback);
        };
        return parallelFunc;
    });

    async.parallel(parallelQueue, function(err, result){
        callback();
    });

};