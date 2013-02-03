var nopo = require('../../core'),
    _ = nopo.util._,
    file = nopo.file,
    logger = nopo.logger,
    util = nopo.util,
    config = nopo.config,
    template = nopo.template,
    path = require('path'),
    fs = require('fs'),
    copyCmd = require('../copy');

var setting = config.getSetting();

exports.run = function(cmdConfig, callback) {

    var source = cmdConfig.source,
        target = cmdConfig.target;

    var options = {
        meta: {},
        prefix: '@@'
    };
    _.extend(options, cmdConfig.options);

    var files = file.expandFiles(source),
        meta = options.meta,
        prefix = options.prefix,
        processed = 0,
        locals = {};

    prefix = template.process(prefix);

    logger.log('prefix: [ ' + prefix.cyan + ' ]');

    Object.keys(meta).forEach(function(key) {
        var value = meta[key];
        if (typeof value === 'string') {
            // console.log(template.process(key));
            // console.log(template.process(value));
            locals[template.process(key)] = template.process(value);
        }
    });

    var copyOptions = {
        source: source,
        target: target,
        options: {
            processContent: function(contents){
                var updated = false;
                Object.keys(locals).forEach(function(local) {
                    var re = new RegExp(prefix + local, 'g'),
                        value = locals[local];
                    updated = updated || contents.match(re);
                    contents = contents.replace(re, value);
                });
                if (updated) {
                    logger.log('process replacement ...');
                    processed++;
                } else {
                    return false;
                }
                return contents;
            }
        }
    };

    var done = function(){
        if (processed === 0) {
            logger.log('no documents replace'.yellow);
        }
        callback();
    }
    copyCmd.run(copyOptions, done);

};
