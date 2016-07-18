define([
    'text!modules/common/templates/HeaderView.html'
], function (HeaderViewTpl) {
    return fish.View.extend({
        template: fish.compile(HeaderViewTpl),
        i18nData: fish.extend({},currentUser,currentJob),
        screenSizes: {
            xs: 480,
            sm: 768,
            md: 992,
            lg: 1200
        },
        events: {
            //"click .sidebar-toggle": "doActivate"，
            //"click #sign-out" : "_signout"
        },
        //这里用来进行dom操作
        _render: function () {
            this.$el.html(this.template(this.i18nData));
            //session里面拿菜单数据
            this.$el.find(".sign-out").click($.proxy(this._signout,this));
            
            this.$el.find("#com-main-control-screen").click($.proxy(this._controlScreen,this));
            
            this.$el.find("#com-main-gohome").click($.proxy(this._goHome,this));
            
            
            //this.$el.on("click",".sign-out",$.proxy(this._signout,this));
            return this;
        },
        _goHome:function(){
        	location.hash='#/';
        	location.hash='#/portal';
        	
        },
        //这里用来初始化页面上要用到的fish组件
        _afterRender: function () {

            this._doInit();
        },
        _controlScreen:function(){
        	if($('body').hasClass("fullscreen")){
        		
        		MainView.minimize();
        	}
        	else{
        		MainView.maximization();
        		
        	}
        	
        },
        _signout:function(){
        	$.post('oaas/logout').always(function(){
        		window.location.href ='./index.jsp';
        	});
        	
        },
        _doInit: function () {
        	this.thread($.proxy(function(){
        		$('#com-system-clock-content').text(fish.dateutil.format(new Date(), 'yyyy/mm/dd hh:mm:ss'));
        		
        		
        	},this),1000);
        }
    });
});
