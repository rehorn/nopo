
var nopo = require('../../core'),
    file = nopo.file;

exports.run = function(cmdConfig, callback){
    
    var source = cmdConfig.source,
        target = cmdConfig.target;
        
    var files = file.glob(source);

    files.forEach(function(source){

        var target = dest;

        // change to file copy to file
        if(file.isFile(source) && file.isDir(dest)){
            var filename = path.basename(source);
            target = path.join(dest, filename);
        }

        file.copy(source, target);
        exports.log(source + " > "+ target);


    }); 

};