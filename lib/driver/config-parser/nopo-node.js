

var nopoJsonParser = require('./nopo-json');

exports.parse = function(filepath){
    var no = require(filepath);
    return nopoJsonParser.parseNopoObject(no);
};