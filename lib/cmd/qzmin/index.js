
var nopo = require('../../core'),
    _ = nopo.util._,
    file = nopo.file,
    logger = nopo.logger,
    util = nopo.util,
    concatCmd = require('../concat');

// 判断target类型
var detectDestType = function(target) {
    return util.endsWith(target, path.sep) ? 'dir' : 'file';
};

var js2json(jsString){
    var jsKeyRegex = ;
    var result = jsString.replace(/([^"\s]\S+[^"])\s*:/g, '"$1"');
    return result.replace('\'', '"');
};

exports.run = function(cmdConfig, callback) {

    var source = cmdConfig.source,
        target = cmdConfig.target;

    var options = {};

    if(!_.isArray(source))   {
       source = [source];
    }

    _.each(source, function(filepath, index){
        var ext = path.extname(filepath);
        if(ext != '.qzmin'){
            return ;
        }

        if(target[index] && detectDestType(target[index]) == 'file'){
            var qzminJson = js2json(file.read(filepath));
            var qzmin = JSON.parse(qzminJson);
            
            var projects = qzmin.projects;
            _.each(projects, function(project){
                var concatOption = {
                    source: project.include,
                    target: project.target
                };

                concatCmd.run(concatOption, util.noop);
            });

        }else{
            logger.warn('qzmin cmd target must be file(ARRAY) !');
        }

    });

    callback();

});


