﻿var execSync = require('child_process').execSync;
var path=require('path');
var bucket="mdpub";
var qrsctl;
var config=require('./config');
console.log(config.version);

if(process.platform.toLowerCase()=="darwin"){
	qrsctl = path.join(__dirname, 'qrsctl');
}else{
    qrsctl = path.join(__dirname, 'qrsctl.exe');
}
var files={
	osx:[
		{
			key:'pc/mingdao_install.dmg',
			file:'package/install.dmg'
		}
	],
	win:[
	{
		key:'pc/mingdao_install.exe',
		file:'package/install.exe'
	}
	]
}

function start(param){
	var uploads=[];
	if(process.platform.toLowerCase()=="darwin"){
	    uploads = param.osx || param;
	}else{
	    uploads = param.win || param;
	}
	//登录
	try{
		console.log('--------------login--------------------------')
		execSync(qrsctl +' login jerry.jin@mingdao.com H!SVP0oWIJT0AC1E');
		console.log('--------------login success--------------------------');
	}catch(e){
	    console.log('--------------login filed--------------------');
	}

	for(var i in uploads){
		//删除安装包
		var delStr=qrsctl +' del '+bucket+' '+uploads[i].key
		console.log(delStr);
		try{
			console.log('------------------del--------------');
			execSync(delStr);
			console.log('------------------del success--------------');
		}catch(e){
			console.log('------------------del filed--------------');
		}
		
		//上传安装包
		var putStr=qrsctl +' put -c '+bucket+' '+uploads[i].key+' '+uploads[i].file;
		console.log(putStr)
		try{
			console.log('------------------put--------------');

			execSync(putStr);

			console.log('------------------put success--------------');
		}catch(e){
			console.log('------------------put filed--------------');
		}
		

		var refreshStr=qrsctl+' cdn/refresh '+bucket+' http://mdpub.qiniudn.com/'+uploads[i].key+',http://filepub.mingdao.com/'+uploads[i].key;
		console.log(refreshStr)
		try{
			console.log('------------------refresh--------------');

			execSync(refreshStr)

			console.log('------------------refresh success--------------');
		}catch(e){
			console.log('------------------refresh filed--------------');
		}
	}
}
exports.uploadbuild=function(){
	//正式发布
	start(files);	
	//测试发布
}

function travelSync(dir,encryList) {
	var fs=require('fs');
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
			encryList.push(pathname.replace(new RegExp("\\\\", "gi"),'/'));
		}
	});
}
exports.uploadjs=function(file){
	var dir="package/lib";
	var uploadFiles=[];
	if(file){
		uploadFiles.push({
			key:'pc/'+file,
			file:dir+'/'+file
		});
	}else{
		var files=[];
		travelSync(dir,files);
		for(var i in files){
			var item={
				key:files[i].replace('package/lib','pc'),
				file:files[i]
			}
			uploadFiles.push(item);
		}
	}
	start(uploadFiles);
}

exports.package=function(){
	//execSync('codesign -s "3rd Party Mac Developer Application: Shanghai Wanqi Mingdao Software Co., Ltd. (SFADKFPXL2)" --keychain /Users/mingdao/Library/Keychains/login.keychain --deep "build/明道/osx64/明道.app"')
	execSync('sh macstore_sign.sh "build/明道/osx64/明道.app" "明道" "io.mingdao.nw" "3rd Party Mac Developer Application: Shanghai Wanqi Mingdao Software Co., Ltd. (SFADKFPXL2)" "package"');
	execSync('productbuild --component package/明道.app /Applications --sign "3rd Party Mac Developer Installer: Shanghai Wanqi Mingdao Software Co., Ltd. (SFADKFPXL2)" package/install.pkg');
}


 