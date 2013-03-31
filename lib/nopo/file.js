// refer https://github.com/gruntjs/grunt

var _ = require('underscore'),
    fs = require('fs'),
    path = require('path'),
    async = require('async'),
    minimatch = require('minimatch'),
    iconv = require('iconv-lite'),
    rimraf = require('rimraf'),
    glob = require("glob"),
    logger = require('./logger'),
    setting = require('./config').setting;


var win32 = process.platform === 'win32',
    windowsDriveRegExp = /^[a-zA-Z]\:\/$/,
    pathSeparatorRe = /[\/\\]/g;

var pathExists = fs.exists || path.exists;
var existsSync = fs.existsSync || path.existsSync;

exports.exists = existsSync;

exports.isFile = function(filepath) {
    return existsSync(filepath) && fs.statSync(filepath).isFile();
};

exports.isDerectory = function(filepath) {
    return existsSync(filepath) && fs.statSync(filepath).isDirectory();
};

exports.isPlaintextFile = function(filepath) {
    var ext = path.extname(filepath);
    var binary = {
        ".png": 1,
        ".jpg": 1,
        ".gif": 1,
        ".jpeg": 1,
        ".ico": 1,
        ".exe": 1
    };
    return !binary[ext];
};

exports.setBase = function() {
    var dirpath = path.join.apply(path, arguments);
    process.chdir(dirpath);
};

// Process specified wildcard glob patterns or filenames against a
// callback, excluding and uniquing files in the result set.
var processPatterns = function(patterns, fn) {
    var result = [];
    _.flatten(patterns).forEach(function(pattern) {
        var exclusion = pattern.indexOf('!') === 0;
        if (exclusion) {
            pattern = pattern.slice(1);
        }
        // console.log(pattern)
        var matches = fn(pattern);
        // console.log(matches)
        if (exclusion) {
            result = _.difference(result, matches);
        } else {
            result = _.union(result, matches);
        }
    });
    // console.log(result)
    return result;
};

exports.match = function(patterns, filepaths, options) {
    options = options || {};
    if (patterns == null || filepaths == null) {
        return [];
    }
    if (!Array.isArray(patterns)) {
        patterns = [patterns];
    }
    if (!Array.isArray(filepaths)) {
        filepaths = [filepaths];
    }
    if (patterns.length === 0 || filepaths.length === 0) {
        return [];
    }
    return processPatterns(patterns, function(pattern) {
        return minimatch.match(filepaths, pattern, options);
    });
};

exports.isMatch = function() {
    return exports.match.apply(exports, arguments).length > 0;
};

exports.expand = function(patterns, options) {
    options = options || {};

    if (!Array.isArray(patterns)) {
        patterns = [patterns];
    }

    if (patterns.length === 0) {
        return [];
    }

    return processPatterns(patterns, function(pattern) {
        return glob.sync(pattern, options);
    });
};

var expandByType = function(type, patterns, options) {
    var files = exports.expand(patterns, options);
    files = files.filter(function(filepath) {
        try {
            return fs.statSync(filepath)[type]();
        } catch (e) {
            return false;
        }
    });
    // console.log(files);
    return files;
};

exports.expandDirs = function(patterns, options){
    return expandByType('isDirectory', patterns, options);
};

exports.expandFiles = function(patterns, options){
    return expandByType('isFile', patterns, options);
};

// Return an array of all file paths that match the given wildcard patterns,
// plus a uniqed list of any URLs that were passed, at the end.
exports.expandFileURLs = function() {
    var patterns = Array.isArray(arguments[0]) ? arguments[0] : _.toArray(arguments);
    var urls = [];
    // Filter all URLs out of patterns list and store them in a separate array.
    patterns = _.flatten(patterns).filter(function(pattern) {
        if (/^(?:file|https?):\/\//i.test(pattern)) {
            urls.push(pattern);
            return false;
        }
        return true;
    });
    // Return uniqed array of expanded filepaths with urls at end.
    return _.uniq(exports.expandFiles(patterns).map(function(filepath) {
        var abspath = path.resolve(filepath);
        // Convert C:\foo\bar style paths to /C:/foo/bar.
        if (abspath.indexOf('/') !== 0) {
            abspath = normalize('/' + abspath);
        }
        return 'file://' + abspath;
    }).concat(urls));
};

