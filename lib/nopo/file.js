// refer https://github.com/gruntjs/grunt

var _ = require('underscore'),
    fs = require('fs'),
    path = require('path'),
    async = require('async'),
    minimatch = require('minimatch'),
    iconv = require('iconv-lite'),
    rimraf = require('rimraf'),
    glob = require("./glob");


var win32 = process.platform === 'win32',
    windowsDriveRegExp = /^[a-zA-Z]\:\/$/,
    pathSeparatorRe = /[\/\\]/g;

var pathExists = fs.exists || path.exists;
var existsSync = fs.existsSync || path.existsSync;

// Normalize \\ paths to / paths.
var unixifyPath = function(filepath) {
    if (win32) {
        return filepath.replace(/\\/g, '/');
    } else {
        return filepath;
    }
};

var isFile = exports.isFile = function(filepath) {
    return existsSync(filepath) && fs.statSync(filepath).isFile();
};

var isDerectory = exports.isDerectory = function(filepath) {
    return existsSync(filepath) && fs.statSync(filepath).isDirectory();
};

var isPlaintextFile = exports.isPlaintextFile = function(filepath) {

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

// 如 jquery.js => jquery.min.js
var suffix = exports.suffix = function(filepath, suffix) {

    var dn = path.dirname(filepath);
    var en = path.extname(filepath);
    var bn = path.basename(filepath, en);

    return path.join(dn, bn + suffix + en);
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
        var matches = fn(pattern);
        if (exclusion) {
            result = _.difference(result, matches);
        } else {
            result = _.union(result, matches);
        }
    });
    return result;
};

var match = exports.match = function(patterns, filepaths, options) {
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

var isMatch = exports.isMatch = function() {
    return match.apply(exports, arguments).length > 0;
};

var expand = exports.expand = function(pattern, options) {
    options = options || {};

    if (patterns.length === 0) {
        return [];
    }

    return processPatterns(patterns, function(pattern) {
        return glob.sync(pattern, options);
    });
};

var expandByType = function(type, pattern, options) {
    var files = expand(pattern, options);
    return files.filter(function(filepath) {
        try {
            return fs.statSync(path.join(options.cwd, filepath))[type]();
        } catch (e) {
            return false;
        }
    });
};

var expandDirs = exports.expandDirs = function(pattern, options){
    return expandByType('isDirectory', pattern, options);
};

var expandFiles = exports.expandFiles = function(pattern, options){
    return expandByType('isFile', pattern, options);
};

// Return an array of all file paths that match the given wildcard patterns,
// plus a uniqed list of any URLs that were passed, at the end.
var expandFileURLs = exports.expandFileURLs = function() {
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
    return _.uniq(file.expandFiles(patterns).map(function(filepath) {
        var abspath = path.resolve(filepath);
        // Convert C:\foo\bar style paths to /C:/foo/bar.
        if (abspath.indexOf('/') !== 0) {
            abspath = unixifyPath('/' + abspath);
        }
        return 'file://' + abspath;
    }).concat(urls));
};

var mkdirsSync = exports.mkdirpSync = function(dirpath, mode) {
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
var recurse = exports.recurse = function(rootdir, callback, subdir) {
    var abspath = subdir ? path.join(rootdir, subdir) : rootdir;
    fs.readdirSync(abspath).forEach(function(filename) {
        var filepath = path.join(abspath, filename);
        if (fs.statSync(filepath).isDirectory()) {
            recurse(rootdir, callback, unixifyPath(path.join(subdir, filename)));
        } else {
            callback(unixifyPath(filepath), rootdir, subdir, filename);
        }
    });
};


// The default file encoding to use.
exports.defaultEncoding = 'utf8';

// Read a file, return its contents.
var read = exports.read = function(filepath, options) {
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
var readJSON = exports.readJSON = function(filepath, options) {
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
var write = exports.write = function(filepath, contents, options) {
    options = options || {};
    exports.mkdirSync(path.dirname(filepath));
    try {
        if (!Buffer.isBuffer(contents)) {
            contents = iconv.encode(contents, options.encoding || exports.defaultEncoding);
        }
        fs.writeFileSync(filepath, contents);
        return true;
    } catch (e) {
        // todo
    }
};

// Read a file, optionally processing its content, then write the output.
var copy = exports.copy = function(srcpath, destpath, options) {
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
var delete = exports.delete = function(filepath, options) {
    options = options || {};
    try {
        rimraf.sync(filepath);
        return true;
    } catch (e) {
        // todo
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


