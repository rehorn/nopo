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

exports.run = function(cmdConfig, callback) {
    var source = cmdConfig.source,
        target = cmdConfig.target;

    var setting = config.getSetting();

    var options = {
        quiet: false,
        basePath: '',
        inclueDir: false,
        includeEmpty: false,
        flatten: false,
        processName: false,
        processContent: false,
        processContentExclude: []
    };

    _.extend(options, cmdConfig.options);
    quiet = options.quiet;

    var copyOptions = {
        process: options.processContent,
        noProcess: options.processContentExclude
    };

    var ioMapOptions = {
        inclueDir: options.inclueDir,
        basePath: options.basePath,
        flatten: options.flatten,
        includeEmpty: options.includeEmpty
    };

    var ioMap = file.getFileIOMaps(source, target, ioMapOptions);

    if(ioMap.dirs.length){
        _.each(ioMap.dirsMap, function(dirOutput, dirInput){
            file.mkdirpSync(dirOutput);
            log('create dir [ ' + targetFile.grey + ' ]');
        });
    }else if(options.inclueDir){
        log('no dirs to copy...');
    }

    if(ioMap.files.length){
        _.each(ioMap.filesMap, function(fileOutput, fileInput){
            nopo.file.copy(fileInput, fileOutput, copyOptions);
            log('create file [ ' + fileOutput.grey + ' ]');
        });
    }else{
        log('no files to copy...');
    }
    
    callback();
};
