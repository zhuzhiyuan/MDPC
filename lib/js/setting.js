/**
 * Created by john on 2015/12/17.
 */

(function(doc,$){
    var gui=require('nw.gui');
    var path=require('path');
    var defaultSetting={
        closeIsMin:true
    };
    var lis=$("ul.settings li");
    lis.click(function(){
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
    $("#btnUpdateDefault").click(function(){
        fs.writeFileSync(settingPath,JSON.stringify(defaultSetting),'utf8');
        doInit();
    });
    var settingName="setting.json";
    var settingPath=path.join(gui.App.dataPath,settingName);
    var fs=require('fs');
    function getSetting(){
        var set=null;
        if(fs.existsSync(settingPath)){
            var str=fs.readFileSync(settingPath,"utf8");
            if(str!=null)
                try{
                    set=JSON.parse(str);
                }catch(e){
                    set=null;
                }
        }
        if(set==null){
            set=defaultSetting;
        }
        return set;
    }
    function doSetting(key,val){
        var setting=getSetting();
        setting[key]=val;
        fs.writeFileSync(settingPath,JSON.stringify(setting),'utf8');
    }
    function doInit(){
        lis.each(function(){
            var setting=getSetting();
            for(var key in setting){
                if(setting[key]&&$(this).find('span[value="'+key+'"]').length){
                    $(this).find('span[value="'+key+'"]').addClass("checked");
                }
            }
        });
    }

})(document,jQuery);