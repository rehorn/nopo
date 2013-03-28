var nopo = require('../../core'),
    _ = nopo.util._,
    file = nopo.file,
    logger = nopo.logger,
    util = nopo.util,
    path = require('path'),
    fs = require('fs');

var cConfig;

function getCmdArgs(options){
    var args = [];
    for(var optionName in options){
        if(options.hasOwnProperty(optionName) && typeof(options[optionName]) === 'string') {
            args.push('--' + optionName + '=' + options[optionName]);
        }
    }
    return args;
};

/**
 * jsdoc-toolkit
 * https://code.google.com/p/jsdoc-toolkit/w/list
 * http://usejsdoc.org/about-commandline.html
 * https://code.google.com/p/jsdoc-toolkit/wiki/CommandlineOptions
 */
function genJsDoc(options, callback){
    var fileSrc = file.expandFiles(util.formatSourceFileType(cConfig.source, 'js'));
    options.directory = options.directory || cConfig.target;
    options.template = options.template || path.join(__dirname, './lib/node-jsdoc-toolkit/templates/jsdoc');

    //check if there is sources to generate the doc for
    if(fileSrc.length === 0){
        logger.warn('No source files defined');
        return callback();
    }

    //check if jsdoc config file path is provided and does exist
    if(options.conf && !fs.existsSync(options.conf)){
        logger.error('jsdoc config file path does not exist');
        return callback();
    }

    var execCmd = require('../exec');
    var JSDOC_TOOLKIT_PATH = path.join(__dirname, './lib/node-jsdoc-toolkit/app/run.js');
    var cmd = 'node ' + JSDOC_TOOLKIT_PATH;
    var args = getCmdArgs(options);
    // push filelist
    args.push.apply(args, fileSrc);

    var runCmd = cmd + " " + args.join(' ');
    logger.log("Running: " + runCmd.grey);

    // mkdir
    file.mkdirpSync(options.directory);
    
    // run
    var cmdConfig = {
        options: {
            command: runCmd
        }
    };
    execCmd.run(cmdConfig, callback);
};

/**
 * yuidocjs
 * http://yui.github.com/yuidoc/args/index.html
 * paths:
 * outdir:
 * project:{name, description, version}
 */
function genYuiDoc(options, callback){
    options.outdir = options.outdir || cConfig.target;
    options.paths = options.paths || cConfig.sourceRaw;

    if(!options.paths){
        logger.warn('No path(s) provided for YUIDoc to scan.');
        return callback();
    }
    if(!options.outdir){
        logger.warn('You must specify a directory for YUIDoc output.');
        return callback();
    }

    var Y = require('yuidocjs');
    file.mkdirpSync(options.outdir);

    if(!_.isArray(options.paths)) {
        options.paths = [options.paths];
    }
    var json = (new Y.YUIDoc(options)).run();

    options = Y.Project.mix(json, options);

    if(!options.parseOnly){
        var builder = new Y.DocBuilder(options, json);

        logger.log('Start YUIDoc compile...');
        logger.log('Output: ' + (options.outdir).cyan);

        builder.compile(function() {
            callback();
        });
    }
};

exports.run = function(cmdConfig, callback) {
    cConfig = cmdConfig;
    var source = cmdConfig.source,
        target = cmdConfig.target;

    var options = {
        // jsdoc-toolkit, yui-doc(npm install yuidocjs needed, large packages - -||)
        engine: "jsdoc-toolkit"
        // other option
    };
    _.extend(options, cmdConfig.options);

    var engine = options.engine;
    delete options.engine;
    switch(engine){
        case 'yui-doc':
            genYuiDoc(options, callback);
            break;
        case 'jsdoc-toolkit':
            genJsDoc(options, callback);
            break;
        default:
            genJsDoc(options, callback);
    }
};