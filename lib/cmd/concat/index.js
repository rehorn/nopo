
var nopo = require('../../core'),
    _ = nopo.util._,
    file = nopo.file,
    logger = nopo.logger,
    util = nopo.util;

exports.run = function(cmdConfig, callback) {

    var source = cmdConfig.source,
        target = cmdConfig.target;

    if(_.isArray(target)){
        target = target[0];
        logger.warn('concat target must not be Array!');
    }
    
    var exOption = {
        nonull: true
    };
    var files = file.expand(source, exOption);

    var content = _.map(files, function(filepath) {

        if (!file.exists(filepath)) {
            logger.warn('Source file "' + filepath + '" not found.');
        }
        return file.read(filepath);

    }).join(util.normalizelf(util.linefeed));

    file.write(target, content);

    logger.log('File "' + target + '" created.');

    callback();
};
