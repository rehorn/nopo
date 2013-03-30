var nopo = require('../../core'),
    path = require('path'),
    _ = nopo.util._,
    util = nopo.util,
    file = nopo.file,
    config = nopo.config,
    logger = nopo.logger;

var quiet = false;
function log(msg){
    !quiet && logger.log(msg);
};

function warn(msg){
    !quiet && logger.warn(msg);
};

function locateFileSource(souce){

}

exports.run = function(cmdConfig, callback) {
    var source = cmdConfig.source,
        target = cmdConfig.target;

    var setting = config.getSetting();

    var options = {
        quiet: false,
        sourceRoot: setting.sourceRoot,
        excludeEmpty: false,
        flatten: false,
        processName: false,
        processContent: false,
        processContentExclude: []
    };

    _.extend(options, cmdConfig.options);
    console.log(options)
    quiet = options.quiet;

    var copyOptions = {
        process: options.processContent,
        noProcess: options.processContentExclude
    };

    var srcDirs = file.expandDirs(source);
    var srcFiles = file.expandFiles(source);

    if (srcFiles.length === 0 && options.excludeEmpty) {
        warn('unable to copy; no valid sources were found.');
    }

    var srcFile,
        targetType = util.detectDestType(target);
    if (targetType === 'file') {
        if (srcFiles.length === 1) {
            srcFile = srcFiles[0];

            log('copying file' + ' to [ ' + target.cyan + ' ]');
            file.copy(srcFile, target, copyOptions);

        } else if(srcFiles.length === 0){
            warn('no files to copy!');
        }else {
            warn('unable to copy multiple files to the same destination filename, did you forget a trailing slash?');
        }
    } else if (targetType === 'dir') {
        var destDir;
        var destFile;

        if (options.flatten === false && options.excludeEmpty === false && srcDirs.length > 0) {
            log('creating directories' + ' in [ ' + target.cyan + ' ]');

            srcDirs.forEach(function(dir) {
                if(!options.sourceRoot){
                    targetDir = path.join(target, dir);
                }else{
                    var src = path.join(options.sourceRoot, source);
                    targetDir = dir.replace(src, target);
                }
                log('create [ ' + targetDir.grey + ' ]');
                file.mkdirpSync(targetDir);
            });
        }

        log('copying files' + ' to [ ' + target.cyan + ' ]');

        var fileName;
        var filePath;
        srcFiles.forEach(function(fileItem) {
            fileName = path.basename(fileItem);
            filePath = path.dirname(fileItem);

            srcFile = fileItem;

            if (options.processName && _.isFunction(options.processName)) {
                fileName = options.processName(fileName) || fileName;
            }

            if (options.flatten) {
                targetFile = path.join(target, fileName);
            } else {
                if(file.doesPathContain(target, fileItem)){
                    targetFile = fileItem;
                }else{
                    if(!options.sourceRoot){
                        targetFile = path.join(target, fileItem);
                    }else{
                        targetFile = fileItem.replace(src, target);
                    }
                }
            }

            nopo.file.copy(srcFile, targetFile, copyOptions);
            log('create [ ' + targetFile.grey + ' ]');
        });

    }
    
    callback();
};
