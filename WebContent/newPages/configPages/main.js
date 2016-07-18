require.config({
    //默认情况下模块所在目录
	baseUrl: '',
    urlArgs: "v=" +  codeVer,
    //当模块id前缀为main时，他便由js/main加载模块文件
    //这里设置的路径是相对与baseUrl的，不要包含.js
    /*paths: {
        common: 'modules/common'
    }*/
});

require([
    'newPages/configPages/appfishTest.js'
], function(app) {
	//alert('app'+app);
	   fish.View.configure({manage: true});
	   $(function(){
		   app.run();   
	   });
    
});