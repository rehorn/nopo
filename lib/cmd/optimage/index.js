/**
 * refer：modjs-task optimage
 */

var nopo = require('../../core'),
    _ = nopo.util._,
    file = nopo.file,
    logger = nopo.logger
    path = require('path'),
    async = require('async'),
    spawn = require('child_process').spawn;

function optimage(inputFile, outputFile, level, callback){
    var child,
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

        if (code !== 0) {
            child.stderr.on('data', function (data) {
                var errinfo = "\n"+
                    "InputFile: " + inputFile + "\n" +
                    "OutputFile: " +  outputFile + "\n" +
                    data + "\n" +
                    'exited unexpectedly with exit code ' + code;

                callback(errinfo);
                logger.error(errinfo);
            });
        }else{
            callback();
        }

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

    async.forEach(files, function(inputFile, cb){
        // filter
        var ext = path.extname(inputFile).toLowerCase();
        if(supportExt.indexOf(ext) < 0){
            cb();
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

        logger.log('optimage'.cyan + ': ' + inputFile.grey + ' > ' + outputFile.grey);

        optimage(inputFile, outputFile, options.level, cb);


    }, callback);
    

};