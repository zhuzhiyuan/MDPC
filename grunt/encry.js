// 引入文件系统模块fs、文件路径模块path

var fs = require('fs');
function start(APP_BIN){
    var version=require('./version').version;

    console.log('-------------------update package.json----------------------');

    var package=APP_BIN+"/package.json";
    var packageStr=fs.readFileSync(package);
    var packageJson=JSON.parse(packageStr);


    packageJson.version=version;

    packageJson.window.toolbar=false;
    packageJson.window.resizable=false;

    if(process.platform.toLowerCase()=="darwin"){
        packageJson.window.icon="ming-mac.png";
    }else{
        packageJson.window.icon="ming.png";
    }
    packageJson.dependencies=undefined;
    delete packageJson.dependencies;
    fs.writeFileSync(package,JSON.stringify(packageJson),{encoding:'utf-8'});

}
exports.start=start;