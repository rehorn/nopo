var nopo = require('../../core'),
    _ = nopo.util._,
    logger = nopo.logger,
    exec = require('child_process').exec;

exports.run = function(cmdConfig, callback) {

    var source = cmdConfig.source,
        target = cmdConfig.target;

    var options = {
        'command': ''
    };
    _.extend(options, cmdConfig.options);

    exec(command, { maxBuffer: options.buffer }, function (err, stdout, stderr) {
        if (err) {
            logger.error('exec error:' + err);
            callback(err);
        } else {
            callback(null);
        }
    });

};
