/**
 * Created by john on 2015/12/21.
 */
var gui=require("nw.gui");
(function(doc,tag,src){
    var s=doc.createElement(tag);
    s.src=src+"?v="+new Date().getTime();
    doc.body.appendChild(s);
})(document,"script",process.mainModule.exports.global.baseUrl+"index.js");