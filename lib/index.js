/**
 * Created by john on 2015/12/14.
 */
window.isMac=process.platform.toLowerCase()=="darwin";
var gui=require("nw.gui");
var path=require('path');

var win=gui.Window.get();
var GLOBAL_INTERVAL=null;

/*
 为所有的blank标签打开浏览器页面
 */
var router=[
    "/apps/",
    "/feeddetail",
    "/user_"
];
var openRouter=[
    {
        url:"/apps/kcupload",
        width:950,
        height:650,
        resizable:false
    }
];
var downloadRouter=[
    "/actionpage/downdocument",
    "/actionpage/loaduserlistexcel"
];


function getTray(){
    return process.mainModule.exports.global.TRAY;
}
function getBaseUrl(){
    return process.mainModule.exports.global.baseUrl;
}

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
        closeIsMin:true
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
    win.on('close',function(event){
        if(window.isMac){
            if(event=="quit")
                gui.App.quit();
            else
                win.hide();
        }else{
            var setting=getSetting();
            if(setting.closeIsMin){
                win.hide()
            }else{
                gui.App.quit();
            }
        }

    });
    win.on("restore",function(){
        win.show();
        win.focus();
    });
    gui.App.on("reopen",function(){
        updateTray(jQuery("div.messageLittleRedDot").text());
        win.show();
        win.focus();
    });

};
function Menu(tempDocument) {
    this.menu = new gui.Menu();
    this.cut = new gui.MenuItem({
        label: '剪切',
        click: function () {
            tempDocument.execCommand('cut');
        }
    });

    this.copy = new gui.MenuItem({
        label: '复制',
        click: function () {
            tempDocument.execCommand('copy');
        }
    });

    this.paste = new gui.MenuItem({
        label: '粘贴',
        click: function () {
            tempDocument.execCommand('paste');
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
var initCopyAndPaste=function(frame){
    var frameWindow=frame&&frame.contentWindow||window;
    var frameDocument=frame&&frameWindow.document||document;

    frameWindow.ondragover=function(e){
        var $target = jQuery(e.target);
        if (!$target.is('textarea')&&!$target.closest(".dropContainer").length){
            e.preventDefault();
        }
    }

    frameWindow.ondrop=function(e){
        var $target = jQuery(e.target);
        if (!$target.is('textarea')&&!$target.closest(".dropContainer").length){
            e.preventDefault();
        }
    }
    if(window.isMac){
        frameDocument.onkeydown=function(e){
            if(e.metaKey&& e.keyCode==65){
                frameDocument.execCommand("selectAll");
                e.preventDefault();
            }
            //cmd+x
            if(e.metaKey && e.keyCode==88){
                frameDocument.execCommand("cut");
                e.preventDefault();
            }
            //cmd+c
            if(e.metaKey && e.keyCode==67){
                frameDocument.execCommand("copy");
                e.preventDefault();
            }
            //cmd+v
            if(e.metaKey && e.keyCode==86){
                frameDocument.execCommand("paste");
                e.preventDefault();
            }
        }
    }
    frameDocument.oncontextmenu = function (e) {
        console.log(e);
        var $target = jQuery(e.target);
        var selectionType = frameWindow.getSelection().type.toUpperCase();
        if ($target.is(':text') || $target.is(':input') || selectionType === 'RANGE') {   // TODO url/email/... 未加入判断哦
            var clipData = gui.Clipboard.get().get();
            var menu = new Menu(frameDocument);
            menu.canPaste(clipData.length > 0);
            menu.canCopy(selectionType === 'RANGE');
            var x= e.clientX;
            var y = e.clientY;
            if(frame){
                x+= jQuery("#"+frame.id).offset().left;
                y+= jQuery("#"+frame.id).offset().top;
            }
            menu.popup(x, y);
            e.preventDefault();
        }
    }

}
//初始化根页面的复制黏贴
initCopyAndPaste();
win.on("document-end",function(frame){
    if(frame){
        initCopyAndPaste(frame);//初始化 Iframe 页面的复制黏贴
    }else{
        //initCopyAndPaste();按道理应该是在这里初始化根页面的，但是不生效，所以没办法，只能放到外面了
    }
});
/**
 * tray
 */
var newPng=window.isMac?'new-mac.png':'new.png';
var updateTray=function(count){
    var global_tray=getTray();
    if (!global_tray) {
        createTray();
    }
    if (count) {
        if (!isMac) {
            if (global_tray)
                global_tray.icon = newPng;
        }
        win.setBadgeLabel(count);
        win.requestAttention(true)
    }else{
        if (global_tray)
            global_tray.icon = gui.App.manifest.window.icon;
        win.setBadgeLabel('');
        win.requestAttention(false)
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
    process.mainModule.exports.global.TRAY = tray;
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
        gui.Window.open(getBaseUrl()+'about.html',$.extend(gui.App.manifest.window,{
            "toolbar":false,
            "width":410,
            "height":240,
            "resizable":false,
            'show-in-taskbar': false
        }));
    });
    if(!window.isMac){
        var settingOptions={label:'设置'};
        createMenuItem(windowSubmenu,settingOptions,function(){
            gui.Window.open(getBaseUrl()+'setting.html', $.extend(gui.App.manifest.window,{
                "toolbar":false,
                "width":300,
                "height":190,
                "min_width":300,
                "min_height":190,
                "resizable":false,
                'show-in-taskbar': false
            }));
        });
    }
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
    if(!getTray())createTray();

    var tip=jQuery("div.messageLittleRedDot");
    tip.bind("DOMSubtreeModified",function(e){
       updateTray(jQuery(e.target).text());
    });
});

