
var mix = exports.mix = function (destination, source, overwrite, whitelist) {
    // missing argument(s)
    if (!source || !destination) {
        return destination;
    }

    // overwrite mode by default
    if (undefined === overwrite) {
        overwrite = true;
    }

    // check whitelist and build a map
    var whitelistLen, map = {};
    if (whitelist && (whitelistLen = whitelist.length)) {
        for(var i = 0; i < whitelistLen; i++){
            map[whitelist[i]] = true;
        }
    }
    for (var prop in source) {
        if (overwrite && !(prop in map) || !(prop in destination)) {
            destination[prop] = source[prop];
        }
    }
    return destination;
}

var toString = Object.prototype.toString;

var is = exports.is = function(type, obj) {
    var clas = toString.call(obj).slice(8, -1);
    return obj !== undefined && obj !== null && clas === type;
}

var isString = exports.isString = function(obj){
    return toString.call(obj) === '[object String]';
}

var isArray = exports.isArray = Array.isArray || function(obj){
    return toString.call(obj) === '[object Array]';
}

var isArguments = exports.isArguments = function(obj){
    return toString.call(obj) === '[object Arguments]';
}

var isObject = exports.isObject = function(obj){
    return toString.call(obj) === '[object Object]';
}

var isFunction = exports.isFunction = function(obj){
    return toString.call(obj) === '[object Function]';
}

var isUndefined = exports.isUndefined = function(obj){
    return toString.call(obj) === '[object Undefined]';
}


