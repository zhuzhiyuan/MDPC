var execSync = require('child_process').execSync;

module.exports = function(grunt) {
var APP_BIN="dest";//打包的临时目录
grunt.initConfig({
          nodewebkit: {
            win:{//进行windows的打包
              options: {
                buildDir: './build', // Where the build version of my node-webkit app is saved
                platforms: ['win']
              },
              src: './'+APP_BIN+'/**/*' // Your node-webkit app
            },
            osx:{//进行osx的打包
              options: {
                macIcns: 'MingDao.icns',
                buildDir: './build', // Where the build version of my node-webkit app is saved
                platforms: ['osx']
              },
              src: './'+APP_BIN+'/**/*' // Your node-webkit app
            }
          },
          copy: {
            app:{//把所有的文件copy到一个临时目录里进行打包
              files:[
                {
                  expand: true,
                  cwd:"app/",
                  src:"**/*",
                  dest:APP_BIN+"/",
                  filter: 'isFile'
                }
              ]
            },
            win: { //win打包完成之后吧截图工具，声音文件和声音组件copy到安装目录
              files: [
                {
                  src:'libraries/win32/ffmpegsumo.dll',
                  dest: 'build/明道/win/ffmpegsumo.dll',
                  flatten: true
                },
                {
                  src:'chat.ico',
                  dest: 'build/明道/win/chat.ico',
                  flatten: true
                }
              ]
            },
            osx:{//OSX打包完成之后吧声音文件和声音组件集成到软件包里
              files: [
                {
                  src: 'libraries/osx64/ffmpegsumo.so',
                  dest: 'build/明道/osx/明道.app/Contents/Frameworks/nwjs Framework.framework/Libraries/ffmpegsumo.so',
                  flatten: true
                }
              ]
            }
          },
          uglify: {
            options: {
              mangle: {
                except: ['jQuery', 'require','include','exports','module']
              },
              compress: {
                drop_console: true
              },
              report: 'gzip',
              beautify: {
                width: 80,
                beautify: false
              },
              ASCIIOnly:true
            },
            my_target: {
              files: [
                {
                  expand:true,
                  src:'lib/*.js',
                  dest:'package'
                }
              ]
            }
          },
          clean:{
            after:['dest','v8.log']
          }
    });

  grunt.loadNpmTasks('grunt-node-webkit-builder');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-clean');


  grunt.registerTask('encry', 'encry task.', function() {
    var encry=require('./grunt/encry');
    encry.start(APP_BIN);
  });

  var upload=require('./grunt/upload');
  grunt.registerTask('upload', 'upload task.', function() {
    upload.uploadbuild();
  });

  grunt.registerTask('uploadjs','upload index js',function(){
    upload.uploadjs();
  });

  var buildarray=['clean:after','copy:app','encry'];
  var buildafter=[];
  var isMac = process.platform.toLowerCase()=="darwin";
  if(isMac){
    buildarray.push("nodewebkit:osx");
    buildafter.push("copy:osx");
  }else{
    buildarray.push("nodewebkit:win");
    buildafter.push("copy:win");
  }
  buildafter.push('clean:after');

  grunt.registerTask('build', buildarray);
  grunt.registerTask('buildafter', buildafter);

  grunt.registerTask("default",['clean:after','uglify','uploadjs','clean:after']);
};
