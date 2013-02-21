var nopo = require('../../core'),
    logger = nopo.logger,
    ftpDeploy = require('./ftp');

exports.run = function(cmdConfig, callback) {

    var source = cmdConfig.source,
        target = cmdConfig.target;

    var options = {
        'type': 'ftp',
        'config': {}
    };
    _.extend(options, cmdConfig.options);

    switch(options.type){
        case 'ftp':
            logger.log('ftp deploy ...');
            ftpDeploy.run(source, target, options.config, callback);
            break;
        default:
            break;
    }

};