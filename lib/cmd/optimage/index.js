/**
 * refer：modjs-task optimage
 */

var nopo = require('../../core'),
    _ = nopo.util._,
    file = nopo.file,
    logger = nopo.logger
    path = require('path'),
    async = require('async'),
    fs = require('fs'),
    spawn = require('child_process').spawn;

function optimage(inputFile, outputFile, level, callback){
    var child,
        outputFileSize,
        inputFileSize = fs.statSync(inputFile)['size'],
        command = '',
        args = [];

    outputFile = outputFile || inputFile;

    switch (path.extname(inputFile).toLowerCase()){
        // 1. Basic optimisation
        // optipng xx.png -out xx2.png
        // optipng xx.png -dir ./img
        // default -o2
        // debug:"E:\Server\Node\nopo\lib\cmd\optimage\bin\optipng.exe" -strip all "./images/image2.png" -out "nopo_node\images\image2.png" -o2

        // TODO
        // 2. Removing unnecessary chunks
        // pngcrush -q -rem gAMA -rem alla -rem text image.png image.crushed.png
        // 3. Reducing the colour palette
        // pngnq -f -n 32 -s 3 image.png
        // 4. Re-compressing final image
        // advpng -z -4 image.png
        case '.png':
        case '.bmp':
        case '.tiff':
            command = 'optipng';
            args.push('-strip all', inputFile, "-out", outputFile, '-o' + level);

            break;

        // jpegtran [switches] inputfile outputfile
        case '.jpg':
        case '.jpeg':
            command = 'jpegtran';
            args.push(inputFile, outputFile);

            break;

        // gifsicle -O2 img.gif --output img.gif
        case '.gif':
            command = 'gifsicle';
            args.push('-O2', inputFile, '--output', outputFile);

            break;
        default:
            callback();
            return;
    }
    
    command = path.resolve(__dirname, './bin', command);
    // logger.log(command);
    // logger.log(JSON.stringify(args))
    child = spawn(command, args);

    child.stderr.on('data', function (data) {
        // logger.log(data);
    });

    child.on('exit', function (code) {

        var logInfo = 'optimage'.cyan + ': ' + inputFile.grey + ' > ' + outputFile.grey;

        if (code !== 0) {
            logger.warn(logInfo);
        }else{
            outputFileSize = fs.statSync(outputFile)['size'];
            logger.log(logInfo + '; [ ' + ((inputFileSize === 0) ? '100%'.cyan : (((outputFileSize / inputFileSize * 100).toFixed(2) + '%').cyan)) + ' ]');
        }
        
        callback();

    });
};

exports.run = function(cmdConfig, callback) {

    var source = cmdConfig.source,
        target = cmdConfig.target;

    var options = {
        level: 2,
        flatten: false
    };
    _.extend(options, cmdConfig.options);

    var supportExt = ['.png', '.bmp', '.tiff', 'jpeg', 'jpg', '.gif'];

    var files = file.expandFiles(source);

    var parallelQueue = _.map(files, function(inputFile){
        var parallelFunc = function(cCallback){
            // filter
            var ext = path.extname(inputFile).toLowerCase();
            if(supportExt.indexOf(ext) < 0){
                cCallback();
                return;
            }

            var outputFile;
            var fileName = path.basename(inputFile),
                filePath = path.dirname(inputFile);

            if(options.flatten) {
                outputFile = path.join(target, fileName);
            }else{
                if(file.doesPathContain(target, inputFile)){
                    outputFile = inputFile;
                }else{
                    var targetDir = path.join(target, filePath);
                    if(!file.exists(targetDir)){
                        file.mkdirpSync(targetDir);
                    }
                    outputFile = path.join(targetDir, fileName);
                }
            }

            optimage(inputFile, outputFile, options.level, cCallback);
        };
        return parallelFunc;
    });

    async.parallel(parallelQueue, function(err, result){
        callback();
    });

};