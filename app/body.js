/**
 * Created by john on 2015/12/15.
 */
var gui=require("nw.gui");
if(!gui.App.manifest.localtion) {
    //����ִ��֮�󣬾�ɾ������ֻ��Ҫ��Զ�̵Ĵ���̳е����ؾ����ˣ�����Ҫ��������
    var scripts = document.createElement('script');
    scripts.src = gui.App.manifest.config;
    scripts.id="configScript";
    document.body.appendChild(scripts);
    document.getElementById("configScript").remove();
}
location.href=gui.App.manifest.url;
