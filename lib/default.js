if(!document.head.getElementsByTagName('link').length){
    var style=document.createElement('link');
    style.href="https://dn-mdpub.qbox.me/pc/css/index.css";
    style.rel="stylesheet";
    document.head.appendChild(style);
}
var container=document.createElement('div');
container.className="item-loader-container";
container.innerHTML='<div class="la-ball-beat la-2x"><div></div><div></div><div></div></div>';
document.body.appendChild(container);
var logo=document.createElement('div');
logo.className='logo';
document.body.appendChild(logo);

var gui = require("nw.gui");
gui.App.clearCache();
process.mainModule.exports.global.httpsUrl="https://dn-mdpub.qbox.me/pc/";
location.href=gui.App.manifest.url;
