
var ftp = require('ftp'),
    ftpClient = new ftp();




exports.sshDeploy = function(){

};

exports.deploy = function(source, target, config, callback){
    var st = genSourceTargetFiles(source, target);

    ftpClient.on('ready', function(){
        async.forEachSeries(st.files, function(fileInput, cb){
            var targetFile = st[fileInput].grey;
            logger.log('start sync [ ' + targetFile.grey + ' ]');
            target = path.dirname(target);
            ftpClient.put(fileInput, st[fileInput], function(err){
                logger.log('sync [ ' + targetFile.grey + ' ] done! ');
                if (err) logger.error(err);
                cb();
            });
        }, function(err){
            ftpClient.end();
            callback();
        });
    });
    ftpClient.connect(config);
};