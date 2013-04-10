
var nopo = module.exports = {};

function nopoPublish(source, methodName, newMethodName) {
    nopo[newMethodName || methodName] = source[methodName].bind(source);
}

function nopoRequire(module){
    return nopo[module] = require('./nopo/' + module);
}

var cmd = nopoRequire('cmd'),
    config = nopoRequire('config'),
    error = nopoRequire('error'),
    file = nopoRequire('file'),
    logger = nopoRequire('logger'),
    option = nopoRequire('option'),
    task = nopoRequire('task'),
    template = nopoRequire('template'),
    util = nopoRequire('util');

var copyCmd = require('./cmd/copy'),
    async = require('async');

var setting;

// TODO read package.json
nopo.verson = '0.1.8';
nopo.startTime = (new Date()).getTime();

function cleanTargetRoot(){
    logger.writeline();
    logger.log("clean build target folder [ " + setting.targetRoot.grey + ' ]');
    file.delete(setting.targetRoot);
};

function cloneProject(callback){
    if(!setting.cloneProject){
        callback();
        return ;
    }

    logger.log("clone project to [ " + setting.cloneRoot.grey + ' ]');
    logger.log("only allow filetype: [ " + setting.allowExt.join(',').grey + ' ]');
    var source = ["**"];
    if(setting.applyFileFilter){
        source = util.formatFileType(source, setting.allowExt.join(','));
    }

    var exclude = [
        "!" + setting.cloneRoot + "**",
        "!" + setting.targetRoot + "**",
        "!**.svn/",
        "!**.CVS/",
        "!**.git/",
        "!**.idea/",
        "!**.diff",
        "!**.err",
        "!**.orig",
        "!**.log",
        "!**.rej",
        "!**.swo",
        "!**.swp",
        "!**.vi",
        "!**.sass-cache",
        "!**.DS_Store",
        "!**Thumbs.db",
        "!**.cache",
        "!**.project",
        "!**.settings",
        "!**.tmproj",
        "!**.sublime-project",
        "!**.sublime-workspace"
    ];

    var copyOption = {
        source: source.concat(exclude),
        target: setting.cloneRoot,
        options: {
            quiet: 1,
            inclueDir: 1
        }
    };
    // var files = file.expandFiles(copyOption.source);
    copyCmd.run(copyOption, callback);
};

function cleanBuildTemp(){
    logger.writeline();
    logger.log("clean build temp folder [ " + setting.nopoTemp.grey + ' ]');
    file.delete(setting.nopoTemp);
    if(setting.cloneProject){
        logger.log("clean clone project folder [ " + setting.cloneRoot.grey + ' ]');
        file.delete(setting.cloneRoot);
    }
};

var observer = {
    onConfigLoaded: function(code, msg){
        if(code == 0){
            setting = config.getSetting();
            // 清理编译target目录
            cleanTargetRoot();

            async.series([
                function(callback){
                    // 防止编译对源文件产生影响, 先clone项目，并作svn, git, 文件类型过滤
                    cloneProject(callback);
                }, 
                function(callback){
                    var done = function(){
                        // 清理编译临时文件
                        cleanBuildTemp();
                        logger.writeline();
                        logger.log('all done!');
                        logger.writeline();
                    };

                    // 执行task
                    task.runTasks(null, done);
                }
            ]);
            
        }else{
            logger.error(msg);
        }
    }
};

nopo.run = function(){
    logger.writeline();
    logger.log('nopo'.cyan + ' core start to run!');
    config.load(observer.onConfigLoaded);
};

nopo.run();




