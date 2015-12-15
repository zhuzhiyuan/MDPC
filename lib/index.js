/**
 * Created by john on 2015/12/14.
 */
window.isMac=process.platform.toLowerCase()=="darwin";
var gui=require("nw.gui");
var win=gui.Window.get();
var GLOBAL_TRAY=null,GLOBAL_INTERVAL=null;
/**
 * global
 */
(function($){
    $(window).on('dragover',function(e){
        var $target = $(e.target);
        if (!$target.is('textarea')){
            e.preventDefault();
            e.originalEvent.dataTransfer.dropEffect='none';
        }
    });
    $(window).on('drop',function(e){
        var $target = $(e.target);
        if (!$target.is('textarea')){
            e.preventDefault();
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
})(jQuery);




/**
 * tray
 */

var updateTray=function(count){
    if (!GLOBAL_TRAY) {
        GLOBAL_TRAY=createTray();
    }
    if (count) {
        if (!GLOBAL_INTERVAL) {
            GLOBAL_INTERVAL = setInterval(function () {
                amount();
            }, 400);
        }
    }else{
        if(GLOBAL_INTERVAL!=null){
            clearInterval(GLOBAL_INTERVAL)
            GLOBAL_INTERVAL = null;
            if (GLOBAL_TRAY)
                GLOBAL_TRAY.icon = gui.App.manifest.window.icon;
        }
    }
}
function amount(){
    if(GLOBAL_TRAY){
        if(GLOBAL_TRAY.icon=="new.png"){
            GLOBAL_TRAY.icon=gui.App.manifest.window.icon;
        }else{
            GLOBAL_TRAY.icon="new.png";
        }
    }
}

function createTray(){
    var tray=new gui.Tray({title:gui.App.manifest.title,icon:gui.App.manifest.window.icon});
    tray.tooltip='点此打开';
    var menu=new gui.Menu();
    initMenu(menu);
    tray.menu = menu;
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
    //退出
    var exitOptions={label:'退出'};
    if(isMac){
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
        win.close(true);
    });
};


//开启定时器检测是会否有新消息
setInterval(function(){
    var count = $("div.messageLittleRedDot").text();
    updateTray(count);
},1000);