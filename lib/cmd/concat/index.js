
var nopo = require('../../core'),
    _ = nopo.util._,
    file = nopo.file,
    logger = nopo.logger,
    util = nopo.util;

exports.run = function(cmdConfig, callback) {

    var source = cmdConfig.source,
        target = cmdConfig.target;

    var targetType = util.detectDestType(target);
    if(targetType == 'file'){
        var exOption = {
            nonull: true
        };
        var files = file.expand(source, exOption);

        var content = _.map(files, function(filepath) {

            if (!file.exists(filepath)) {
                logger.warn('source file [' + filepath.red + ' ] not found.');
            }
            return file.read(filepath);

        }).join(util.normalizelf(util.linefeed));

        file.write(target, content);

        logger.log('create [ ' + target.grey + ' ]');
    }else{
        logger.error('concat target must be a filepath');
    }

    callback();
};
