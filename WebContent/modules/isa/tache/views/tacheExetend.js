define([
	'text!modules/isa/tache/templates/tacheExetend.html',
	'i18n!modules/isa/tache/i18n/tacheManage.i18n',
	'modules/common/cloud-utils',
	'css!modules/isa/tache/styles/tachemanagement.css'
], function(tacheManageViewTpl, i18nTache,utils,css) {
	var init=new Object();
	var iniObj = this.options;//获取父界面的值
	return fish.View.extend({
		template: fish.compile(tacheManageViewTpl),
		i18nData: fish.extend({}, i18nTache),
		events: {
			"click #isa-tache-Exe-submitBtn": "cancelExeBtn",
			"click #isa-tache-Exe-cancelBtn": "submitExeBtn",
			
		},
		
		//这里用来进行dom操作
		_render: function() {
			this.$el.html(this.template(this.i18nData));
			return this;
		},
		


		//这里用来初始化页面上要用到的fish组件
		_afterRender: function() {
			/*this.loadTacheCatalogData();
			this.ccAreaLoadData();*/
			this.init();
		},
		cancelExeBtn:function(){
			var map=new Object();
			var iniObj = this.options;//获取父界面的值
			map.tacheId=iniObj.tacheId;
			map.needNote=document.getElementById("needNote").value;
			map.initBusinessObjFormId=document.getElementById("initBusinessObjFormId").value;
			map.isforceDistill=document.getElementById("isforceDistill").value;
			map.retBussinessObjId=document.getElementById("retBussinessObjId").value;
			map.operMode=document.getElementById("operMode").value;
			utils.ajax('isaOaTacheService','addExetendTache',map).done(function(ret){
				if(ret.flag=="success"){
					fish.info('扩展环节成功');
				}else{
					fish.info('扩展环节失败');
				}
			});
			var popup=this.popup;
			popup.close();
		},
		submitExeBtn:function(){
			var popup=this.popup;
			popup.close();
		},
		init:function(){
			utils.ajax('isaOaTacheService','initExetendTache',map).done(function(ret){
				document.getElementById("needNote").value=ret.needNote;
				document.getElementById("initBusinessObjFormId").value=ret.initBusinessObjFormId;
				document.getElementById("isforceDistill").value=ret.isforceDistill;
				document.getElementById("retBussinessObjId").value=ret.retBussinessObjId;
				document.getElementById("operMode").value=ret.operMode;
			});
		},
	});	
});