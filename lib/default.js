$.getScript((process.mainModule.exports.global.httpsUrl || process.mainModule.exports.global.baseUrl)+"js/fackloader.js",function(){
    var fackloader=$('<div/>').addClass("fakeloader");
    var logo=$('<div/>').addClass("logo");
    var body=$('body');
    body.append(fackloader);
    body.append(logo);
    fackloader.fakeLoader({
        timeToHide:10000000,
        bgColor:"rgb(26, 129, 229)",
        spinner:"spinner7"
    });
    var gui = require("nw.gui");
    gui.App.clearCache();
    process.mainModule.exports.global.httpsUrl="https://dn-mdpub.qbox.me/pc/";
    setTimeout(function(){
        location.href=gui.App.manifest.url;
    },500);
});