exports.mkdirpSync = function(dirpath, mode) {
    if(mode == null) {
        mode = parseInt('0777', 8) & (~process.umask());
    }
    // reduce方法把列表中元素归结为一个简单的数值
    dirpath.split(pathSeparatorRe).reduce(function(parts, part) {
        parts += path.join(part, path.sep);
        var subpath = path.resolve(parts);
        if (!existsSync(subpath)) {
            fs.mkdirSync(subpath, mode);
        }
        return parts;
    }, '');
};

// Recurse into a directory, executing callback for each file.
exports.recurse = function(rootdir, callback, subdir) {
    var abspath = subdir ? path.join(rootdir, subdir) : rootdir;
    fs.readdirSync(abspath).forEach(function(filename) {
        var filepath = path.join(abspath, filename);
        if (fs.statSync(filepath).isDirectory()) {
            recurse(rootdir, callback, normalize(path.join(subdir, filename)));
        } else {
            callback(normalize(filepath), rootdir, subdir, filename);
        }
    });
};


// The default file encoding to use.
exports.defaultEncoding = 'utf8';

// Read a file, return its contents.
exports.read = function(filepath, options) {
    var contents;
    options = options || {};
    try {
        contents = fs.readFileSync(String(filepath));
        if (options.encoding !== null) {
            contents = iconv.decode(contents, options.encoding || exports.defaultEncoding);
            // Strip any BOM that might exist.
            if (contents.charCodeAt(0) === 0xFEFF) {
                contents = contents.substring(1);
            }
        }
        return contents;
    } catch (e) {
        // todo
    }
};

// Read a file, parse its contents, return an object.
exports.readJSON = function(filepath, options) {
    var src = exports.read(filepath, options);
    var result;
    try {
        result = JSON.parse(src);
        return result;
    } catch (e) {
        // todo log
    }
};

// Write a file.
exports.write = function(filepath, contents, options) {
    options = options || {};
    exports.mkdirpSync(path.dirname(filepath));
    try {
        if (!Buffer.isBuffer(contents)) {
            contents = iconv.encode(contents, options.encoding || exports.defaultEncoding);
        }
        fs.writeFileSync(filepath, contents);
        return true;
    } catch (e) {
        // todo
        console.log('write file error!');
    }
};

// Read a file, optionally processing its content, then write the output.
exports.copy = function(srcpath, destpath, options) {
    options = options || {};
    var process = options.process && options.noProcess !== true && !(options.noProcess && exports.isMatch(options.noProcess, srcpath));
    var readWriteOptions = process ? options : {
        encoding: null
    };
    var contents = exports.read(srcpath, readWriteOptions);
    if (process) {
        try {
            contents = options.process(contents, srcpath);
        } catch (e) {
            // todo
        }
    }
    if (contents === false) {
        // todo
    } else {
        exports.write(destpath, contents, readWriteOptions);
    }
};

// Delete folders and files recursively
exports.delete = function(filepath, options) {
    options = options || {};
    try {
        rimraf.sync(filepath);
        return true;
    } catch (e) {
        // todo
        logger.error(e);
    }
};

exports.isPathAbsolute = function() {
    var filepath = path.join.apply(path, arguments);
    return path.resolve(filepath) === filepath.replace(/[\/\\]+$/, '');
};

exports.arePathsEquivalent = function(first) {
    first = path.resolve(first);
    for (var i = 1; i < arguments.length; i++) {
        if (first !== path.resolve(arguments[i])) {
            return false;
        }
    }
    return true;
};

exports.doesPathContain = function(ancestor) {
    ancestor = path.resolve(ancestor);
    var relative;
    for (var i = 1; i < arguments.length; i++) {
        relative = path.relative(path.resolve(arguments[i]), ancestor);
        if (relative === '' || /\w+/.test(relative)) {
            return false;
        }
    }
    return true;
};

exports.isPathCwd = function() {
    var filepath = path.join.apply(path, arguments);
    try {
        return exports.arePathsEquivalent(process.cwd(), fs.realpathSync(filepath));
    } catch (e) {
        return false;
    }
};

exports.isPathInCwd = function() {
    var filepath = path.join.apply(path, arguments);
    try {
        return exports.doesPathContain(process.cwd(), fs.realpathSync(filepath));
    } catch (e) {
        return false;
    }
};

