define([
	'text!modules/iom/flow/templates/flowTacheManageView.html'+codeVerP,
	'i18n!modules/iom/flow/i18n/flowDefManager.i18n',
	'modules/common/cloud-utils',
	'css!modules/iom/flow/styles/flowDefManager.css'+codeVerP
], function(flowDefManagerViewTpl, i18nproductManage,utils,css) {
	return fish.View.extend({
		order_task_grid_last_select_id:-1,
		template: fish.compile(flowDefManagerViewTpl),
		i18nData: fish.extend({}, i18nproductManage),
		catalogId:null,
		events: {
		},
		//这里用来进行dom操作
		_render: function() {
			//var userName = currentUser.userName;
			var userName = "gongyi";
			var gotoPage = "/view/flow/tache/tacheManager.html";
			var url = "http://192.168.14.157:8080/uos-manager/ssologin.do?account="+userName+"&goto="+gotoPage;
			this.$el.html(this.template(this.i18nData));
			this.$el.css("height","100%");
			this.$('#flowTacheManageIframe').attr("src",url);
			return this;
		},
		//这里用来初始化页面上要用到的fish组件
		_afterRender: function() {
			
		}
	});
});