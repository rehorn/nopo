var nopo = require('../../core'),
    util = nopo.util,
    file = nopo.file,
    logger = nopo.logger,
    path = require('path'),
    async = require('async');

var ftp = require('ftp'),
    ftpClient = new ftp();

exports.deploy = function(source, target, config, callback){

    try{
        rsync(config, function(error, stdout, stderr, cmd) {
            if(error){
                logger.log(" error".red);
                logger.log(cmd.grey);
                logger.log(error.toString().red);
                callback();
            }else{
                logger.log(" done".green);
                logger.log(cmd.grey);
                logger.log(stdout);
                callback();
            }
        });
    }catch(error){
        logger.log("\n" + error.toString().red);
        callback();
    }
};