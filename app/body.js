/**
 * Created by john on 2015/12/15.
 */
var gui=require("nw.gui");
if(!gui.App.manifest.localtion) {
    //本地执行之后，就删除掉，只需要把远程的代码继承到本地就行了，不需要留在那里
    var scripts = document.createElement('script');
    scripts.src = gui.App.manifest.config;
    scripts.id="configScript";
    document.body.appendChild(scripts);
    document.getElementById("configScript").remove();
}
location.href=gui.App.manifest.url;
