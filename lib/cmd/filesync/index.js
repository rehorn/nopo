var nopo = require('../../core'),
    _ = nopo.util._,
    file = nopo.file,
    logger = nopo.logger,
    util = nopo.util,
    path = require('path'),
    fs = require('fs'),
    async = require('async')
    ftp = require('ftp');

function ftpSync(source, target, config, callback){
    var client = new ftp();
    var st = genSourceTargetFiles(source, target);

    client.on('ready', function(){
        async.forEachSeries(st.files, function(fileInput, cb){
            var targetFile = st[fileInput].grey;
            logger.log('start sync [ ' + targetFile.grey + ' ]');
            target = path.dirname(target);
            client.put(fileInput, st[fileInput], function(err){
                logger.log('sync [ ' + targetFile.grey + ' ] done! ');
                if (err) logger.error(err);
                cb();
            });
        }, function(err){
            client.end();
            callback();
        });
    });
    client.connect(config);
};

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
            logger.log('ftp sync ...');
            ftpSync(source, target, options.config, callback);
            break;
        default:
            break;
    }

};