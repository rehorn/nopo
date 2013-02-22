
var nopo = require('../../core'),
    util = nopo.util,
    path = require('path');

var ftp = require('ftp'),
    ftpClient = new ftp();

exports.deploy = function(source, target, config, callback){
    var st = util.genSourceTargetFilesMap(source, target);

    ftpClient.on('ready', function(){
        async.forEachSeries(st.files, function(fileInput, cb){
            
            // TODO: 提高效率，把需要上传的文件按目标文件夹进行分类，避免频繁切换目录
            // 必须先判断是否目标文件夹是否存在，如果否，先创建在上传
            var fileOutput = st[fileInput].replace(/\\/gi, '/');
            var targetDir = path.dirname(fileOutput);

            function ftpPutFile(targetDir, cb){
                // forword folder
                ftpClient.cwd(targetDir, function(err){
                    if(err){
                        // create folder
                        ftpClient.mkdir(targetDir, function(err) {
                            if(err){
                                logger.error('error creating new remote folder ' + targetDir.grey + ', err:' + err);
                                cb();
                            }else{
                                log.log('create remote folder ' + targetDir.grey);
                                ftpPutFile(targetDir, cb);
                            }
                        });
                    }else{
                        // put file
                        ftpClient.put(fileInput, fileOutput, function(err){
                            logger.log('sync [ ' + targetFile.grey + ' ] done! ');
                            if (err) logger.error(err);
                            cb();
                        });
                    }
                });
            };

            ftpPutFile(targetDir, cb);

            logger.log('start sync [ ' + targetFile.grey + ' ]');

        }, function(err){
            ftpClient.end();
            callback();
        });
    });
    ftpClient.connect(config);
};

exports.sshDeploy = function(){

};