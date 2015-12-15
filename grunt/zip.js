var targz = require('tar.gz');
var extra=require('fs.extra');
var fs=require('fs');
function start(done){
	console.log('-------------------compress start----------------------');

    var compress = new targz().compress('app.nw', 'package/app.nw.tar.gz', function(err){
        if(err)
            console.log(err);
        console.log('-------------------remove app.nw----------------------');
        
        extra.removeSync('app.nw');
        
        console.log('The compression has ended!');
        done();
    });
}

exports.start=start;

exports.extract=function(){
	var compress = new targz().extract('package/app.nw.tar.gz', 'package/', function(err){
		if(err)
			console.log(err);
	});
}
