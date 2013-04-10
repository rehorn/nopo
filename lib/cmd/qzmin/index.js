
var nopo = require('../../core'),
    _ = nopo.util._,
    file = nopo.file,
    logger = nopo.logger,
    util = nopo.util,
    path = require('path'),
    concatCmd = require('../concat');

function js2json(jsString){
    var result = jsString.replace(/([^"\s]\S+[^"])\s*:/g, '"$1":');
    return result.replace(/\'/g, '"');
};

exports.run = function(cmdConfig, callback) {

    var source = cmdConfig.source,
        target = cmdConfig.target;

    // 为source为文件夹的写法

    var options = {};
    var ioMap = file.getFileIOMaps(util.formatFileType(source, 'qzmin'));

    _.each(ioMap.files, function(filepath){
        var ext = path.extname(filepath);
        if(ext != '.qzmin'){
            return ;
        }

        if(target){
            var qzminJson = js2json(file.read(filepath));
            var qzmin = JSON.parse(qzminJson);
            
            // qzmin 要配合willow其实只有projects有效
            if(util.detectDestType(target) == 'dir'){
                var project = qzmin.projects[0];

                // resolve include path
                var includes = _.map(project.include, function(value){
                    return path.join(path.dirname(filepath), value);
                });

                var concatOption = {
                    source: includes,
                    target: path.join(target, path.basename(project.target))
                };

                concatCmd.run(concatOption, util.noop);
            }else{
                logger.warn('target must be a directory!');
            }

        }else{
            logger.warn('a target needed!');
        }

    });

    callback();

};


