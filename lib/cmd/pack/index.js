var nopo = require('../../core'),
    _ = nopo.util._,
    file = nopo.file,
    logger = nopo.logger,
    util = nopo.util,
    path = require('path'),
    fs = require('fs');

exports.run = function(cmdConfig, callback) {

    var source = cmdConfig.source,
        target = cmdConfig.target;

    var options = {
        basePath: ''
    };
    _.extend(options, cmdConfig.options);

    var dirname = path.dirname(target);
    if(fs.existsSync(dirname) === false){
        file.mkdirpSync(dirname);
    }
    if(fs.existsSync(target) === true){
        file.delete(target);
    }

    logger.log('zip >> [ ' + target.grey + ' ]');
    var out = fs.createWriteStream(target);
    var zip = require("zipstream").createZip(options);
    zip.pipe(out);

    files = file.expandFiles(source);
    if(!files.length){
        callback()
        return;
    }

    function addFile() {
        if (!files.length) {
            zip.finalize(function() {
                callback();
            });
            return;
        }

        var filepath = files.shift(),
            internal = filepath;
        if (options.basePath) {
            internal = path.relative(options.basePath, filepath);
        }

        // logger.log("add [ " + filepath.grey + " ] to zip.");
        zip.addFile(fs.createReadStream(filepath), {
            name: internal
        }, addFile);
    }

    addFile();

};
