/**
 * Created by john on 2015/12/17.
 */

(function(doc,$){
    var gui=require('nw.gui');
    var path=require('path');
    var defaultSetting={
        closeIsMin:true,
        minIsTray:true
    };
    $("ul.settings li").click(function(){
        var span=$(this).find("span[ablity='"+this.id+"']");
        var val=false;
        var key=span.attr("value");
        if(span.hasClass("checked")){
            span.removeClass("checked");
        }else{
            span.addClass("checked");
            val=true;
        }
        doSetting(key,val);
    });
    var settingName="setting.json";
    var settingPath=path.join(gui.App.dataPath,settingName);
    function doSetting(key,val){
        var fs=require('fs');
        var setting=null;
        if(fs.existsSync(settingPath)){
            var str=fs.readFileSync(settingPath,"utf8");
            if(str!=null)
                try{
                    setting=JSON.parse(str);
                }catch(e){
                    setting=null;
                }
        }
        if(setting==null){
            setting=defaultSetting;
        }
        setting[key]=val;
        fs.writeFileSync(settingPath,JSON.stringify(setting),'utf8');
    }
})(document,jQuery);