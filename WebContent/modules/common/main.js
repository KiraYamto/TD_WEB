require.config({
    //默认情况下模块所在目录
    baseUrl: '',
    //当模块id前缀为main时，他便由js/main加载模块文件
    //这里设置的路径是相对与baseUrl的，不要包含.js
    urlArgs: "v=" +  codeVer,
    echarts: 'resources/echarts'
});
requirejs.onError = function (err) {
    console.log(err.requireType);
    if (err.requireType === 'timeout') {
        console.log('modules: ' + err.requireModules);
    }

    //throw err;
};
require([
    'modules/common/app.js',

], function (app) {
    fish.View.configure({manage: true});
    $(function(){
    	app.run();
    });
    
});