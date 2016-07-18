document.write("<script language='JavaScript' src='./js/raphael.min.js'></script>");
document.write("<script language='JavaScript' src='./js/raphaelExtends.js'></script>");

var pc_normal = "./images/device/pc_normal.png";
var ONU_normal = "./images/device/ONU_normal.png";
var SPUTTER_normal = "./images/device/SPUTTER_normal.png";
var OLT_normal = "./images/device/OLT_normal.png";
var UPE_normal = "./images/device/UPE_normal.png";
var network_normal = "./images/device/network_normal.png";
var BRAS_normal = "./images/device/BRAS_normal.png";
var AAA_normal = "./images/device/AAA_normal.png";
var DNS_normal = "./images/device/DNS_normal.png";

function image(raphael, src, locationX, locationY, text) {
    var o1 = raphael.image(src, locationX, locationY, 50, 50);

    var o2 = raphael.text(locationX + 20, locationY + 50 + 15, text);

    var raphaelSet = raphael.set();
    return raphaelSet.push(o1, o2);
}

function link(raphael, from, to) {
    return raphael.connection(from, to, "green", "green");
}