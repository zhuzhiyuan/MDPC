var execSync = require('child_process').execSync;
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
			key:'osx/mingdao_install.dmg',
			file:'明道Chat.dmg'
		}
	],
	win:[
	{
		key:'win/mingdao_install.exe',
		file:'install.exe'
	}
	]
}
var jsFiles = [
		{
		    key: 'pc/index.js',
		    file: 'lib/index.js'
		},
        {
            key: 'pc/default.js',
            file: 'lib/default.js'
        }
    ];
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
		execSync(qrsctl +' login jerry.jin@mingdao.com pqwXMEqa8U4YF4k%');
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
		var putStr=qrsctl +' put -c '+bucket+' '+uploads[i].key+' '+path.join('package',uploads[i].file);
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

exports.uploadjs=function(){
	start(jsFiles);
}


 