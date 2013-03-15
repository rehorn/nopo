
var glob = require('glob');

glob('./*', {}, function(er, files){
    console.log(files);
});