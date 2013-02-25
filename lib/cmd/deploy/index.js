var nopo = require('../../core'),
    logger = nopo.logger,
    _ = nopo.util._,
    ftpDeploy = require('./ftp'),
    rsyncDeploy = require('./rsync');

exports.run = function(cmdConfig, callback) {

    var source = cmdConfig.source,
        target = cmdConfig.target;

    var options = {
        'type': 'ftp'
    };
    _.extend(options, cmdConfig.options);

    switch(options.type){
        case 'ftp':
            logger.log('ftp deploy ...');
            ftpDeploy.deploy(source, target, options, callback);
            break;
        case 'rsync':
            logger.log('rsync deploy ...');
            rsyncDeploy.deploy(source, target, options, callback);
            break;
        default:
            break;
    }

};