var nopo = require('../../core'),
    _ = nopo.util._,
    logger = nopo.logger,
    exec = require('child_process').exec;

exports.run = function(cmdConfig, callback) {

    var source = cmdConfig.source,
        target = cmdConfig.target;

    var options = {
        'command': '',
        'quiet': 1,
        'buffer': 1024 * 100000 // /*stdout和stderr的最大长度*/ 默认是1024*200
    };
    _.extend(options, cmdConfig.options);

    if(!options.command){
        logger.warn('command is empty');
        return callback();
    }

    var cp = exec(options.command, { maxBuffer: options.buffer }, function (err, stdout, stderr) {
        if (err) {
            logger.error('exec error:' + err);
            callback(err);
        } else {
            callback();
        }
    });

    if(!options.quiet){
        cp.stdout.on('data', function (data) {
            logger.log('stdout: ' + data);
        });

        cp.stderr.on('data', function (data) {
            logger.error('stderr: ' + data);
        });

        cp.on('exit', function (code) {
            logger.log('child process exited with code ' + code);
        });
    }

};
