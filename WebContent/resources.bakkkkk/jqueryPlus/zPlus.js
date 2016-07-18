/**
 *	jquery的扩展方法统一放置于此 
 */


//初始化floatLabel
$.fn.floatLabel=function(){
	var cssPath="/resources/bootstrap/form/form.css";
	var isInclude= $.isInclude(cssPath);
	if(!isInclude){
		$.loadExtentFile(basePath+cssPath);
	}
	
	this.each(function () {
        var $this = $(this);
        $this.parent().addClass("floatLabel-controls");
        $this.focus(function () {
            $this.next().addClass('active');
        });
        $this.blur(function () {
            if ($this.val() === '' || $this.val() === 'blank') {
                $this.next().removeClass();
            }
        });
    });
}


$.isInclude=function(name){
    var js= /js$/i.test(name);
    var es=document.getElementsByTagName(js?'script':'link');
    for(var i=0;i<es.length;i++) 
    if(es[i][js?'src':'href'].indexOf(name)!=-1)return true;
    return false;
}

//js导入文件
$.loadExtentFile=function(filePath, fileType){
    if(fileType == "js"){
        var oJs = document.create_rElement('script');        
        oJs.setAttribute("type","text/javascript");
        oJs.setAttribute("src", filename);//文件的地址 ,可为绝对及相对路径
        document.getElementsByTagName_r("head")[0].appendChild(oJs);//绑定
    }else if(fileType == "css"){
        var oCss = document.create_rElement("link"); 
        oCss.setAttribute("rel", "stylesheet"); 
        oCss.setAttribute("type", "text/css");  
        oCss.setAttribute("href", filename);
        document.getElementsByTagName_r("head")[0].appendChild(oCss);//绑定
    }
}


