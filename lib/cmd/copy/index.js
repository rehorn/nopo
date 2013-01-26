var nopo = require('../../core'),
    path = require('path'),
    _ = nopo.util._,
    util = nopo.util,
    file = nopo.file,
    logger = nopo.logger;

exports.run = function(cmdConfig, callback) {
    var source = cmdConfig.source,
        target = cmdConfig.target;

    var options = {
        excludeEmpty: false,
        flatten: false,
        processName: false,
        processContent: false,
        processContentExclude: []
    };

    _.extend(options, cmdConfig.options);

    var copyOptions = {
        process: options.processContent,
        noProcess: options.processContentExclude
    };

    var srcDirs = file.expandDirs(source);
    var srcFiles = file.expandFiles(source);

    if (srcFiles.length === 0 && options.excludeEmpty) {
        logger.warn('Unable to copy; no valid sources were found.');
    }

    var srcFile,
        targetType = util.detectDestType(target);
    if (targetType === 'file') {
        if (srcFiles.length === 1) {
            srcFile = srcFiles[0];

            logger.log('Copying file' + ' to ' + target.cyan + '...');
            file.copy(srcFile, target, copyOptions);

        } else {
            logger.warn('Unable to copy multiple files to the same destination filename, did you forget a trailing slash?');
        }
    } else if (targetType === 'dir') {
        var destDir;
        var destFile;

        if (options.flatten === false && options.excludeEmpty === false && srcDirs.length > 0) {
            logger.log('Creating directories' + ' in ' + target.cyan + '...');

            srcDirs.forEach(function(dir) {
                targetDir = path.join(target, dir);

                file.mkdirpSync(targetDir);
            });
        }

        logger.log('Copying files' + ' to ' + target.cyan + '...');

        var fileName;
        var filePath;
        srcFiles.forEach(function(file) {
            fileName = path.basename(file);
            filePath = path.dirname(file);

            srcFile = file;

            if (options.processName && _.isFunction(options.processName)) {
                fileName = options.processName(fileName) || fileName;
            }

            if (options.flatten) {
                targetFile = path.join(target, fileName);
            } else {
                console.log(filePath);
                targetFile = path.join(target, filePath, fileName);
            }

            nopo.file.copy(srcFile, targetFile, copyOptions);
        });

    }
    
    callback();
};
