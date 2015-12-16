// 引入文件系统模块fs、文件路径模块path

var fs = require('fs');

var path = require('path');

// 定义同步遍历函数：该函数有两个参数，dir表示要遍历的文件路径，callback表示回调函数

function travelSync(dir,encryList) {
    // 使用同步方法读取并遍历该目录
    fs.readdirSync(dir).forEach(function(file) {
        // 获取遍历出的文件路径
        var pathname = path.join(dir, file);
        // 使用同步方法获取文件属性并判断是否是目录
        if (fs.statSync(pathname).isDirectory()) {
            // 如果是目录，则递归调用继续遍历该目录
            travelSync(pathname,encryList);
        } else {
            // 如果是JS，则进行加密
            encryList.push(pathname);
        }
    });
}
function encry(APP_BIN,jsfile){
    //先生成bin
    var filepath=path.dirname(jsfile);

    var filename=path.basename(jsfile,'.js')+'.bin';

    var encryexec;
    if(process.platform.toLowerCase()=="darwin"){
        encryexec=path.join(__dirname,'nwjc');
    }else {
        encryexec = path.join(__dirname, 'nwjc.exe');
    }

    var execSync = require('child_process').execSync;

    var binPath=path.join(filepath,filename);

    var execStr=encryexec+' '+jsfile+' '+binPath;

    execSync(execStr);

    //bin生成之后，修改本来的JS文件
    binPath=binPath.replace(/\\/g,'/');
    binPath=binPath.replace(APP_BIN+'/','');

    var encryStr='require("nw.gui").Window.get().evalNWBin(null,"'+binPath+'");\n';

    fs.writeFileSync(jsfile,encryStr,{encoding:"utf-8"});

    console.log(jsfile+'  success');

}
var encryList=[
    "body.js"
];
var fs = require('fs');
function start(APP_BIN){
    //console.log('-------------------read file encryList----------------------');
    //travelSync(APP_BIN,encryList);

    //for(var i in encryList)
    //{
    //    encry(APP_BIN,path.join(APP_BIN,encryList[i]));
    //}

    var config=require('./config');
    console.log('-------------------update package.json----------------------');

    var package=APP_BIN+"/package.json";
    var packageStr=fs.readFileSync(package);
    var packageJson=JSON.parse(packageStr);

    packageJson.name=config["name"];
    packageJson.version=config["version"];

    packageJson.window.toolbar=false;
    packageJson.window.resizable=false;

    packageJson.localtion=undefined;
    delete packageJson.localtion;

    packageJson["node-remote"]=config["node-remote"];
    packageJson["url"]=config["url"];

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