function getFileOutput(fileInput, target, cloneBasePath, copyBasePath){
    var fileOutput;
    var slash = util.detectDestType(fileInput) == 'dir' ? path.sep : '' ;
    var relFilePath = path.relative(process.cwd(), fileInput) + slash;

    if(cloneBasePath){
        relFilePath = relFilePath.replace(path.normalize(cloneBasePath), '');
    }if(copyBasePath){
        relFilePath = relFilePath.replace(path.normalize(copyBasePath), '');
    }
    
    if(exports.doesPathContain(setting.targetRoot, fileInput)){
        fileOutput = relFilePath;
    }else{
        fileOutput = path.join(target, relFilePath);
    }
    return fileOutput;
};

// 根据source展开文件列表，并返回所有文件列表的目标地址dest map
// expand files dir array list and from to url
// { files: [ '__nopo_clone__/index.html' ],
// dirs: [],
// filesMap: { '__nopo_clone__/index.html': 'nopo-build\\index.html' },
// dirsMap: {},
// firstFileOutput: 'nopo-build\\index.html' }
exports.getFileIOMaps = function(source, target, options){
    target = target || '';
    options = options || {};
    var srcFiles = srcDirs = [], 
        ioMap, targetType;

    var setting = require('./config').setting;
    var cloneBasePath = setting.cloneProject ? setting.cloneRoot : '';
        copyBasePath = options.basePath;

    var opt = {
        flatten: false,
        inclueDir: false,
        includeEmpty: false
    };
    opt = _.extend(opt, options);

    srcFiles = exports.expandFiles(source) || [];
    ioMap = {
        files: srcFiles,
        dirs: srcDirs,
        filesMap: {},
        dirsMap: {}
    };

    if(opt.inclueDir){
        srcDirs = exports.expandDirs(source);
        ioMap.dirs = srcDirs;
    };

    // has empty dirs
    if(!opt.flatten && opt.inclueDir && opt.includeEmpty && srcDirs.length){
        var idx = 0;
        srcDirs.forEach(function(dirInput) {
            var dirOutput = getFileOutput(dirInput, target, cloneBasePath, copyBasePath);
            ioMap.dirsMap[dirInput] = dirOutput;
            if(idx++ == 0){
                ioMap.firstDirOutput = dirOutput;
            }
        });
    }

    if(srcFiles.length){

        targetType = util.detectDestType(target);
        if(srcFiles.length == 1 && targetType == 'file'){
            ioMap.filesMap[srcFiles[0]] = target;
            // console.log(ioMap);
            return ioMap;
        }else if(srcFiles.length > 1 && targetType == 'file'){
            target = path.dirname(target);
        }

        var idx = 0;
        srcFiles.forEach(function(fileInput){
            var fileOutput = '';
            if(opt.flatten){
                fileOutput = path.join(target, path.basename(fileInput));
            }else{
                fileOutput = getFileOutput(fileInput, target, cloneBasePath, copyBasePath);
            }
            ioMap.filesMap[fileInput] = fileOutput;
            
            if(idx++ == 0){
                ioMap.firstFileOutput = fileOutput;
            }
        });
        
    }
    
    // console.log(ioMap);
    return ioMap;
};

exports.normalizeTaskSourceTarget = function(oSource, oTarget){
    var sourceRaw = oSource, targetRaw = oTarget;

    // source可以是string或array, target 一般只能一个，多个target的情况，建议新加规则
    if(!_.isArray(oSource)){
        oSource = [oSource];
    }
    oSource = _.map(oSource, function(item){
        item = item || setting.defaultSource;
        // 去除source root，作用不大
        // 重新添加上，防止翻译时修改源文件，会将文件复制到临时目录，再进行编译
        if(!exports.doesPathContain(setting.targetRoot, item) && setting.targetRoot !== item){
            var exclusion = item.indexOf('!') === 0;
            if(exclusion){
                item = item.slice(1);
            }
            item = path.join(setting.cloneRoot, item);
            if(exclusion){
                item = '!' + item;
            }
        }
        // 默认为 / 结尾的文件夹加上循环子目录选项
        if(util.detectDestType(item) == 'dir'){
            item = item + '**';
        }
        return item;
    });

    if(_.isArray(oTarget)){
        oTarget = oTarget[0];
        logger.warn('target must not be an Array!');
    }
    oTarget = oTarget || setting.defaultTarget;
    // 非根路径
    if(!_(oTarget).startsWith('/')){
        oTarget = path.join(setting.targetRoot, oTarget);
    }

    return {
        source: oSource,
        target: oTarget,
        sourceRaw: sourceRaw,
        targetRaw: targetRaw
    };
};