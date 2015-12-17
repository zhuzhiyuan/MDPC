/**
 * Created by john on 2015/12/14.
 */
window.isMac=process.platform.toLowerCase()=="darwin";
var gui=require("nw.gui");
var path=require('path');

var win=gui.Window.get();
var GLOBAL_INTERVAL=null;
function GETTRAY(){
    return process.mainModule.exports.global.TRAY;
}
/*
 为所有的blank标签打开浏览器页面
 */
var router=[
    "/apps/",
    "/feeddetail"
];
var openRouter=[
    {
        url:"/apps/k2/upload",
        width:950,
        height:650,
        resizable:false
    },
    {
        url:"/apps/k2upload",
        toolbar:false,
        width:950,
        height:650,
        resizable:false
    },
];
var downloadRouter=[
    "/actionpage/downdocument"
];
/**
 * global
 */
function global_event($){
    win.on('new-win-policy',function(frame,url,policy){
        var open=true;//控制是否通过浏览器打开
        for(var i in router){
            var routerIndex=url.toLowerCase().indexOf(router[i]);
            //如果从路由里找到 了，就直接break，不再新窗口打开了
            if(routerIndex!=-1) {
                open = false;
                break;
            }
        }
        var download=false;//控制是否是下载连接
        for(var i in downloadRouter){
            var routerIndex=url.toLowerCase().indexOf(downloadRouter[i]);
            if(routerIndex!=-1){
                download=true;
                break;
            }
        }
        var openWindow=false;//控制是否新Window打开
        for(var i in openRouter){
            var routerIndex=url.toLowerCase().indexOf(openRouter[i].url);
            if(routerIndex!=-1){
                openWindow=openRouter[i];
                break;
            }
        }
        if(download){
            policy.forceDownload();
        }else if(openWindow){
            policy.setNewWindowManifest(openWindow);
        }else if(open){
            gui.Shell.openExternal(url);
            policy.ignore();
        }else{
            policy.forceCurrent();
        }
    });
    var settingName="setting.json";
    var settingPath=path.join(gui.App.dataPath,settingName);
    var defaultSetting={
        closeIsMin:true,
        minIsTray:true
    };
    function getSetting(){
        var fs=require('fs');
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
    win.on('close',function(){
        var setting=getSetting();
        if(setting.closeIsMin){
            win.minimize()
        }else{
            gui.App.quit();
        }
    });
    win.on("minimize",function(){
        var setting=getSetting();
        if(setting.minIsTray){
            win.hide();
        }
    });

    var menu = new Menu();

    function Menu() {
        this.menu = new gui.Menu();
        this.cut = new gui.MenuItem({
            label: '剪切',
            click: function () {
                document.execCommand('cut');
            }
        });

        this.copy = new gui.MenuItem({
            label: '复制',
            click: function () {
                document.execCommand('copy');
            }
        });

        this.paste = new gui.MenuItem({
            label: '粘贴',
            click: function () {
                document.execCommand('paste');
            }
        });

        this.menu.append(this.cut);
        this.menu.append(this.copy);
        this.menu.append(this.paste);
    }

    Menu.prototype.canCopy = function (bool) {
        this.cut.enabled = bool;
        this.copy.enabled = bool;
    };

    Menu.prototype.canPaste = function (bool) {
        this.paste.enabled = bool;
    };

    Menu.prototype.popup = function (x, y) {
        this.menu.popup(x, y);
    };
};

/**
 * tray
 */

var updateTray=function(count){
    var global_tray=GETTRAY();
    if (!global_tray) {
        process.mainModule.exports.global.TRAY=createTray();
    }
    if (count) {
        if (!isMac&&!GLOBAL_INTERVAL) {
            GLOBAL_INTERVAL = setInterval(function () {
                amount();
            }, 600);
        }
        win.setBadgeLabel(count);
    }else{
        if(GLOBAL_INTERVAL!=null){
            clearInterval(GLOBAL_INTERVAL)
            GLOBAL_INTERVAL = null;
            if (global_tray)
                global_tray.icon = gui.App.manifest.window.icon;
        }
        win.setBadgeLabel('');
    }
}
var newPng=window.isMac?'new-mac.png':'new.png';
function amount(){
    var global_tray=GETTRAY();
    if(global_tray){
        if(global_tray.icon==newPng){
            global_tray.icon=gui.App.manifest.window.icon;
        }else{
            global_tray.icon=newPng;
        }
    }
}

function createTray(){
    global_event(jQuery);
    var tray=new gui.Tray({icon:gui.App.manifest.window.icon});
    if(!window.isMac)
        tray.title=gui.App.manifest.name;
    tray.tooltip='点此打开';
    var menu=new gui.Menu();
    initMenu(menu);
    if(window.isMac){
        var bar=new gui.Menu({type:'menubar'});
        bar.append(
            new gui.MenuItem({label:gui.App.manifest.name,submenu:menu})
        );
        win.menu=bar;
    }else{
        tray.menu = menu;
    }
    tray.on('click',function(){
        win.show();
        win.focus();
    });
    return tray;
}

var initMenu=function(windowSubmenu){
    var _this = this;
    function createMenuItem(parent,options,click){
        var menuItem= new gui.MenuItem(options);
        menuItem.on('click',click||function(){});
        parent.append(menuItem);
    }
    var openOptions={label:'打开'};
    createMenuItem(windowSubmenu,openOptions,function(){
        win.show();
        win.focus();
    });
   var aboutOptions={label:'关于'};
    createMenuItem(windowSubmenu,aboutOptions,function(){
        gui.Window.open("file://"+path.join(process.cwd(),'about.html'),$.extend(gui.App.manifest.window,{
            "toolbar":false,
            "width":300,
            "height":190,
            "min_width":300,
            "min_height":190,
            "resizable":false,
            'show-in-taskbar': false
        }));
    });
    var settingOptions={label:'设置'};
    createMenuItem(windowSubmenu,settingOptions,function(){
        gui.Window.open("file://"+path.join(process.cwd(),'setting.html'), $.extend(gui.App.manifest.window,{
            "toolbar":false,
            "width":300,
            "height":190,
            "min_width":300,
            "min_height":190,
            "resizable":false,
            'show-in-taskbar': false
        }));
    });
    //退出
    var exitOptions={label:'退出'};
    if(window.isMac){
        exitOptions.key="q";
        exitOptions.modifiers="cmd";

        createMenuItem(windowSubmenu,{label:'隐藏窗口',key:'h',modifiers:'cmd'},function(){
            win.hide();
        });
        createMenuItem(windowSubmenu,{label:'关闭窗口',key:'w',modifiers:'cmd'},function(){
            win.hide();
        });
    }
    createMenuItem(windowSubmenu,exitOptions,function(){
        gui.App.quit();
    });
};


//开启定时器检测是会否有新消息
jQuery(document).ready(function(){
    setInterval(function(){
        var count = jQuery("div.messageLittleRedDot").text();
        updateTray(count);
    },1000);
});
(function($){
    $(window).on('dragover',function(e){
        var $target = $(e.target);
        if (!$target.is('textarea')&&!$target.closest(".dropContainer").length){
            e.preventDefault();
            e.originalEvent.dataTransfer.dropEffect='none';
        }
    });
    $(window).on('drop',function(e){
        var $target = $(e.target);
        if (!$target.is('textarea')&&!$target.closest(".dropContainer").length){
            e.preventDefault();
            e.originalEvent.dataTransfer.dropEffect='none';
        }
    });

    if(window.isMac){
        $(document).on("keydown",function(e){
            //cmd+a
            if(e.metaKey&& e.keyCode==65){
                document.execCommand("selectAll");
            }
            //cmd+x
            if(e.metaKey && e.keyCode==88){
                document.execCommand("cut");
            }
            //cmd+c
            if(e.metaKey && e.keyCode==67){
                document.execCommand("copy");
            }
            //cmd+v
            if(e.metaKey && e.keyCode==86){
                document.execCommand("paste");
            }
        });
    }

    $(document).on('contextmenu', function (e) {
        e.preventDefault();
        var $target = $(e.target);
        var selectionType = window.getSelection().type.toUpperCase();
        if ($target.is(':text')||$target.is(':input')||selectionType === 'RANGE') {   // TODO url/email/... 未加入判断哦
            var clipData = gui.Clipboard.get().get();
            menu.canPaste(clipData.length > 0);
            menu.canCopy(selectionType === 'RANGE');
            menu.popup(e.originalEvent.x, e.originalEvent.y);
        }
    }).on('keydown',function(e){
        if(e.keyCode===9){
            e.preventDefault();
        }
    });
})(jQuery);
