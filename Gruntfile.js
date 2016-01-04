var execSync = require('child_process').execSync;
var config=require('./grunt/config');
module.exports = function(grunt) {
var APP_BIN="dest";//打包的临时目录
grunt.initConfig({
          nwjs: {
            win:{
              options: {
                platforms: ['win'],
                credits:'credits.html',
                buildDir: './build', // Where the build version of my NW.js app is saved
              },
              src: ['./'+APP_BIN+'/**/*'] // Your NW.js app
            },
            osx:{
              options: {
                platforms: ['osx'],
                credits:'credits.html',
                version:'v0.12.3',
                //macIcns:'MingDao.icns',
                macPlist:{
                  LSApplicationCategoryType:"public.app-category.business",
                  CFBundleIdentifier:"io.mingdao.nw",
                  CFBundleVersion:""+new Date().getTime(),
                  CFBundleShortVersionString:config.version
                },
                buildDir: './build', // Where the build version of my NW.js app is saved
              },
              src: ['./'+APP_BIN+'/**/*'] // Your NW.js app
            }
          },
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
            },
            lib:{
              files:[
                {
                  expand: true,
                  src:'lib/**/*',
                  dest:'package/',
                  filter: 'isFile'
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
                  src:'lib/**/*.js',
                  dest:'package'
                }
              ]
            }
          },
          //css压缩
          cssmin: {
            modules: {
              options: {
                sourceMap: false
              },
              files: [
                {
                  expand: true,
                  src: 'lib/**/*.css',
                  dest: 'package/'
                }
              ]
            }
          },
          clean:{
            after:['dest','v8.log']
          }
    });
  grunt.loadNpmTasks('grunt-nw-builder');
  grunt.loadNpmTasks('grunt-node-webkit-builder');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-clean');

  var encry=require('./grunt/encry');
  grunt.registerTask('encry', 'encry task.', function() {
    encry.start(APP_BIN);
  });

  var upload=require('./grunt/upload');
  grunt.registerTask('upload', 'upload task.', function() {
    upload.uploadbuild();
  });

  grunt.registerTask('uploadjs','upload index js',function(file){
    upload.uploadjs(file);
  });

  var buildarray=['clean:after','copy:app','encry'];
  var buildafter=[];
  var isMac = process.platform.toLowerCase()=="darwin";
  if(isMac){
    buildarray.push("nwjs:osx");
    buildafter.push("copy:osx");
  }else{
    buildarray.push("nodewebkit:win");
    buildafter.push("copy:win");
  }
  buildafter.push('clean:after');

  grunt.registerTask('build', buildarray);
  grunt.registerTask('buildafter', buildafter);

  grunt.registerTask("package",function(){
    upload.package();
  });

  grunt.registerTask("default",'default',function(file){
    grunt.task.run(['clean:after','copy:lib','uglify','cssmin']);
    if(file)
      grunt.task.run('uploadjs:'+file);
    else
      grunt.task.run('uploadjs');
    grunt.task.run('clean:after');
  });
};
