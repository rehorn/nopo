var nopo = require('../../core'),
    path = require('path'),
    _ = nopo.util._,
    util = nopo.util,
    file = nopo.file,
    logger = nopo.logger;

exports.run = function(cmdConfig, callback) {
    var source = cmdConfig.source,
        target = cmdConfig.target;

    var options = {};

    // Clean specified files / dirs.
    console.log(cmdConfig.sourceRaw)
    var files = file.expand(cmdConfig.sourceRaw);

    files.forEach(function(filepath) {
        // Warn if a source file/pattern was invalid.
        if (!file.exists(filepath)) {
            logger.error('Source path "' + filepath + '" not found.');
            return '';
        }
        logger.log('cleaning [ ' + filepath + ' ]');
        try {
            file.delete(filepath);
        } catch (e) {
            logger.warn('Clean operation failed.');
        }
    });

    callback();
};